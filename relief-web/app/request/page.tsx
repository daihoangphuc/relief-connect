"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"
import { MapPin, Loader2, AlertCircle, ChevronLeft, Send, Phone } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { api } from "@/lib/api"

const formSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
  description: z.string().min(10, "Mô tả chi tiết tình huống cần hỗ trợ"),
  address: z.string().min(5, "Vui lòng nhập địa chỉ cụ thể"),
  contact: z.string().min(10, "Vui lòng để lại số điện thoại liên hệ").optional(), // Optional but good practice
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export default function RequestPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  // Generate or retrieve requester ID
  const [requesterId, setRequesterId] = useState("")

  useEffect(() => {
    let id = localStorage.getItem("relief_requester_id")
    if (!id) {
      id = uuidv4()
      localStorage.setItem("relief_requester_id", id)
    }
    setRequesterId(id)
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      contact: "",
    },
  })

  const getLocation = () => {
    setLocationStatus("loading")
    if (!navigator.geolocation) {
      setLocationStatus("error")
      toast.error("Trình duyệt không hỗ trợ định vị")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", position.coords.latitude)
        form.setValue("longitude", position.coords.longitude)
        setLocationStatus("success")
        toast.success("Đã lấy được tọa độ vị trí")
      },
      (error) => {
        console.error(error)
        setLocationStatus("error")
        toast.error("Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập.")
      },
    )
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)

      // Default to HCMC coordinates if not provided (mock behavior fallback)
      const latitude = values.latitude || 10.762622
      const longitude = values.longitude || 106.660172

      const description = values.contact ? `${values.description}\n\nLiên hệ: ${values.contact}` : values.description

      await api.createRequest({
        requesterId,
        title: values.title,
        description,
        address: values.address,
        latitude,
        longitude,
      })

      toast.success("Yêu cầu cứu trợ đã được gửi thành công!")
      router.push("/request/success")
    } catch (error) {
      console.error(error)
      toast.error("Có lỗi xảy ra, vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-lg mx-auto py-8 px-4">
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại trang chủ
      </Link>

      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-red-500 to-rose-600" />
        <CardHeader className="space-y-1 bg-card pb-6">
          <CardTitle className="text-2xl font-bold text-center">Gửi Yêu Cầu Hỗ Trợ</CardTitle>
          <CardDescription className="text-center text-base">
            Hãy cung cấp thông tin chi tiết để chúng tôi kết nối bạn nhanh nhất.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Bạn cần hỗ trợ gì?</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Cần lương thực, nước uống, thuốc men..."
                          className="h-12 rounded-xl text-lg bg-muted/30 border-muted-foreground/20 focus-visible:ring-red-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Số điện thoại</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="090..." className="pl-9 h-11 rounded-xl bg-muted/30" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Mô tả chi tiết</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Số lượng người, tình trạng hiện tại, vật dụng cụ thể..."
                          className="min-h-[100px] rounded-xl bg-muted/30 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3 pt-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Vị trí hiện tại</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Số nhà, tên đường, phường/xã..."
                              className="pl-9 h-11 rounded-xl bg-muted/30"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={getLocation}
                    disabled={locationStatus === "loading" || locationStatus === "success"}
                    className={`w-full h-11 rounded-xl border-dashed border-2 ${
                      locationStatus === "success"
                        ? "border-green-500 text-green-600 bg-green-50 hover:bg-green-50"
                        : "border-muted-foreground/30 hover:bg-muted/50"
                    }`}
                  >
                    {locationStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang định vị...
                      </>
                    ) : locationStatus === "success" ? (
                      <>
                        <MapPin className="mr-2 h-4 w-4 fill-current" /> Đã ghim vị trí của bạn
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" /> Sử dụng GPS hiện tại
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {locationStatus === "error" && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Lỗi định vị</AlertTitle>
                  <AlertDescription>
                    Không thể lấy vị trí GPS. Vui lòng nhập địa chỉ chính xác nhất có thể.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-14 text-lg font-bold rounded-xl bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all hover:scale-[1.01]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang gửi...
                  </>
                ) : (
                  <>
                    Gửi Yêu Cầu Ngay <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Bằng việc gửi yêu cầu, bạn đồng ý chia sẻ số điện thoại và vị trí với đội cứu trợ.
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

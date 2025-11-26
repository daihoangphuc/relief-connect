"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"
import { MapPin, Loader2, AlertCircle, ChevronLeft, Send, Phone, AlertTriangle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { UrgencyLevel } from "@/types/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VoiceRequestButton } from "@/components/voice-request-button"
import { useLocation } from "@/context/location-context"


const formSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
  description: z.string().min(10, "Mô tả chi tiết tình huống cần hỗ trợ"),
  address: z.string().min(5, "Vui lòng nhập địa chỉ cụ thể"),
  urgency: z.string().optional(),
  contact: z.string().min(10, "Vui lòng để lại số điện thoại liên hệ"),
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
      urgency: "1",
      contact: "",
    },
  })

  const { latitude, longitude, address, status: globalLocationStatus, refreshLocation } = useLocation()

  // Sync global location to form when available
  useEffect(() => {
    if (globalLocationStatus === "success" && latitude && longitude) {
      form.setValue("latitude", latitude)
      form.setValue("longitude", longitude)
      if (address) {
        // Only set address if it's not already set by user (or if it's the default empty string)
        const currentAddress = form.getValues("address")
        if (!currentAddress) {
          form.setValue("address", address)
        }
      }
      setLocationStatus("success")
    }
  }, [globalLocationStatus, latitude, longitude, address, form])

  const getLocation = async () => {
    setLocationStatus("loading")
    try {
      await refreshLocation()
      // The useEffect above will handle updating the form
    } catch (error) {
      setLocationStatus("error")
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)

      // Default to HCMC coordinates if not provided (mock behavior fallback)
      const latitude = values.latitude || 10.762622
      const longitude = values.longitude || 106.660172

      const description = values.contact ? `${values.description}\n\nLiên hệ: ${values.contact}` : values.description

      const newRequest = await api.createRequest({
        requesterId,
        title: values.title,
        description,
        address: values.address,
        urgencyLevel: parseInt(values.urgency || "1") as UrgencyLevel,
        latitude,
        longitude,
      })

      toast.success("Yêu cầu cứu trợ đã được gửi thành công!")
      router.push(`/request/success?id=${newRequest.id}`)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại.", { duration: 10000 })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceData = (data: any) => {
    if (data.title) form.setValue("title", data.title)
    if (data.description) form.setValue("description", data.description)
    if (data.address) form.setValue("address", data.address)
    if (data.contact) form.setValue("contact", data.contact)
    if (data.urgency) form.setValue("urgency", String(data.urgency))

    // Auto submit after a short delay to allow state updates
    setTimeout(() => {
      toast.info("Đang tự động gửi yêu cầu...")
      form.handleSubmit(onSubmit)()
    }, 500)
  }

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 sm:py-8" suppressHydrationWarning>
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors active:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại trang chủ
      </Link>

      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-destructive to-orange-500" />
        <CardHeader className="space-y-1 bg-card pb-6">
          <CardTitle className="text-2xl font-bold text-center">Gửi Yêu Cầu Hỗ Trợ</CardTitle>
          <CardDescription className="text-center text-base">
            Hãy cung cấp thông tin chi tiết để chúng tôi kết nối bạn nhanh nhất.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 pt-0">

          <VoiceRequestButton
            onDataReceived={handleVoiceData}
            onLocationFound={(lat, lng) => {
              form.setValue("latitude", lat)
              form.setValue("longitude", lng)
              setLocationStatus("success")
            }}
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Bạn cần hỗ trợ gì?</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: Cần lương thực, nước uống, thuốc men..."
                            className="h-12 rounded-xl text-base bg-muted/30 border-muted-foreground/20 focus-visible:ring-destructive"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Mức độ khẩn cấp</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl text-base bg-muted/30 border-muted-foreground/20">
                              <SelectValue placeholder="Chọn mức độ khẩn cấp" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0" className="text-base">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500" />
                                <span>Thấp - Không gấp</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="1" className="text-base">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                <span>Trung bình - Cần hỗ trợ sớm</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="2" className="text-base">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-orange-500" />
                                <span>Cao - Cần gấp</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="3" className="text-base">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600 fill-red-100" />
                                <span className="font-semibold text-red-600">Khẩn cấp - Nguy hiểm</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Số điện thoại</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="090..." className="pl-9 h-12 rounded-xl bg-muted/30 text-base" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Vị trí hiện tại</FormLabel>
                      <FormControl>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Số nhà, tên đường, phường/xã..."
                              className="pl-9 h-12 rounded-xl bg-muted/30 text-base"
                              {...field}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={getLocation}
                            disabled={locationStatus === "loading" || locationStatus === "success"}
                            className={`h-12 px-4 rounded-xl border-2 whitespace-nowrap w-full sm:w-auto ${locationStatus === "success"
                              ? "border-green-500 text-green-600 bg-green-50 hover:bg-green-50"
                              : "border-muted-foreground/30 hover:bg-muted/50"
                              }`}
                            title="Lấy vị trí hiện tại"
                          >
                            {locationStatus === "loading" ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : locationStatus === "success" ? (
                              <MapPin className="h-5 w-5 fill-current" />
                            ) : (
                              <MapPin className="h-5 w-5" />
                            )}
                            <span className="ml-2 sm:hidden">
                              {locationStatus === "loading" ? "Đang lấy vị trí..." : locationStatus === "success" ? "Đã lấy vị trí" : "Sử dụng GPS hiện tại"}
                            </span>
                            <span className="ml-2 hidden sm:inline">
                              {locationStatus === "loading" ? "Đang lấy..." : locationStatus === "success" ? "Đã ghim" : "Dùng GPS"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Mô tả chi tiết</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Số lượng người, tình trạng hiện tại, vật dụng cụ thể..."
                            className="min-h-[120px] rounded-xl bg-muted/30 resize-none text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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

              <div className="sticky bottom-4 sm:static pt-2 sm:pt-0 z-10">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-destructive to-orange-600 hover:from-destructive/90 hover:to-orange-700 shadow-lg shadow-destructive/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
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
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4 pb-4 sm:pb-0">
                Bằng việc gửi yêu cầu, bạn đồng ý chia sẻ số điện thoại và vị trí với đội cứu trợ.
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

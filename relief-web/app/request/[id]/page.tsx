"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import { ReliefRequest, RequestStatus } from "@/types/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Phone, MapPin, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function RequestTrackingPage() {
    const params = useParams()
    const id = params.id as string
    const [request, setRequest] = useState<ReliefRequest | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchRequest = async () => {
        try {
            // Don't set loading to true on background refreshes if we already have data
            if (!request) setLoading(true)

            const data = await api.getRequestById(id)
            setRequest(data)
            setError("")
        } catch (err) {
            console.error(err)
            setError("Không tìm thấy yêu cầu hoặc có lỗi xảy ra.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchRequest()

        // Auto refresh every 30s
        const interval = setInterval(fetchRequest, 30000)
        return () => clearInterval(interval)
    }, [id])

    if (loading && !request) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
    }

    if (error) {
        return (
            <div className="container max-w-md mx-auto py-20 px-4 text-center">
                <div className="bg-destructive/10 text-destructive p-6 rounded-2xl flex flex-col items-center gap-4">
                    <AlertCircle className="h-10 w-10" />
                    <p>{error}</p>
                    <Link href="/">
                        <Button variant="outline">Về trang chủ</Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (!request) return null

    return (
        <div className="container max-w-2xl mx-auto py-8 px-4">
            <Card className="shadow-lg border-t-4 border-t-blue-500">
                <CardHeader className="text-center border-b bg-muted/20 pb-6">
                    <CardTitle className="text-xl">Theo Dõi Yêu Cầu</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-1">ID: {request.id}</p>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">

                    {/* Status Section */}
                    <div className="text-center space-y-4">
                        <h3 className="text-lg font-semibold text-foreground/80">Trạng Thái Hiện Tại</h3>
                        <div className="flex justify-center">
                            {request.status === RequestStatus.Open && (
                                <Badge variant="secondary" className="text-lg px-6 py-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 shadow-sm">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang chờ tiếp nhận
                                </Badge>
                            )}
                            {request.status === RequestStatus.InProgress && (
                                <Badge variant="default" className="text-lg px-6 py-2 bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-200">
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Đã có người nhận hỗ trợ
                                </Badge>
                            )}
                            {request.status === RequestStatus.Completed && (
                                <Badge variant="default" className="text-lg px-6 py-2 bg-green-500 hover:bg-green-600 shadow-md shadow-green-200">
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Đã hoàn thành
                                </Badge>
                            )}
                            {request.status === RequestStatus.Cancelled && (
                                <Badge variant="destructive" className="text-lg px-6 py-2">
                                    Đã hủy
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                            {request.status === RequestStatus.Open
                                ? "Hệ thống đang phát tín hiệu đến các tình nguyện viên gần khu vực của bạn."
                                : request.status === RequestStatus.InProgress
                                    ? "Tình nguyện viên đã nhận yêu cầu và đang sắp xếp di chuyển."
                                    : request.status === RequestStatus.Completed
                                        ? "Yêu cầu cứu trợ đã được đánh dấu hoàn thành."
                                        : "Yêu cầu này đã bị hủy."}
                        </p>
                    </div>

                    {/* Volunteer Info (if accepted) */}
                    {request.mission && (
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900">Đã kết nối thành công!</h3>
                                    <p className="text-xs text-blue-700">Người hỗ trợ đang xử lý yêu cầu</p>
                                </div>
                            </div>
                            <div className="pl-13 text-sm text-blue-800">
                                Hãy chú ý điện thoại, tình nguyện viên có thể liên lạc với bạn bất cứ lúc nào để xác nhận vị trí.
                            </div>
                        </div>
                    )}

                    {/* Request Details */}
                    <div className="space-y-4 pt-6 border-t">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Thông tin bạn đã gửi</h3>
                        <div className="grid gap-3 text-sm bg-muted/30 p-4 rounded-xl">
                            <div className="flex gap-3 items-start">
                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="font-medium">{request.address}</span>
                            </div>
                            <div className="flex gap-3 items-center">
                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="font-mono">{request.contactPhone || "Không có số điện thoại"}</span>
                            </div>
                            {request.description && (
                                <div className="bg-background p-3 rounded-lg border text-muted-foreground mt-2">
                                    "{request.description}"
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button variant="outline" className="flex-1 h-11" onClick={fetchRequest} disabled={loading}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading && request ? "animate-spin" : ""}`} />
                            Cập nhật trạng thái
                        </Button>
                        <Link href="/" className="flex-1">
                            <Button variant="secondary" className="w-full h-11">Về trang chủ</Button>
                        </Link>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}

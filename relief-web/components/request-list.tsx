"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { MapPin, Calendar, CheckCircle2, AlertTriangle, User, ArrowRight, RefreshCw, Flag } from "lucide-react"
import { formatDistanceToNow, isValid } from "date-fns"
import { vi } from "date-fns/locale"

import { type ReliefRequest, RequestStatus } from "@/types/api"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RequestMap } from "@/components/request-map"
import { useRealtimeRequests } from "@/hooks/use-realtime"
import { UrgencyBadge } from "@/components/urgency-badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RequestList() {
  const router = useRouter()
  const [requests, setRequests] = useState<ReliefRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("open")
  const [dialogOpen, setDialogOpen] = useState<string | null>(null)
  const [reportDialogOpen, setReportDialogOpen] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState("")

  const [donorId, setDonorId] = useState("")

  useEffect(() => {
    let id = localStorage.getItem("relief_donor_id")
    if (!id) {
      id = uuidv4()
      localStorage.setItem("relief_donor_id", id)
    }
    setDonorId(id)

    loadRequests(statusFilter)
  }, [statusFilter])

  const loadRequests = async (filter: string) => {
    try {
      setLoading(true)

      let statusParam: RequestStatus | undefined = RequestStatus.Open
      if (filter === "all") statusParam = -1 as any
      if (filter === "inprogress") statusParam = RequestStatus.InProgress

      const data = await api.getRequests(statusParam)
      setRequests(data)
    } catch (error: any) {
      console.error("Failed to load requests:", error)
      toast.error(error.message || "Không thể tải danh sách yêu cầu.", { duration: 5000 })
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  // Enable real-time updates
  useRealtimeRequests(() => {
    loadRequests(statusFilter)
  })

  const handleAccept = async (request: ReliefRequest) => {
    try {
      setAcceptingId(request.id)

      const mission = await api.acceptMission(request.id, donorId)

      const myMissions = JSON.parse(localStorage.getItem("my_missions") || "[]")
      myMissions.push({
        ...mission,
        requestDetails: request,
      })
      localStorage.setItem("my_missions", JSON.stringify(myMissions))

      toast.success("Đã nhận nhiệm vụ thành công!")
      router.push("/missions")
    } catch (error: any) {
      if (error.message.includes("Vui lòng tắt VPN")) {
        toast.error(error.message, { duration: 5000 })
      } else {
        toast.error("Không thể nhận nhiệm vụ. Có thể đã có người khác nhận.")
      }
      loadRequests(statusFilter)
    } finally {
      setAcceptingId(null)
    }
  }

  const handleReport = async (requestId: string) => {
    if (!reportReason) {
      toast.error("Vui lòng chọn lý do báo cáo")
      return
    }

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          reporterId: donorId,
          reason: reportReason,
        }),
      })

      if (!response.ok) throw new Error("Failed to report")

      toast.success("Đã gửi báo cáo. Cảm ơn bạn đã giúp giữ hệ thống an toàn!")
      setReportDialogOpen(null)
      setReportReason("")
      loadRequests(statusFilter)
    } catch (error) {
      toast.error("Không thể gửi báo cáo. Vui lòng thử lại.")
    }
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs defaultValue="open" value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="open">Đang Chờ</TabsTrigger>
            <TabsTrigger value="all">Tất Cả</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          Đang tải dữ liệu...
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium">Không tìm thấy yêu cầu nào</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            {statusFilter === "open"
              ? "Tất cả các yêu cầu đã được hỗ trợ hoặc chưa có yêu cầu mới."
              : "Không có dữ liệu trong hệ thống."}
          </p>
          <Button variant="outline" onClick={() => loadRequests(statusFilter)} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" /> Thử lại
          </Button>
        </div>
      ) : (
        <div className="space-y-4 pb-20 sm:pb-0">
          {requests.map((req) => (
            <Card
              key={req.id}
              className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-card"
            >
              <div className="flex flex-col md:flex-row md:items-stretch">
                <div
                  className={`h-1.5 md:h-auto md:w-1.5 ${req.status === RequestStatus.Open ? "bg-destructive" : "bg-muted-foreground"}`}
                />

                <div className="flex-1 p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {req.status === RequestStatus.Open ? (
                          <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5">
                            SOS
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {req.status === RequestStatus.InProgress ? "Đang hỗ trợ" : "Đã hoàn thành"}
                          </Badge>
                        )}
                        <UrgencyBadge level={req.urgencyLevel} />
                        {(req.reportCount || 0) > 0 && (
                          <Badge variant="destructive" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Bị báo cáo ({req.reportCount})
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {(() => {
                            const date = new Date(req.createdAt)
                            return isValid(date)
                              ? formatDistanceToNow(date, { addSuffix: true, locale: vi })
                              : "Vừa xong"
                          })()}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
                        {req.title}
                      </h3>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-2.5 rounded-lg">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                        <span className="line-clamp-2">{req.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span>{req.status === RequestStatus.Open ? "Cần hỗ trợ ngay" : "Đã có người nhận"}</span>
                    </div>

                    {req.status === RequestStatus.Open && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Dialog open={dialogOpen === req.id} onOpenChange={(open) => setDialogOpen(open ? req.id : null)}>
                          <DialogTrigger asChild>
                            <Button className="flex-1 sm:flex-none rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 sm:h-10 px-6 font-medium text-base sm:text-sm">
                              Xem & Nhận Hỗ Trợ <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 gap-0">
                            <DialogHeader className="mb-4">
                              <DialogTitle>Xác nhận nhận nhiệm vụ</DialogTitle>
                              <DialogDescription>
                                Bạn đang nhận hỗ trợ cho trường hợp này. Vui lòng đảm bảo bạn có đủ khả năng để giúp đỡ.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="p-4 bg-muted/30 rounded-2xl space-y-3 border border-border/50">
                                <div className="font-semibold text-lg">{req.title}</div>
                                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                                  {req.description}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium pt-2 text-primary">
                                  <MapPin className="h-4 w-4" /> {req.address}
                                </div>
                              </div>

                              {/* Map Display */}
                              <div className="w-full h-[250px] sm:h-[300px] rounded-2xl overflow-hidden border border-border">
                                <RequestMap
                                  latitude={req.latitude}
                                  longitude={req.longitude}
                                  address={req.address}
                                />
                              </div>

                              <div className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-900 flex gap-3">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <p>
                                  Hãy đảm bảo an toàn cho bản thân khi tham gia cứu trợ. Liên hệ chính quyền nếu khu vực
                                  nguy hiểm.
                                </p>
                              </div>
                            </div>

                            <DialogFooter className="mt-6 gap-2 sm:gap-0">
                              <Button
                                variant="outline"
                                onClick={() => setDialogOpen(null)}
                                className="rounded-xl h-12 sm:h-11 w-full sm:w-auto order-2 sm:order-1"
                              >
                                Đóng
                              </Button>
                              <Button
                                onClick={() => {
                                  handleAccept(req)
                                  setDialogOpen(null)
                                }}
                                disabled={acceptingId === req.id}
                                className="bg-primary hover:bg-primary/90 rounded-xl h-12 sm:h-11 w-full sm:w-auto order-1 sm:order-2 text-base font-semibold"
                              >
                                {acceptingId === req.id ? "Đang xử lý..." : "Tôi Nhận Nhiệm Vụ Này"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={reportDialogOpen === req.id} onOpenChange={(open) => {
                          setReportDialogOpen(open ? req.id : null)
                          if (!open) setReportReason("")
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-11 w-11 sm:h-10 sm:w-10 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" title="Báo cáo vi phạm">
                              <Flag className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Báo cáo yêu cầu này</DialogTitle>
                              <DialogDescription>
                                Nếu bạn thấy yêu cầu này là spam, giả mạo hoặc không phù hợp, hãy báo cáo cho chúng tôi.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Lý do báo cáo</label>
                                <Select value={reportReason} onValueChange={setReportReason}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn lý do" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="spam">Spam / Spam liên tục</SelectItem>
                                    <SelectItem value="fake">Thông tin giả mạo</SelectItem>
                                    <SelectItem value="inappropriate">Nội dung không phù hợp</SelectItem>
                                    <SelectItem value="other">Khác</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="ghost" onClick={() => setReportDialogOpen(null)}>Hủy</Button>
                              <Button variant="destructive" onClick={() => handleReport(req.id)} disabled={!reportReason}>Gửi báo cáo</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

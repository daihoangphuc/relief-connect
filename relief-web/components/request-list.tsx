"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { MapPin, Calendar, CheckCircle2, AlertTriangle, User, ArrowRight, RefreshCw, WifiOff } from "lucide-react"
import { formatDistanceToNow, isValid } from "date-fns"
import { vi } from "date-fns/locale"

import { type ReliefRequest, RequestStatus } from "@/types/api"
import { api, MOCK_REQUESTS } from "@/lib/api"
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

export function RequestList() {
  const router = useRouter()
  const [requests, setRequests] = useState<ReliefRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [isUsingMock, setIsUsingMock] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("open")
  const [dialogOpen, setDialogOpen] = useState<string | null>(null)

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
      setIsUsingMock(false)

      let statusParam: RequestStatus | undefined = RequestStatus.Open
      if (filter === "all") statusParam = -1 as any
      if (filter === "inprogress") statusParam = RequestStatus.InProgress

      const data = await api.getRequests(statusParam)
      setRequests(data)
    } catch (error) {
      console.error("Failed to load requests:", error)
      setIsUsingMock(true)

      let mocks = MOCK_REQUESTS
      if (filter === "open") mocks = MOCK_REQUESTS.filter((r) => r.status === RequestStatus.Open)

      setRequests(mocks)
      toast.error("Không kết nối được với máy chủ. Đang hiển thị dữ liệu mẫu.")
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (request: ReliefRequest) => {
    try {
      setAcceptingId(request.id)

      let mission
      if (isUsingMock) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        mission = {
          id: uuidv4(),
          requestId: request.id,
          donorId,
          startedAt: new Date().toISOString(),
        }
      } else {
        mission = await api.acceptMission(request.id, donorId)
      }

      const myMissions = JSON.parse(localStorage.getItem("my_missions") || "[]")
      myMissions.push({
        ...mission,
        requestDetails: request,
      })
      localStorage.setItem("my_missions", JSON.stringify(myMissions))

      toast.success("Đã nhận nhiệm vụ thành công!")
      router.push("/missions")
    } catch (error) {
      toast.error("Không thể nhận nhiệm vụ. Có thể đã có người khác nhận.")
      loadRequests(statusFilter)
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs defaultValue="open" value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="open">Đang Chờ ({isUsingMock ? "Demo" : "Real"})</TabsTrigger>
            <TabsTrigger value="all">Tất Cả</TabsTrigger>
          </TabsList>
        </Tabs>

        {isUsingMock && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <WifiOff className="h-4 w-4" />
            <span className="font-medium">Chế độ Demo (Mất kết nối)</span>
          </div>
        )}
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
        <div className="space-y-4">
          {requests.map((req) => (
            <Card
              key={req.id}
              className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-card"
            >
              <div className="flex flex-col md:flex-row md:items-stretch">
                <div
                  className={`h-2 md:h-auto md:w-2 ${req.status === RequestStatus.Open ? "bg-red-500" : "bg-gray-400"}`}
                />

                <div className="flex-1 p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {req.status === RequestStatus.Open ? (
                          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                            SOS Khẩn cấp
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            {req.status === RequestStatus.InProgress ? "Đang hỗ trợ" : "Đã hoàn thành"}
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
                      <h3 className="text-xl font-bold text-foreground leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                        {req.title}
                      </h3>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-2.5 rounded-lg">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                        <span className="line-clamp-2">{req.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center border">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <span>{req.status === RequestStatus.Open ? "Cần hỗ trợ ngay" : "Đã có người nhận"}</span>
                    </div>

                    {req.status === RequestStatus.Open && (
                      <Dialog open={dialogOpen === req.id} onOpenChange={(open) => setDialogOpen(open ? req.id : null)}>
                        <DialogTrigger asChild>
                          <Button className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 shadow-blue-100 dark:shadow-none h-10 px-6 font-medium">
                            Xem & Nhận Hỗ Trợ <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                          <DialogHeader>
                            <DialogTitle>Xác nhận nhận nhiệm vụ</DialogTitle>
                            <DialogDescription>
                              Bạn đang nhận hỗ trợ cho trường hợp này. Vui lòng đảm bảo bạn có đủ khả năng để giúp đỡ.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="py-4 space-y-4">
                            <div className="p-4 bg-muted/50 rounded-2xl space-y-3">
                              <div className="font-semibold text-lg">{req.title}</div>
                              <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                                {req.description}
                              </div>
                              <div className="flex items-center gap-2 text-sm font-medium pt-2 text-blue-600">
                                <MapPin className="h-4 w-4" /> {req.address}
                              </div>
                            </div>

                            {/* Map Display */}
                            <div className="w-full h-[300px] rounded-2xl overflow-hidden border-2 border-muted">
                              <RequestMap
                                latitude={req.latitude}
                                longitude={req.longitude}
                                address={req.address}
                              />
                            </div>

                            <div className="text-sm text-amber-700 bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                              <AlertTriangle className="h-5 w-5 shrink-0" />
                              <p>
                                Hãy đảm bảo an toàn cho bản thân khi tham gia cứu trợ. Liên hệ chính quyền nếu khu vực
                                nguy hiểm.
                              </p>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDialogOpen(null)}
                              className="rounded-xl h-11"
                            >
                              Đóng
                            </Button>
                            <Button
                              onClick={() => {
                                handleAccept(req)
                                setDialogOpen(null)
                              }}
                              disabled={acceptingId === req.id}
                              className="bg-blue-600 hover:bg-blue-700 rounded-xl h-11 w-full sm:w-auto"
                            >
                              {acceptingId === req.id ? "Đang xử lý..." : "Tôi Nhận Nhiệm Vụ Này"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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

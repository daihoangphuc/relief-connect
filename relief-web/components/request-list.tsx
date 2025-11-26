"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { MapPin, Calendar, CheckCircle2, AlertTriangle, User, ArrowRight, RefreshCw, Flag, ImageIcon, X, Map, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow, isValid } from "date-fns"
import { vi } from "date-fns/locale"

import { type ReliefRequest, RequestStatus, UrgencyLevel } from "@/types/api"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

import { motion, AnimatePresence } from "framer-motion"
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
import Image from "next/image"

import { supabase } from "@/lib/supabase"

export function RequestList() {
  const router = useRouter()

  const [requests, setRequests] = useState<ReliefRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [completeDialogOpen, setCompleteDialogOpen] = useState<string | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)

  const [statusFilter, setStatusFilter] = useState<string>("open")
  const [dialogOpen, setDialogOpen] = useState<string | null>(null)
  const [reportDialogOpen, setReportDialogOpen] = useState<string | null>(null)
  const [proofDialogOpen, setProofDialogOpen] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState("")

  // Pagination & Location State
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const [donorId, setDonorId] = useState("")

  useEffect(() => {
    let id = localStorage.getItem("relief_donor_id")
    if (!id) {
      id = uuidv4()
      localStorage.setItem("relief_donor_id", id)
    }
    setDonorId(id)

    loadRequests(statusFilter, currentPage, userLocation)
  }, [statusFilter, currentPage, userLocation]) // Reload when these change

  const loadRequests = async (filter: string, page: number, location: { lat: number; lng: number } | null) => {
    try {
      setLoading(true)

      let statusParam: RequestStatus | undefined = undefined

      // Map filter to API status param
      if (filter === "urgent" || filter === "open") statusParam = RequestStatus.Open
      else if (filter === "inprogress") statusParam = RequestStatus.InProgress
      else if (filter === "completed") statusParam = RequestStatus.Completed
      else if (filter === "all") statusParam = -1 as any

      const response = await api.getRequests(
        statusParam,
        page,
        5, // Limit per page
        location?.lat,
        location?.lng
      )

      let filteredData = response.data

      // Client-side filtering for specific tabs if needed (though API handles status)
      if (filter === "urgent") {
        filteredData = filteredData.filter(r => r.urgencyLevel >= UrgencyLevel.High)
      }

      setRequests(filteredData)
      setTotalPages(response.totalPages)
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
    loadRequests(statusFilter, currentPage, userLocation)
  })

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt của bạn không hỗ trợ định vị.")
      return
    }

    setIsLocating(true)
    toast.info("Đang lấy vị trí của bạn...")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setCurrentPage(1) // Reset to page 1
        setIsLocating(false)
        toast.success("Đã tìm thấy vị trí! Đang lọc yêu cầu gần bạn (10km).")
      },
      (error) => {


        setIsLocating(false)
        let msg = "Không thể lấy vị trí."
        if (error.code === 1) msg = "Bạn đã từ chối quyền truy cập vị trí. Vui lòng kiểm tra cài đặt trình duyệt."
        else if (error.code === 2) msg = "Vị trí không khả dụng. Hãy kiểm tra GPS của bạn."
        else if (error.code === 3) msg = "Hết thời gian chờ lấy vị trí. Vui lòng thử lại."
        else msg = "Lỗi không xác định. Vui lòng tắt các tiện ích (Extension) chặn vị trí và thử lại."

        toast.error(msg)

        // Fallback for testing/demo if permission denied
        toast.info("Đang sử dụng vị trí giả lập (TP.HCM) để demo tính năng.")
        setUserLocation({ lat: 10.7769, lng: 106.7009 }) // Ho Chi Minh City
        setCurrentPage(1)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const clearLocationFilter = () => {
    setUserLocation(null)
    setCurrentPage(1)
    toast.info("Đã tắt chế độ lọc theo vị trí.")
  }

  const handleAccept = async (request: ReliefRequest) => {
    try {
      setAcceptingId(request.id)
      await api.acceptMission(request.id, donorId)
      toast.success("Đã nhận nhiệm vụ thành công!")
      setDialogOpen(null)
      // Switch to In Progress tab and reset page
      setStatusFilter("inprogress")
      setCurrentPage(1)
    } catch (error: any) {
      toast.error("Không thể nhận nhiệm vụ. Có thể đã có người khác nhận.")
      loadRequests(statusFilter, currentPage, userLocation)
    } finally {
      setAcceptingId(null)
    }
  }

  const handleComplete = async (requestId: string, missionId: string) => {
    try {
      setUploading(true)
      let imageUrl = undefined

      if (proofFile) {
        const fileName = `${missionId}-${Date.now()}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("proof-images")
          .upload(fileName, proofFile)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from("proof-images")
          .getPublicUrl(fileName)

        imageUrl = publicUrlData.publicUrl
      }

      await api.completeMission(missionId, imageUrl)
      toast.success("Đã hoàn thành nhiệm vụ! Cảm ơn bạn.")
      setCompleteDialogOpen(null)
      setProofFile(null)
      // Switch to Completed tab and reset page
      setStatusFilter("completed")
      setCurrentPage(1)
    } catch (error) {
      console.error("Error completing mission:", error)
      toast.error("Lỗi khi hoàn thành nhiệm vụ")
    } finally {
      setUploading(false)
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
      loadRequests(statusFilter, currentPage, userLocation)
    } catch (error) {
      toast.error("Không thể gửi báo cáo. Vui lòng thử lại.")
    }
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-14 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:static sm:bg-transparent sm:py-0">
        <div className="flex p-1 bg-muted/50 rounded-xl w-full sm:w-auto relative isolate">
          {[
            { id: "open", label: "Cần Hỗ Trợ" },
            { id: "inprogress", label: "Đang Thực Hiện" },
            { id: "completed", label: "Đã Xong" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id)
                setCurrentPage(1)
              }}
              className={`relative flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-colors rounded-lg ${statusFilter === tab.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {statusFilter === tab.id && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-primary rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {userLocation ? (
            <Button variant="secondary" onClick={clearLocationFilter} className="w-full sm:w-auto bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
              <MapPin className="h-4 w-4 mr-2" />
              Gần bạn (10km) <X className="h-3 w-3 ml-2 opacity-50" />
            </Button>
          ) : (
            <Button variant="outline" onClick={handleFindNearMe} disabled={isLocating} className="w-full sm:w-auto">
              {isLocating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Map className="h-4 w-4 mr-2" />}
              Tìm quanh đây
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2"
          >
            <RefreshCw className="h-6 w-6 animate-spin" />
            Đang tải dữ liệu...
          </motion.div>
        ) : requests.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-12 border rounded-2xl bg-muted/20"
          >
            <div className="bg-background p-4 rounded-full inline-flex mb-4 shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold">Không tìm thấy yêu cầu nào</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              {userLocation
                ? "Không có yêu cầu nào trong bán kính 10km quanh bạn."
                : statusFilter === "open"
                  ? "Tuyệt vời! Hiện không có yêu cầu hỗ trợ nào."
                  : "Không có dữ liệu trong danh mục này."}
            </p>
            <Button variant="outline" onClick={() => loadRequests(statusFilter, currentPage, userLocation)} className="mt-6 rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" /> Thử lại
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={statusFilter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 pb-20 sm:pb-0"
          >
            {requests.map((req, index) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="group overflow-hidden border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 rounded-2xl bg-card"
                >
                  <div className="flex flex-col md:flex-row md:items-stretch">
                    <div
                      className={`h-1.5 md:h-auto md:w-1.5 transition-colors ${req.status === RequestStatus.Open ? "bg-destructive" :
                        req.status === RequestStatus.InProgress ? "bg-amber-500" : "bg-green-500"
                        }`}
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
                              <Badge variant={req.status === RequestStatus.Completed ? "default" : "secondary"} className={req.status === RequestStatus.Completed ? "bg-green-600 hover:bg-green-700" : ""}>
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
                            <span className="text-xs text-muted-foreground flex items-center bg-muted/50 px-2 py-1 rounded-full">
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
                          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
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
                          <span>
                            {req.status === RequestStatus.Open ? "Cần hỗ trợ ngay" :
                              req.status === RequestStatus.InProgress ? "Đang được tình nguyện viên hỗ trợ" : "Đã được cứu trợ thành công"}
                          </span>
                        </div>

                      </div>

                      <div className="flex gap-2 w-full sm:w-auto mt-4">
                        {/* In Progress Actions */}
                        {req.status === RequestStatus.InProgress && req.mission?.donorId === donorId && (
                          <div className="flex gap-2 w-full">
                            <Button
                              variant="outline"
                              className="flex-1 sm:flex-none rounded-xl"
                              asChild
                            >
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${req.latitude},${req.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Map className="h-4 w-4 mr-2" />
                                Chỉ đường
                              </a>
                            </Button>

                            <Dialog open={completeDialogOpen === req.id} onOpenChange={(open) => setCompleteDialogOpen(open ? req.id : null)}>
                              <DialogTrigger asChild>
                                <Button className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-600/20">
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Hoàn thành
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Xác nhận hoàn thành</DialogTitle>
                                  <DialogDescription>
                                    Vui lòng tải lên hình ảnh minh chứng để hoàn tất nhiệm vụ.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Hình ảnh minh chứng</label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    onClick={() => req.mission && handleComplete(req.id, req.mission.id)}
                                    disabled={uploading || !proofFile}
                                    className="w-full"
                                  >
                                    {uploading ? "Đang xử lý..." : "Xác nhận & Gửi"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}

                        {/* Show message if mission is handled by someone else */}
                        {req.status === RequestStatus.InProgress && req.mission?.donorId && req.mission.donorId !== donorId && (
                          <div className="w-full mt-2 p-3 bg-muted/50 rounded-xl border border-border/50 text-sm text-muted-foreground italic text-center">
                            Nhiệm vụ này đang được thực hiện bởi tình nguyện viên khác.
                          </div>
                        )}

                        {/* Show Proof Button for Completed Requests */}
                        {req.status === RequestStatus.Completed && req.proofImage && (
                          <Dialog open={proofDialogOpen === req.id} onOpenChange={(open) => setProofDialogOpen(open ? req.id : null)}>
                            <DialogTrigger asChild>
                              <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border shadow-sm hover:shadow-md hover:ring-2 hover:ring-primary/50 transition-all group/thumb" title="Xem ảnh chứng minh">
                                <Image
                                  src={req.proofImage}
                                  alt="Bằng chứng"
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                  unoptimized
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/thumb:bg-black/20 transition-colors">
                                  <ImageIcon className="h-5 w-5 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity drop-shadow-md" />
                                </div>
                              </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background border text-foreground shadow-2xl">
                              <DialogHeader className="sr-only">
                                <DialogTitle>Hình ảnh chứng minh hoàn thành nhiệm vụ</DialogTitle>
                              </DialogHeader>
                              <div className="relative w-full h-[80vh] flex items-center justify-center bg-muted/10">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground hover:bg-muted/20 z-50 rounded-full bg-background/50 backdrop-blur-sm"
                                  onClick={() => setProofDialogOpen(null)}
                                >
                                  <X className="h-6 w-6" />
                                </Button>
                                <div className="relative w-full h-full p-4">
                                  <Image
                                    src={req.proofImage}
                                    alt="Proof of completion"
                                    fill
                                    className="object-contain"
                                    unoptimized // Allow external images
                                  />
                                </div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t">
                                <p className="text-sm font-medium text-center text-muted-foreground">Hình ảnh chứng minh hoàn thành nhiệm vụ</p>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {req.status === RequestStatus.Open && (
                          <Dialog open={dialogOpen === req.id} onOpenChange={(open) => setDialogOpen(open ? req.id : null)}>
                            <DialogTrigger asChild>
                              <Button className="flex-1 sm:flex-none rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 sm:h-10 px-6 font-medium text-base sm:text-sm">
                                Xem Chi Tiết <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 gap-0">
                              <DialogHeader className="mb-4">
                                <DialogTitle>Chi tiết yêu cầu cứu trợ</DialogTitle>
                                <DialogDescription>
                                  Vui lòng liên hệ trực tiếp với người cần giúp đỡ để xác nhận thông tin và hỗ trợ.
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

                                {/* Contact Info Highlight */}
                                {req.contactPhone && (
                                  <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-2xl border border-green-200 dark:border-green-900 text-center">
                                    <p className="text-sm text-green-800 dark:text-green-300 mb-1 font-medium">Liên hệ trực tiếp để hỗ trợ</p>
                                    <a href={`tel:${req.contactPhone}`} className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400 hover:underline block py-1">
                                      {req.contactPhone}
                                    </a>
                                  </div>
                                )}

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
                                  onClick={() => handleAccept(req)}
                                  disabled={acceptingId === req.id}
                                  className="bg-primary hover:bg-primary/90 rounded-xl h-12 sm:h-11 w-full sm:w-auto order-1 sm:order-2 text-base font-semibold"
                                >
                                  {acceptingId === req.id ? "Đang xử lý..." : "Nhận nhiệm vụ"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Only show report button if user hasn't reported yet AND request hasn't been reported by anyone */}
                        {(!req.reporterIds?.includes(donorId) && (req.reportCount || 0) === 0) && (
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
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>{/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="rounded-xl"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Trước
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="rounded-xl"
          >
            Sau <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

    </div>

  )
}


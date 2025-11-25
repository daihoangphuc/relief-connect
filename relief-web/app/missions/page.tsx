"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, CheckCircle2, MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { toast } from "sonner"
import type { ReliefRequest } from "@/types/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProofUpload } from "@/components/proof-upload"

interface Mission {
  id: string
  requestId: string
  requestDetails?: ReliefRequest
  completedAt?: string
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [proofDialogOpen, setProofDialogOpen] = useState<string | null>(null)

  useEffect(() => {
    // Load missions from local storage
    const stored = localStorage.getItem("my_missions")
    if (stored) {
      setMissions(JSON.parse(stored))
    }
  }, [])

  const handleComplete = async (mission: Mission, proofUrl?: string) => {
    try {
      setCompletingId(mission.id)
      await api.completeMission(mission.id, proofUrl)

      // Update local state
      const updatedMissions = missions.map((m) =>
        m.id === mission.id ? { ...m, completedAt: new Date().toISOString() } : m,
      )
      setMissions(updatedMissions)
      localStorage.setItem("my_missions", JSON.stringify(updatedMissions))

      toast.success("Đã hoàn thành nhiệm vụ! Cảm ơn bạn.")
      setProofDialogOpen(null)
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật trạng thái", { duration: 10000 })
    } finally {
      setCompletingId(null)
    }
  }

  const openMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank")
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nhiệm vụ của tôi</h1>
          <p className="text-muted-foreground">Lịch sử cứu trợ của bạn</p>
        </div>
      </div>

      {missions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">Bạn chưa nhận nhiệm vụ nào.</p>
          <Link href="/volunteer" className="mt-4 inline-block">
            <Button>Tìm người cần giúp</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => (
            <Card
              key={mission.id}
              className={mission.completedAt ? "opacity-75 bg-muted/30" : "border-blue-200 dark:border-blue-800"}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{mission.requestDetails?.title || "Nhiệm vụ cứu trợ"}</CardTitle>
                  {mission.completedAt ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                      Đã hoàn thành
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-600 hover:bg-blue-700">Đang thực hiện</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-3">
                <p className="text-sm">{mission.requestDetails?.description}</p>
                {mission.requestDetails && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{mission.requestDetails.address}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="gap-2 pt-0">
                {!mission.completedAt && mission.requestDetails && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent h-11 sm:h-10"
                        onClick={() => openMaps(mission.requestDetails!.latitude, mission.requestDetails!.longitude)}
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Chỉ đường
                      </Button>
                      <Dialog open={proofDialogOpen === mission.id} onOpenChange={(open) => setProofDialogOpen(open ? mission.id : null)}>
                        <DialogTrigger asChild>
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 h-11 sm:h-10"
                            disabled={completingId === mission.id}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Hoàn thành
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Xác nhận hoàn thành</DialogTitle>
                            <DialogDescription>
                              Vui lòng tải lên hình ảnh chứng minh bạn đã hoàn thành nhiệm vụ cứu trợ.
                            </DialogDescription>
                          </DialogHeader>
                          <ProofUpload
                            missionId={mission.id}
                            onUploadComplete={(url) => handleComplete(mission, url)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

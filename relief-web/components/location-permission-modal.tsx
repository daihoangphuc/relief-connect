"use client"

import { useEffect, useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MapPin, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export function LocationPermissionModal() {
    const [open, setOpen] = useState(false)
    const [errorType, setErrorType] = useState<"permission" | "unavailable" | null>(null)

    useEffect(() => {
        if (!navigator.geolocation) return

        // 1. Check Permission Status API (for explicit denial)
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: "geolocation" }).then((result) => {
                if (result.state === "denied") {
                    setErrorType("permission")
                    setOpen(true)
                }

                result.onchange = () => {
                    if (result.state === "denied") {
                        setErrorType("permission")
                        setOpen(true)
                    } else if (result.state === "granted") {
                        setOpen(false)
                    }
                }
            })
        }

        // 2. Watch Position (detects if GPS is turned off system-wide)
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                // Success - GPS is on and working
                setOpen(false)
                setErrorType(null)
            },
            (error) => {
                // Suppress console error for expected states to avoid spamming
                if (error.code === error.PERMISSION_DENIED) {
                    setErrorType("permission")
                    setOpen(true)
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    setErrorType("unavailable")
                    setOpen(true)
                } else {
                    console.warn("Location watch warning:", error.message)
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )

        return () => {
            navigator.geolocation.clearWatch(watchId)
        }
    }, [])

    const handleRequestLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Trình duyệt không hỗ trợ định vị.")
            return
        }

        navigator.geolocation.getCurrentPosition(
            () => {
                setOpen(false)
                toast.success("Đã bật định vị thành công!")
            },
            (error) => {
                console.error("Manual location request error:", error)
                if (error.code === error.PERMISSION_DENIED) {
                    toast.error("Bạn đã từ chối quyền. Vui lòng bật lại trong cài đặt trình duyệt.")
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    toast.error("Không thể lấy vị trí. Hãy kiểm tra GPS trên thiết bị.")
                }
            },
            { enableHighAccuracy: true }
        )
    }

    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        {errorType === "permission" ? "Yêu cầu quyền truy cập" : "Cần bật GPS"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base">
                        {errorType === "permission"
                            ? "Bạn đã chặn quyền truy cập vị trí. Ứng dụng cần biết vị trí của bạn để kết nối với đội cứu trợ."
                            : "Hệ thống phát hiện GPS đang bị tắt hoặc không khả dụng. Vui lòng bật GPS để tiếp tục."
                        }
                        <br /><br />
                        <span className="font-medium text-foreground">
                            Vui lòng bật định vị để đảm bảo an toàn cho bạn.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleRequestLocation} className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        <MapPin className="mr-2 h-4 w-4" />
                        Bật định vị ngay
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

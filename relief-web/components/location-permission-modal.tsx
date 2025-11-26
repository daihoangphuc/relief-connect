"use client"

import { useEffect, useState } from "react"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useLocation } from "@/context/location-context"

export function LocationPermissionModal() {
    const { status, refreshLocation, error } = useLocation()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        // Show modal if location is not yet available or there was an error
        // But give it a moment to try auto-fetching first
        const timer = setTimeout(() => {
            if (status === "idle" || status === "error") {
                setOpen(true)
            }
        }, 1000)

        return () => clearTimeout(timer)
    }, [status])

    // Close modal when status becomes success
    useEffect(() => {
        if (status === "success") {
            setOpen(false)
        }
    }, [status])

    const handleEnableLocation = async () => {
        await refreshLocation()
        // If successful, the useEffect above will close the modal
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <div className="mx-auto bg-blue-100 p-3 rounded-full mb-4">
                        <Navigation className="h-8 w-8 text-blue-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">Cho phép truy cập vị trí</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Để hỗ trợ cứu trợ nhanh nhất, chúng tôi cần biết vị trí chính xác của bạn.
                        Vui lòng bật GPS để tiếp tục.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                        {error}
                        <br />
                        <span className="text-xs text-muted-foreground">Hãy kiểm tra cài đặt trình duyệt của bạn.</span>
                    </div>
                )}

                <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
                    <Button
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={handleEnableLocation}
                    >
                        <MapPin className="mr-2 h-5 w-5" /> Bật Vị Trí Ngay
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        onClick={() => setOpen(false)}
                    >
                        Tôi sẽ nhập địa chỉ thủ công
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import { useState, useEffect } from "react"
import { MapPin, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function LocationIndicator() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [address, setAddress] = useState<string>("")

    const requestLocation = (highAccuracy: boolean) => {
        setStatus("loading")
        if (!navigator.geolocation) {
            setStatus("error")
            toast.error("Trình duyệt không hỗ trợ định vị")
            return
        }

        try {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords
                    setLocation({ lat: latitude, lng: longitude })
                    setStatus("success")

                    // Call Nominatim API for reverse geocoding
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                            {
                                headers: {
                                    "User-Agent": "ReliefConnect/1.0",
                                    "Accept-Language": "vi"
                                }
                            }
                        )

                        if (response.ok) {
                            const data = await response.json()
                            const addressParts = []

                            if (data.address) {
                                const addr = data.address;
                                // Only show City/State as requested
                                const cityOrState = addr.city || addr.state || addr.province || "";

                                if (cityOrState) {
                                    addressParts.push(cityOrState);
                                } else {
                                    // Fallback if city/state is not found
                                    addressParts.push(addr.district || addr.town || "Không xác định");
                                }
                            }

                            const formattedAddress = addressParts.length > 0
                                ? addressParts.join(", ")
                                : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`

                            setAddress(formattedAddress)
                            toast.success(`Đã cập nhật: ${formattedAddress}`)
                        } else {
                            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                            toast.success("Đã cập nhật vị trí (Không lấy được tên đường)")
                        }
                    } catch (error) {
                        console.error("Reverse geocoding error:", error)
                        setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                        toast.success("Đã cập nhật vị trí")
                    }
                },
                (error) => {
                    console.warn("Geolocation error:", error)
                    if (highAccuracy) {
                        console.log("Retrying with low accuracy...")
                        requestLocation(false)
                    } else {
                        setStatus("error")
                        toast.error("Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập.")
                    }
                },
                { enableHighAccuracy: highAccuracy, timeout: 5000, maximumAge: 0 }
            )
        } catch (error) {
            console.error("Geolocation error:", error)
            setStatus("error")
        }
    }

    const getLocation = () => requestLocation(true)

    // Auto-get location on mount if permission is already granted
    useEffect(() => {
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: "geolocation" })
                .then((result) => {
                    if (result.state === "granted") {
                        getLocation()
                    }
                })
                .catch((error) => {
                    console.warn("Permission query failed:", error)
                })
        }
    }, [])

    return (
        <div className="flex items-center gap-2">
            {status === "success" || status === "loading" ? (
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/30 px-2 sm:px-3 py-1.5 rounded-full border border-border/50 animate-in fade-in zoom-in duration-300">
                    <MapPin className="h-4 w-4 text-destructive" />
                    <span className="max-w-[80px] sm:max-w-[150px] truncate inline-block">
                        {status === "loading" ? "Đang định vị..." : address || "Vị trí hiện tại"}
                    </span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 ml-1 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                    onClick={getLocation}
                                    disabled={status === "loading"}
                                >
                                    <RefreshCw className={`h-3 w-3 ${status === "loading" ? "animate-spin" : ""}`} />
                                    <span className="sr-only">Cập nhật vị trí</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Cập nhật vị trí</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={getLocation}
                    className="text-muted-foreground hover:text-foreground gap-2 px-3 py-1.5 h-auto rounded-full hover:bg-muted/50"
                >
                    <MapPin className="h-4 w-4" />
                    <span className="inline">Bật vị trí</span>
                </Button>
            )}
        </div>
    )
}

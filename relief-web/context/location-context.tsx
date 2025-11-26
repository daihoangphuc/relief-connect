"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { toast } from "sonner"

interface LocationState {
    latitude: number | null
    longitude: number | null
    address: string | null
    status: "idle" | "loading" | "success" | "error"
    error: string | null
    refreshLocation: () => Promise<void>
    updateLocation: (lat: number, lng: number) => Promise<void>
}

const LocationContext = createContext<LocationState | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)
    const [address, setAddress] = useState<string | null>(null)
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [error, setError] = useState<string | null>(null)

    const fetchAddress = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
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
                    // Prioritize City/Province/State
                    const cityOrState = addr.city || addr.state || addr.province || "";

                    if (cityOrState) {
                        addressParts.push(cityOrState);
                    } else {
                        addressParts.push(addr.district || addr.town || "Không xác định");
                    }
                }

                const formattedAddress = addressParts.length > 0
                    ? addressParts.join(", ")
                    : `${lat.toFixed(4)}, ${lng.toFixed(4)}`

                setAddress(formattedAddress)
            } else {
                setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            }
        } catch (err) {
            console.error("Reverse geocoding error:", err)
            setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        }
    }

    const updateLocation = async (lat: number, lng: number) => {
        setLatitude(lat)
        setLongitude(lng)
        setStatus("success")
        setError(null)
        await fetchAddress(lat, lng)
    }

    const refreshLocation = async (silent: boolean = false) => {
        if (!navigator.geolocation) {
            setStatus("error")
            setError("Trình duyệt không hỗ trợ định vị")
            if (!silent) toast.error("Trình duyệt không hỗ trợ định vị")
            return
        }

        setStatus("loading")

        return new Promise<void>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude
                    const lng = position.coords.longitude

                    setLatitude(lat)
                    setLongitude(lng)
                    setStatus("success")
                    setError(null)

                    await fetchAddress(lat, lng)
                    resolve()
                },
                (err) => {
                    console.warn("Geolocation error:", err)
                    setStatus("error")
                    let errorMsg = "Không thể lấy vị trí."
                    if (err.code === err.PERMISSION_DENIED) errorMsg = "Bạn đã từ chối quyền truy cập vị trí."
                    else if (err.code === err.POSITION_UNAVAILABLE) errorMsg = "Thông tin vị trí không khả dụng."
                    else if (err.code === err.TIMEOUT) errorMsg = "Hết thời gian chờ lấy vị trí."

                    setError(errorMsg)
                    if (!silent) toast.error(errorMsg)
                    reject(err)
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            )
        })
    }

    // Auto-fetch on mount
    useEffect(() => {
        // Check permission first to avoid annoying prompt if not granted yet?
        // Actually user wants it to be requested immediately.
        // But usually browsers block immediate requests without user interaction unless permission is already granted.
        // Let's try to query permission first.
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: "geolocation" })
                .then((result) => {
                    if (result.state === "granted") {
                        refreshLocation(true)
                    } else if (result.state === "prompt") {
                        // If prompt, we can try to request it, but it might need user interaction.
                        // However, the user asked for "vừa vào trang chủ yêu cầu bật GPS".
                        // We can try calling it.
                        refreshLocation(true).catch(() => { })
                    }
                })
                .catch(() => {
                    // Fallback
                    refreshLocation(true).catch(() => { })
                })
        } else {
            refreshLocation(true).catch(() => { })
        }
    }, [])

    return (
        <LocationContext.Provider value={{ latitude, longitude, address, status, error, refreshLocation, updateLocation }}>
            {children}
        </LocationContext.Provider>
    )
}

export function useLocation() {
    const context = useContext(LocationContext)
    if (context === undefined) {
        throw new Error("useLocation must be used within a LocationProvider")
    }
    return context
}

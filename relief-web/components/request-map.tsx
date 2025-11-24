"use client"

import { useEffect, useRef, useState } from "react"

interface RequestMapProps {
    latitude: number
    longitude: number
    address?: string
    className?: string
}

export function RequestMap({ latitude, longitude, address, className = "" }: RequestMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!isMounted || !mapRef.current || mapInstanceRef.current) return

        // Dynamic import to avoid SSR issues
        import("leaflet").then((L) => {
            // Fix for default marker icon in Leaflet
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            })

            if (!mapRef.current) return

            // Initialize map
            const map = L.map(mapRef.current).setView([latitude, longitude], 15)

            // Add OpenStreetMap tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map)

            // Add marker
            const marker = L.marker([latitude, longitude]).addTo(map)

            if (address) {
                marker.bindPopup(`<strong>Vị trí cần hỗ trợ</strong><br/>${address}`).openPopup()
            }

            mapInstanceRef.current = map
        })

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [isMounted, latitude, longitude, address])

    if (!isMounted) {
        return (
            <div className={`w-full h-full rounded-xl bg-muted flex items-center justify-center ${className}`}>
                <p className="text-muted-foreground text-sm">Đang tải bản đồ...</p>
            </div>
        )
    }

    return <div ref={mapRef} className={`w-full h-full rounded-xl ${className}`} />
}

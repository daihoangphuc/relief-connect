"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

export function DateTimeDisplay() {
    const [mounted, setMounted] = useState(false)
    const [date, setDate] = useState<Date | null>(null)

    useEffect(() => {
        setMounted(true)
        setDate(new Date())
        const timer = setInterval(() => setDate(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    if (!mounted || !date) return null

    const timeString = date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    })

    const dateString = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })

    return (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
            <Clock className="h-4 w-4 text-primary" />
            <span className="tabular-nums flex items-center">
                <span>
                    {date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="hidden sm:inline">
                    :{date.getSeconds().toString().padStart(2, '0')}
                </span>
                <span className="hidden sm:inline mx-1 text-muted-foreground/50">|</span>
                <span className="hidden sm:inline">
                    {dateString}
                </span>
            </span>
        </div>
    )
}

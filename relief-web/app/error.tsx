"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center space-y-8">
            <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
                <div className="relative bg-card p-6 rounded-3xl border-2 border-amber-200 dark:border-amber-900 shadow-xl">
                    <AlertTriangle className="w-20 h-20 text-amber-500" />
                </div>
            </div>

            <div className="space-y-4 max-w-md">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Đã xảy ra lỗi!
                </h2>
                <p className="text-muted-foreground">
                    Hệ thống gặp sự cố khi xử lý yêu cầu của bạn. Chúng tôi đã ghi nhận lỗi này.
                </p>
                {process.env.NODE_ENV === 'development' && (
                    <div className="p-4 bg-muted/50 rounded-xl text-left overflow-auto max-h-40 text-xs font-mono border">
                        {error.message}
                    </div>
                )}
            </div>

            <Button
                onClick={reset}
                size="lg"
                className="rounded-xl h-12 px-8 text-base bg-amber-500 hover:bg-amber-600 text-white"
            >
                <RefreshCw className="mr-2 h-5 w-5" />
                Thử lại
            </Button>
        </div>
    )
}

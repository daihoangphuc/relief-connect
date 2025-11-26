import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center space-y-8">
            <div className="relative">
                <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative bg-card p-8 rounded-full border-4 border-muted shadow-2xl">
                    <AlertCircle className="w-24 h-24 text-destructive animate-bounce" />
                </div>
            </div>

            <div className="space-y-4 max-w-md">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    404 - Không tìm thấy
                </h1>
                <p className="text-lg text-muted-foreground">
                    Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                </p>
            </div>

            <Button asChild size="lg" className="rounded-xl h-12 px-8 text-base">
                <Link href="/">
                    <Home className="mr-2 h-5 w-5" />
                    Trở về trang chủ
                </Link>
            </Button>
        </div>
    )
}

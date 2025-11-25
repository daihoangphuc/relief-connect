import { NextRequest, NextResponse } from "next/server"

// Rate limiting storage (in-memory, sẽ reset khi restart server)
// Trong production nên dùng Redis hoặc Vercel KV
const requestCounts = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = {
    MAX_REQUESTS_PER_DAY: 3,
    WINDOW_MS: 24 * 60 * 60 * 1000, // 24 giờ
}

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = requestCounts.get(identifier)

    // Nếu chưa có record hoặc đã hết thời gian
    if (!record || now > record.resetTime) {
        const resetTime = now + RATE_LIMIT.WINDOW_MS
        requestCounts.set(identifier, { count: 1, resetTime })
        return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS_PER_DAY - 1, resetTime }
    }

    // Kiểm tra đã vượt quá limit chưa
    if (record.count >= RATE_LIMIT.MAX_REQUESTS_PER_DAY) {
        return { allowed: false, remaining: 0, resetTime: record.resetTime }
    }

    // Tăng count
    record.count++
    requestCounts.set(identifier, record)
    return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS_PER_DAY - record.count, resetTime: record.resetTime }
}

export function getClientIdentifier(request: NextRequest): string {
    // Ưu tiên IP từ headers (cho Vercel/Cloudflare)
    const forwardedFor = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ip = forwardedFor?.split(",")[0] || realIp || "unknown"

    return ip
}

export function rateLimitResponse(resetTime: number): NextResponse {
    const resetDate = new Date(resetTime)
    return NextResponse.json(
        {
            error: "Quá nhiều yêu cầu",
            message: `Bạn đã gửi quá ${RATE_LIMIT.MAX_REQUESTS_PER_DAY} yêu cầu trong 24 giờ. Vui lòng thử lại sau.`,
            resetAt: resetDate.toISOString(),
        },
        {
            status: 429,
            headers: {
                "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
                "X-RateLimit-Limit": RATE_LIMIT.MAX_REQUESTS_PER_DAY.toString(),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": resetTime.toString(),
            },
        }
    )
}

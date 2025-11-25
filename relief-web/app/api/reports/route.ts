import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// POST /api/reports - Báo cáo yêu cầu đáng ngờ
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { requestId, reporterId, reason, description } = body

        // Validation
        if (!requestId || !reason) {
            return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 })
        }

        // Kiểm tra request có tồn tại không
        const { data: existingRequest } = await supabase
            .from("relief_requests")
            .select("id")
            .eq("id", requestId)
            .single()

        if (!existingRequest) {
            return NextResponse.json({ error: "Không tìm thấy yêu cầu" }, { status: 404 })
        }

        // Tạo báo cáo
        const { data, error } = await supabase
            .from("reports")
            .insert({
                request_id: requestId,
                reporter_id: reporterId,
                reason: reason,
                description: description || null,
                created_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (error) {
            console.error("Supabase report error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Kiểm tra số lượng báo cáo cho request này
        const { count } = await supabase
            .from("reports")
            .select("*", { count: "exact", head: true })
            .eq("request_id", requestId)

        // Nếu có >= 3 báo cáo, tự động đánh dấu cancelled
        if (count && count >= 3) {
            await supabase
                .from("relief_requests")
                .update({ status: 3 }) // 3 = Cancelled
                .eq("id", requestId)
        }

        return NextResponse.json(
            {
                ...data,
                message: "Đã ghi nhận báo cáo. Cảm ơn bạn đã giúp giữ hệ thống an toàn.",
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("Report error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// GET /api/reports?requestId=xxx - Lấy danh sách báo cáo cho một request
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const requestId = searchParams.get("requestId")

        if (!requestId) {
            return NextResponse.json({ error: "Thiếu requestId" }, { status: 400 })
        }

        const { data, error, count } = await supabase
            .from("reports")
            .select("*", { count: "exact" })
            .eq("request_id", requestId)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Supabase GET reports error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ reports: data, total: count })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

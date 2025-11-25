import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { type CreateRequestDto, RequestStatus } from "@/types/api"

// GET /api/requests
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get("status")

        let query = supabase
            .from("relief_requests")
            .select("*")
            .order("created_at", { ascending: false })

        if (status && status !== "-1") {
            query = query.eq("status", status)
        }

        const { data, error } = await query

        if (error) {
            console.error("Supabase GET error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST /api/requests
export async function POST(request: Request) {
    try {
        const body: CreateRequestDto = await request.json()

        // Basic validation
        if (!body.title || !body.description || !body.latitude || !body.longitude) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const { data, error } = await supabase
            .from("relief_requests")
            .insert({
                requester_id: body.requesterId,
                title: body.title,
                description: body.description,
                latitude: body.latitude,
                longitude: body.longitude,
                address: body.address,
                contact_phone: body.contactPhone,
                status: RequestStatus.Open,
                created_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (error) {
            console.error("Supabase POST error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

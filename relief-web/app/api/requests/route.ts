import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { type CreateRequestDto, RequestStatus } from "@/types/api"

// GET /api/requests
export async function GET(request: Request) {
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
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

// POST /api/requests
export async function POST(request: Request) {
    try {
        const body: CreateRequestDto = await request.json()

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

        if (error) throw error

        return NextResponse.json(data, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH /api/requests
export async function PATCH(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        const status = searchParams.get("status")

        if (!id || !status) {
            return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
        }

        const { error } = await supabase
            .from("relief_requests")
            .update({ status: parseInt(status) })
            .eq("id", id)

        if (error) throw error

        return new NextResponse(null, { status: 204 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

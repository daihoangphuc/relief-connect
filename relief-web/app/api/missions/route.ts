import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { RequestStatus } from "@/types/api"

// POST /api/missions (Accept a mission)
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { requestId, donorId } = body

        if (!requestId || !donorId) {
            return NextResponse.json({ error: "Missing requestId or donorId" }, { status: 400 })
        }

        // 1. Create Mission Record
        const { data: mission, error: missionError } = await supabase
            .from("relief_missions")
            .insert({
                request_id: requestId,
                donor_id: donorId,
                started_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (missionError) {
            console.error("Mission creation error:", missionError)
            return NextResponse.json({ error: missionError.message }, { status: 500 })
        }

        // 2. Update Request Status to InProgress
        const { error: updateError } = await supabase
            .from("relief_requests")
            .update({ status: RequestStatus.InProgress })
            .eq("id", requestId)

        if (updateError) {
            console.error("Request status update error:", updateError)
            // Ideally rollback mission here, but keeping it simple for now
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json(mission, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH /api/missions (Complete a mission)
export async function PATCH(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const missionId = searchParams.get("id")

        // Read body for proofImage
        let proofImage = null
        try {
            const body = await request.json()
            proofImage = body.proofImage
        } catch (e) {
            // Ignore if no body
        }

        if (!missionId) {
            return NextResponse.json({ error: "Missing missionId" }, { status: 400 })
        }

        // 1. Get the mission to find the request_id
        const { data: mission, error: fetchError } = await supabase
            .from("relief_missions")
            .select("request_id")
            .eq("id", missionId)
            .single()

        if (fetchError || !mission) {
            return NextResponse.json({ error: "Mission not found" }, { status: 404 })
        }

        // 2. Update Mission to Completed
        const updateData: any = { completed_at: new Date().toISOString() }
        if (proofImage) {
            updateData.proof_image = proofImage
        }

        const { error: missionError } = await supabase
            .from("relief_missions")
            .update(updateData)
            .eq("id", missionId)

        if (missionError) {
            return NextResponse.json({ error: missionError.message }, { status: 500 })
        }

        // 3. Update Request Status to Completed
        const { error: updateError } = await supabase
            .from("relief_requests")
            .update({ status: RequestStatus.Completed })
            .eq("id", mission.request_id)

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return new NextResponse(null, { status: 204 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

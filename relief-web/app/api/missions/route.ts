import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { RequestStatus } from "@/types/api"

// POST /api/missions
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { requestId, donorId } = body

        // 1. Create mission
        const { data: mission, error: missionError } = await supabase
            .from("relief_missions")
            .insert({
                request_id: requestId,
                donor_id: donorId,
                started_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (missionError) throw missionError

        // 2. Update request status to InProgress
        const { error: updateError } = await supabase
            .from("relief_requests")
            .update({ status: RequestStatus.InProgress })
            .eq("id", requestId)

        if (updateError) {
            // Rollback mission creation if update fails (optional but good practice)
            await supabase.from("relief_missions").delete().eq("id", mission.id)
            throw updateError
        }

        return NextResponse.json(mission, { status: 201 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH /api/missions
export async function PATCH(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 })
        }

        // 1. Get mission to find requestId
        const { data: mission, error: fetchError } = await supabase
            .from("relief_missions")
            .select("request_id")
            .eq("id", id)
            .single()

        if (fetchError) throw fetchError

        // 2. Update mission completed_at
        const { error: missionError } = await supabase
            .from("relief_missions")
            .update({ completed_at: new Date().toISOString() })
            .eq("id", id)

        if (missionError) throw missionError

        // 3. Update request status to Completed
        const { error: updateError } = await supabase
            .from("relief_requests")
            .update({ status: RequestStatus.Completed })
            .eq("id", mission.request_id)

        if (updateError) throw updateError

        return new NextResponse(null, { status: 204 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

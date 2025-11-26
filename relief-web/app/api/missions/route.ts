import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { requestId, donorId } = body

        if (!requestId || !donorId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Check if request is already taken or completed
        const { data: existingRequest, error: fetchError } = await supabase
            .from("relief_requests")
            .select("status")
            .eq("id", requestId)
            .single()

        if (fetchError) throw fetchError

        if (existingRequest.status !== 0) { // 0: Open
            return NextResponse.json(
                { error: "Request is no longer available" },
                { status: 409 } // Conflict
            )
        }

        // Create mission
        const { data: mission, error: missionError } = await supabase
            .from("relief_missions")
            .insert([
                {
                    request_id: requestId,
                    donor_id: donorId,
                    mission_status: 0 // Accepted
                }
            ])
            .select()
            .single()

        if (missionError) throw missionError

        // Update request status to InProgress (1)
        const { error: updateError } = await supabase
            .from("relief_requests")
            .update({ status: 1 })
            .eq("id", requestId)

        if (updateError) {
            console.error("Failed to update request status, but mission created:", updateError)
        }

        return NextResponse.json(mission, { status: 201 })
    } catch (error) {
        console.error("Error accepting mission:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request) {
    try {
        const url = new URL(request.url)
        const id = url.searchParams.get("id")
        const body = await request.json()

        if (!id) {
            return NextResponse.json(
                { error: "Missing mission ID" },
                { status: 400 }
            )
        }

        // Update mission
        const { error: updateError } = await supabase
            .from("relief_missions")
            .update({
                proof_image: body.proofImage,
                completed_at: body.proofImage ? new Date().toISOString() : undefined,
                mission_status: body.proofImage ? 3 : undefined // 3: Completed
            })
            .eq("id", id)

        if (updateError) throw updateError

        // If completed, update request status to Completed (2)
        if (body.proofImage) {
            // First get request_id from mission
            const { data: mission } = await supabase
                .from("relief_missions")
                .select("request_id")
                .eq("id", id)
                .single()

            if (mission) {
                await supabase
                    .from("relief_requests")
                    .update({ status: 2 })
                    .eq("id", mission.request_id)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error updating mission:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

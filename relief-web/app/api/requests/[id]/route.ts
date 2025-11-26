import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const id = params.id

    try {
        const { data, error } = await supabase
            .from("relief_requests")
            .select(`
        *,
        relief_missions(id, donor_id, proof_image),
        reports(reporter_id)
      `)
            .eq("id", id)
            .single()

        if (error) throw error

        // Transform data to match expected format
        const mission = data.relief_missions?.[0]
        const reporterIds = data.reports ? data.reports.map((r: any) => r.reporter_id) : []

        const transformedData = {
            ...data,
            proof_image: mission?.proof_image || null,
            mission: mission ? {
                id: mission.id,
                donorId: mission.donor_id
            } : null,
            reporter_ids: reporterIds,
            report_count: reporterIds.length
        }

        return NextResponse.json(transformedData)
    } catch (error) {
        console.error("Error fetching request:", error)
        return NextResponse.json(
            { error: "Request not found" },
            { status: 404 }
        )
    }
}

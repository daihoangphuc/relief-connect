import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const page = parseInt(requestUrl.searchParams.get("page") || "1")
    const limit = parseInt(requestUrl.searchParams.get("limit") || "10")
    const status = requestUrl.searchParams.get("status")
    const lat = parseFloat(requestUrl.searchParams.get("lat") || "0")
    const lng = parseFloat(requestUrl.searchParams.get("lng") || "0")
    const radius = parseFloat(requestUrl.searchParams.get("radius") || "10")

    // const supabase = createRouteHandlerClient({ cookies }) // Removed

    try {
        // Calculate offset
        const from = (page - 1) * limit
        const to = from + limit - 1

        let data = []
        let count = 0

        // Check if location-based search is requested
        if (lat !== 0 && lng !== 0) {
            // Use RPC function for geospatial query
            // status filter: -1 means all, otherwise specific status
            const statusFilter = status && status !== "-1" ? parseInt(status) : -1

            const { data: rpcData, error } = await supabase
                .rpc('get_nearby_requests_v2', {
                    lat,
                    long: lng,
                    radius_km: radius,
                    status_filter: statusFilter,
                    limit_val: limit,
                    offset_val: from
                })

            if (error) throw error

            // For RPC, we need a separate count query or estimate
            // Here we'll just use the length of returned data if it's less than limit, 
            // but for proper pagination we might need a separate count RPC or query.
            // For simplicity in this v2, let's assume total count is handled by client or separate query if needed.
            // However, to make pagination UI work, we need a total. 
            // Let's do a quick count query with same filters.

            // Note: Counting with complex geo-logic is heavy. 
            // For now, let's try to get a rough count or just return what we have.
            // A better approach for RPC pagination is to have the RPC return total_count as well, 
            // or use a separate count RPC. 
            // Let's fallback to a simple count query ignoring distance for "total" (approximation) 
            // OR implement a proper count RPC. 

            // To keep it simple and working:
            data = rpcData || []

            // Sort by created_at descending (newest first) as requested
            data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

            // Get total count for pagination (approximate or exact if possible)
            // If using RPC, getting exact total matching radius is hard without running the full query.
            // Let's query total count of requests with matching status for now.
            let countQuery = supabase
                .from("relief_requests")
                .select("*", { count: "exact", head: true })

            if (status && status !== "-1") {
                countQuery = countQuery.eq("status", status)
            }
            const { count: totalCount } = await countQuery
            count = totalCount || 0

        } else {
            // Standard query without location
            let query = supabase
                .from("relief_requests")
                .select(`
                    *,
                    reports(reporter_id),
                    relief_missions(id, donor_id, proof_image)
                `, { count: "exact" })
                .order("created_at", { ascending: false })
                .range(from, to)

            if (status && status !== "-1") {
                query = query.eq("status", status)
            }

            const { data: queryData, error, count: totalCount } = await query

            if (error) throw error

            // Merge proof images and reports
            data = queryData.map((req) => {
                const mission = req.relief_missions?.[0]
                const reporterIds = req.reports ? req.reports.map((r: any) => r.reporter_id) : []
                return {
                    ...req,
                    proof_image: mission?.proof_image || null,
                    mission: mission ? {
                        id: mission.id,
                        donorId: mission.donor_id
                    } : null,
                    reporter_ids: reporterIds,
                    report_count: reporterIds.length
                }
            })

            count = totalCount || 0
        }

        return NextResponse.json({
            data,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        })
    } catch (error) {
        console.error("Error fetching requests:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Basic validation
        if (!body.title || !body.description || !body.latitude || !body.longitude) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from("relief_requests")
            .insert([
                {
                    requester_id: body.requesterId, // Required field
                    title: body.title,
                    description: body.description,
                    latitude: body.latitude,
                    longitude: body.longitude,
                    address: body.address,
                    urgency_level: body.urgencyLevel || 1, // Correct field name
                    status: 0, // Open
                    contact_phone: body.contactPhone || null, // Correct field name
                    // Removed non-existent fields: images, tags
                }
            ])
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error("Error creating request:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

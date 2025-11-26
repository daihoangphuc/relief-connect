import { type CreateRequestDto, type ReliefRequest, RequestStatus, UrgencyLevel } from "@/types/api"

// Force relative path to avoid Mixed Content issues on Ngrok (HTTPS -> HTTP)
const API_BASE_URL = "/api"

// Helper to map API snake_case to App camelCase
const mapRequestFromApi = (data: any): ReliefRequest => ({
  id: data.id,
  requesterId: data.requester_id,
  title: data.title,
  description: data.description,
  latitude: data.latitude,
  longitude: data.longitude,
  address: data.address,
  status: data.status,
  urgencyLevel: data.urgency_level ?? UrgencyLevel.Medium,
  createdAt: data.created_at,
  contactPhone: data.contact_phone,
  reportCount: data.reports?.length || 0,
  reporterIds: data.reports?.map((r: any) => r.reporter_id) || [],
  proofImage: data.relief_missions?.find((m: any) => m.proof_image)?.proof_image || null,
  mission: data.mission ? {
    id: data.mission.id,
    donorId: data.mission.donorId
  } : undefined,
})

// Helper for consistent fetch handling
const fetchClient = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "ngrok-skip-browser-warning": "true",
        Accept: "application/json",
        ...options?.headers,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[v0] API Error ${res.status}:`, errorText)
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
    }

    // For 204 No Content, return null
    if (res.status === 204) return null

    return res.json()
  } catch (error: any) {
    console.error(`[API Error] Failed to fetch ${url}:`, error)

    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(`Không thể kết nối đến server (${url}). Vui lòng kiểm tra kết nối mạng hoặc server.`)
    }
    throw error
  }
}

export const api = {
  getRequests: async (
    status?: RequestStatus,
    page = 1,
    limit = 5,
    lat?: number,
    lng?: number
  ): Promise<{ data: ReliefRequest[], total: number, totalPages: number }> => {
    let urlStr = `${API_BASE_URL}/requests?page=${page}&limit=${limit}`

    if (status !== undefined && (status as any) !== -1) {
      urlStr += `&status=${status}`
    }

    if (lat && lng) {
      urlStr += `&lat=${lat}&lng=${lng}&radius=10`
    }

    console.log("[v0] Fetching requests from:", urlStr)

    const response = await fetchClient(urlStr)

    // Handle both old array format (fallback) and new object format
    if (Array.isArray(response)) {
      return { data: response.map(mapRequestFromApi), total: response.length, totalPages: 1 }
    }

    return {
      data: Array.isArray(response.data) ? response.data.map(mapRequestFromApi) : [],
      total: response.pagination?.total || 0,
      totalPages: response.pagination?.totalPages || 1
    }
  },

  createRequest: async (data: CreateRequestDto): Promise<ReliefRequest> => {
    console.log("[v0] Creating request at:", `${API_BASE_URL}/requests`)

    const payload = {
      requesterId: data.requesterId,
      title: data.title,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      urgencyLevel: data.urgencyLevel ?? UrgencyLevel.Medium,
      contactPhone: data.contactPhone || null,
    }

    const responseData = await fetchClient(`${API_BASE_URL}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    return mapRequestFromApi(responseData)
  },

  acceptMission: async (requestId: string, donorId: string) => {
    return fetchClient(`${API_BASE_URL}/missions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, donorId }),
    })
  },

  completeMission: async (missionId: string, proofImage?: string) => {
    await fetchClient(`${API_BASE_URL}/missions?id=${missionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proofImage }),
    })
    return { success: true }
  },




}

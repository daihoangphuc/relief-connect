import { type CreateRequestDto, type ReliefRequest, RequestStatus } from "@/types/api"
import { v4 as uuidv4 } from "uuid"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5162/api"

// Mock data for demonstration when API is not available
export const MOCK_REQUESTS: ReliefRequest[] = [
  {
    id: "1",
    requesterId: "req-1",
    title: "Cần nước sạch và lương thực",
    description: "Khu vực bị ngập sâu, 5 hộ gia đình đang cô lập.",
    latitude: 10.762622,
    longitude: 106.660172,
    address: "Xã Bình Phú, Tỉnh Vĩnh Long",
    status: 0,
    createdAt: new Date().toISOString(),
    contactPhone: "123456789",
  },
  {
    id: "2",
    requesterId: "req-2",
    title: "Hỗ trợ y tế khẩn cấp",
    description: "Cần thuốc hạ sốt và bông băng cho người già.",
    latitude: 10.772622,
    longitude: 106.670172,
    address: "Phường 5, Quận 3, TP.HCM",
    status: 0,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    contactPhone: "987654321",
  },
]

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
  createdAt: data.created_at,
  contactPhone: data.contact_phone,
})

export const api = {
  getRequests: async (status?: RequestStatus): Promise<ReliefRequest[]> => {
    try {
      const url = new URL(`${API_BASE_URL}/requests`)
      if (status !== undefined && status !== -1) {
        url.searchParams.append("status", status.toString())
      }

      console.log("[v0] Fetching requests from:", url.toString())

      const res = await fetch(url.toString(), {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error(`[v0] API Error ${res.status}:`, errorText)
        throw new Error(`Failed to fetch requests: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      return Array.isArray(data) ? data.map(mapRequestFromApi) : []
    } catch (error) {
      console.warn("[v0] API unavailable, falling back to mock data", error)
      // Return mock data so the app doesn't crash
      if (status === undefined || status === -1) return MOCK_REQUESTS
      return MOCK_REQUESTS.filter((r) => r.status === status)
    }
  },

  createRequest: async (data: CreateRequestDto): Promise<ReliefRequest> => {
    try {
      console.log("[v0] Creating request at:", `${API_BASE_URL}/requests`)

      const payload = {
        requester_id: data.requesterId,
        title: data.title,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        contact_phone: data.contactPhone || null,
      }

      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to create request")

      const responseData = await res.json()
      return mapRequestFromApi(responseData)
    } catch (error) {
      console.warn("API unavailable, returning mock response", error)
      return {
        ...data,
        id: uuidv4(),
        status: RequestStatus.Open,
        createdAt: new Date().toISOString(),
        contactPhone: data.contactPhone || null,
      }
    }
  },

  acceptMission: async (requestId: string, donorId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/missions/accept/${requestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(donorId),
      })
      if (!res.ok) throw new Error("Failed to accept mission")
      return res.json()
    } catch (error) {
      console.warn("API unavailable, returning mock response", error)
      return {
        id: uuidv4(),
        requestId,
        donorId,
        startedAt: new Date().toISOString(),
      }
    }
  },

  completeMission: async (missionId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/missions/complete/${missionId}`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })
      if (!res.ok) throw new Error("Failed to complete mission")
      return res.json()
    } catch (error) {
      console.warn("API unavailable, returning mock response", error)
      return {
        id: missionId,
        completedAt: new Date().toISOString(),
      }
    }
  },
}

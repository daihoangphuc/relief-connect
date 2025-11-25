export enum RequestStatus {
  Open = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
}

export enum UrgencyLevel {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

// Matches 'relief_requests' table
export interface ReliefRequest {
  id: string
  requesterId: string // mapped from requester_id
  title: string
  description: string
  latitude: number
  longitude: number
  address: string
  status: RequestStatus
  urgencyLevel: UrgencyLevel // mapped from urgency_level
  createdAt: string // mapped from created_at
  contactPhone?: string | null // mapped from contact_phone
  items?: RequestItem[]
  reportCount?: number
}

// Matches 'request_items' table
export interface RequestItem {
  id: string
  requestId: string // mapped from request_id
  itemName: string // mapped from item_name
  quantityNeeded: number // mapped from quantity_needed
  unit: string
}

// Matches 'relief_missions' table
export interface ReliefMission {
  id: string
  requestId: string // mapped from request_id
  donorId: string // mapped from donor_id
  startedAt: string // mapped from started_at
  completedAt?: string // mapped from completed_at
  proofImage?: string // mapped from proof_image
}

export interface CreateRequestDto {
  requesterId: string
  title: string
  description: string
  latitude: number
  longitude: number
  address: string
  urgencyLevel?: UrgencyLevel
  contactPhone?: string
  items?: { itemName: string; quantityNeeded: number; unit: string }[]
}

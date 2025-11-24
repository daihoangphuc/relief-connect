export interface ReliefRequest {
  id: string
  requesterId: string
  title: string
  description: string
  latitude: number
  longitude: number
  address: string
  status: RequestStatus
  createdAt: string
  contactPhone?: string | null
  items?: RequestItem[]
}

export interface RequestItem {
  id: string
  requestId: string
  itemName: string
  quantityNeeded: number
  unit: string
}

export interface ReliefMission {
  id: string
  requestId: string
  donorId: string
  startedAt: string
  completedAt?: string
  proofImage?: string
}

export enum RequestStatus {
  Open = 0,
  InProgress = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface CreateRequestDto {
  requesterId: string
  title: string
  description: string
  latitude: number
  longitude: number
  address: string
  contactPhone?: string
  items?: { itemName: string; quantityNeeded: number; unit: string }[]
}

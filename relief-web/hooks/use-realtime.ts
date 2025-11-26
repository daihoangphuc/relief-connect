import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useRealtimeRequests(onNewRequest?: () => void) {
    const channelRef = useRef<RealtimeChannel | null>(null)

    useEffect(() => {
        // Subscribe to new relief requests
        channelRef.current = supabase
            .channel("relief_requests_changes")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "relief_requests",
                },
                (payload) => {
                    console.log("New request received:", payload)

                    // Play notification sound
                    const audio = new Audio("/notification.mp3")
                    audio.play().catch(e => console.log("Audio play failed:", e))

                    // Show toast notification
                    toast.success("🆘 Yêu cầu SOS mới!", {
                        description: payload.new.title || "Có người cần giúp đỡ",
                        duration: 5000,
                    })

                    // Callback to refresh list
                    if (onNewRequest) {
                        onNewRequest()
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "relief_requests",
                },
                (payload) => {
                    console.log("Request updated:", payload)

                    // Notify when status changes
                    if (payload.old.status !== payload.new.status) {
                        const statusText = payload.new.status === 1 ? "đang được hỗ trợ" : "đã hoàn thành"
                        toast.info(`Yêu cầu "${payload.new.title}" ${statusText}`)

                        if (onNewRequest) {
                            onNewRequest()
                        }
                    }
                }
            )
            .subscribe()

        // Cleanup on unmount
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
            }
        }
    }, [onNewRequest])
}

export function useRealtimeMissions(donorId: string, onMissionUpdate?: () => void) {
    const channelRef = useRef<RealtimeChannel | null>(null)

    useEffect(() => {
        if (!donorId) return

        // Subscribe to missions for this donor
        channelRef.current = supabase
            .channel(`missions_${donorId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "relief_missions",
                    filter: `donor_id=eq.${donorId}`,
                },
                (payload) => {
                    console.log("Mission accepted:", payload)
                    toast.success("✅ Bạn đã nhận nhiệm vụ mới!")

                    if (onMissionUpdate) {
                        onMissionUpdate()
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "relief_missions",
                    filter: `donor_id=eq.${donorId}`,
                },
                (payload) => {
                    console.log("Mission updated:", payload)

                    if (payload.new.completed_at && !payload.old.completed_at) {
                        toast.success("🎉 Nhiệm vụ đã hoàn thành!")
                    }

                    if (onMissionUpdate) {
                        onMissionUpdate()
                    }
                }
            )
            .subscribe()

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
            }
        }
    }, [donorId, onMissionUpdate])
}

export function useRealtimeGlobalUpdates(onUpdate: () => void) {
    const channelRef = useRef<RealtimeChannel | null>(null)

    useEffect(() => {
        // Subscribe to changes in both requests and missions for global stats
        channelRef.current = supabase
            .channel("global_updates")
            .on(
                "postgres_changes",
                {
                    event: "*", // Listen to INSERT, UPDATE, DELETE
                    schema: "public",
                    table: "relief_requests",
                },
                (payload) => {
                    console.log("Global request change:", payload)
                    onUpdate()
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "relief_missions",
                },
                (payload) => {
                    console.log("Global mission change:", payload)
                    onUpdate()
                }
            )
            .subscribe()

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
            }
        }
    }, [onUpdate])
}

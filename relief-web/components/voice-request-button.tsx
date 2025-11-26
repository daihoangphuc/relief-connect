"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface VoiceRequestButtonProps {
    onDataReceived: (data: any) => void
    onLocationFound: (lat: number, lng: number) => void
}

export function VoiceRequestButton({ onDataReceived, onLocationFound }: VoiceRequestButtonProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const startRecording = async () => {
        try {
            // 1. Request Permissions (Mic + Location)
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            if (!window.isSecureContext && window.location.hostname !== 'localhost') {
                toast.warning("Lưu ý: Định vị GPS chỉ hoạt động trên HTTPS hoặc Localhost.")
            }

            // 2. Get Location with Retry Strategy
            const getLocation = (highAccuracy: boolean): Promise<GeolocationPosition> => {
                return new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        resolve,
                        reject,
                        { enableHighAccuracy: highAccuracy, timeout: 10000 }
                    )
                })
            }

            try {
                // Try high accuracy first
                const position = await getLocation(true)
                onLocationFound(position.coords.latitude, position.coords.longitude)
            } catch (error: any) {
                console.warn("High accuracy location failed, retrying with low accuracy...", error)
                try {
                    // Fallback to low accuracy
                    const position = await getLocation(false)
                    onLocationFound(position.coords.latitude, position.coords.longitude)
                } catch (fallbackError: any) {
                    console.error("Location error (Final):", fallbackError)
                    let errorMsg = "Không thể lấy vị trí."
                    if (fallbackError.code === fallbackError.PERMISSION_DENIED) errorMsg = "Bạn đã từ chối quyền truy cập vị trí."
                    else if (fallbackError.code === fallbackError.POSITION_UNAVAILABLE) errorMsg = "Thông tin vị trí không khả dụng."
                    else if (fallbackError.code === fallbackError.TIMEOUT) errorMsg = "Hết thời gian chờ lấy vị trí."

                    toast.warning(`${errorMsg} Vui lòng nhập thủ công.`)
                }
            }

            // 2. Play Audio Prompt (MP3) & Start Recording after it ends
            const audio = new Audio("/sounds/voice-prompt.mp3")

            const startMediaRecorder = () => {
                const mediaRecorder = new MediaRecorder(stream)
                mediaRecorderRef.current = mediaRecorder
                chunksRef.current = []

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data)
                    }
                }

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
                    await analyzeAudio(audioBlob)
                    stream.getTracks().forEach(track => track.stop())
                }

                mediaRecorder.start()
                setIsRecording(true)
                toast.info("Đang ghi âm... Hãy mô tả tình huống của bạn.")
            }

            audio.onended = () => {
                startMediaRecorder()
            }

            audio.onerror = (e) => {
                console.warn("Audio prompt failed to load/play, starting recording immediately.", e)
                startMediaRecorder()
            }

            // Try to play audio. If it fails (e.g. file not found), start recording immediately.
            audio.play().catch((e) => {
                console.warn("Audio playback blocked or failed:", e)
                startMediaRecorder()
            })

        } catch (error) {
            console.error("Error starting recording:", error)
            toast.error("Không thể truy cập microphone. Vui lòng kiểm tra quyền.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const analyzeAudio = async (audioBlob: Blob) => {
        setIsAnalyzing(true)
        try {
            // Convert Blob to Base64
            const reader = new FileReader()
            reader.readAsDataURL(audioBlob)
            reader.onloadend = async () => {
                const base64Audio = (reader.result as string).split(",")[1]

                try {
                    const response = await fetch("/api/analyze-request", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            audio: base64Audio,
                            mimeType: audioBlob.type
                        }),
                    })

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ error: response.statusText }))
                        throw new Error(errorData.error || `Server error: ${response.status}`)
                    }

                    const data = await response.json()

                    if (data.error === 'unintelligible') {
                        toast.error("Âm thanh không rõ hoặc quá ồn. Vui lòng nói to và rõ ràng hơn.")
                        setIsAnalyzing(false)
                        return
                    }

                    onDataReceived(data)
                    toast.success("Đã phân tích thông tin từ giọng nói!")
                    setIsAnalyzing(false)
                } catch (err: any) {
                    console.error("Analysis fetch error:", err)
                    toast.error(`Lỗi phân tích: ${err.message}`)
                    setIsAnalyzing(false)
                }
            }
        } catch (error) {
            console.error("Analysis setup error:", error)
            toast.error("Lỗi khi chuẩn bị phân tích giọng nói.")
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="w-full mb-6">
            {!isRecording && !isAnalyzing ? (
                <Button
                    type="button"
                    onClick={startRecording}
                    variant="outline"
                    className="w-full h-16 text-lg font-medium border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Mic className="mr-2 h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    Dùng giọng nói (AI)
                    <Sparkles className="ml-2 h-4 w-4 text-amber-500 animate-pulse" />
                </Button>
            ) : isRecording ? (
                <Button
                    type="button"
                    onClick={stopRecording}
                    variant="destructive"
                    className="w-full h-16 text-lg font-medium animate-pulse shadow-lg shadow-destructive/20"
                >
                    <Square className="mr-2 h-6 w-6 fill-current" />
                    Đang nghe... (Ấn để dừng)
                </Button>
            ) : (
                <Button
                    type="button"
                    disabled
                    className="w-full h-16 text-lg font-medium bg-muted text-muted-foreground"
                >
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    AI đang phân tích...
                </Button>
            )}
        </div>
    )
}

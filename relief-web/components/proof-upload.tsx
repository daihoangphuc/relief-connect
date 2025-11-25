"use client"

import { useState } from "react"
import { Upload, Camera, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface ProofUploadProps {
    missionId: string
    onUploadComplete: (imageUrl: string) => void
}

export function ProofUpload({ missionId, onUploadComplete }: ProofUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file ảnh")
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB")
            return
        }

        try {
            setUploading(true)

            // Compress image (simple resize)
            const compressedFile = await compressImage(file)

            // Upload to Supabase Storage
            const fileName = `${missionId}_${Date.now()}.jpg`
            const { data, error } = await supabase.storage
                .from("proof-images")
                .upload(fileName, compressedFile, {
                    contentType: "image/jpeg",
                    upsert: false,
                })

            if (error) throw error

            // Get public URL
            const { data: urlData } = supabase.storage
                .from("proof-images")
                .getPublicUrl(fileName)

            setPreview(urlData.publicUrl)
            onUploadComplete(urlData.publicUrl)
            toast.success("Đã tải ảnh lên thành công!")
        } catch (error: any) {
            console.error("Upload error:", error)
            toast.error("Không thể tải ảnh lên. Vui lòng thử lại.")
        } finally {
            setUploading(false)
        }
    }

    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = (e) => {
                const img = new Image()
                img.src = e.target?.result as string
                img.onload = () => {
                    const canvas = document.createElement("canvas")
                    const MAX_WIDTH = 1200
                    const MAX_HEIGHT = 1200
                    let width = img.width
                    let height = img.height

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width
                            width = MAX_WIDTH
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height
                            height = MAX_HEIGHT
                        }
                    }

                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext("2d")
                    ctx?.drawImage(img, 0, 0, width, height)

                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob)
                            else reject(new Error("Compression failed"))
                        },
                        "image/jpeg",
                        0.8
                    )
                }
            }
            reader.onerror = reject
        })
    }

    return (
        <div className="space-y-4">
            <Label className="text-base font-semibold">Ảnh xác nhận hoàn thành</Label>

            {preview ? (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Proof"
                        className="w-full rounded-xl border-2 border-green-500"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                </div>
            ) : (
                <div className="border-2 border-dashed rounded-xl p-8 text-center">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id="proof-upload"
                    />
                    <label htmlFor="proof-upload" className="cursor-pointer">
                        {uploading ? (
                            <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="font-medium mb-2">Chụp ảnh hoặc chọn từ thư viện</p>
                                <p className="text-sm text-muted-foreground">
                                    Ảnh chứng minh bạn đã hoàn thành nhiệm vụ
                                </p>
                            </>
                        )}
                    </label>
                </div>
            )}
        </div>
    )
}

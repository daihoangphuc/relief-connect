"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, ArrowRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  return (
    <Card className="max-w-md w-full text-center border-none shadow-2xl">
      <CardHeader>
        <div className="mx-auto bg-green-100 p-4 rounded-full mb-4 animate-in zoom-in duration-500">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-green-700">Đã Gửi Thành Công!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-lg">
          Yêu cầu cứu trợ của bạn đã được ghi nhận vào hệ thống.
        </p>



        <p className="text-sm font-medium text-amber-600 bg-amber-50 p-3 rounded-lg">
          ⚠️ Hãy giữ điện thoại bên mình để đội cứu trợ liên lạc.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        {id && (
          <Link href={`/request/${id}`} className="w-full">
            <Button className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
              <Eye className="mr-2 h-5 w-5" /> Theo Dõi Trạng Thái
            </Button>
          </Link>
        )}
        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full h-12 text-base">
            <ArrowRight className="mr-2 h-4 w-4" /> Về Trang Chủ
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function RequestSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Suspense fallback={<div>Đang tải...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}

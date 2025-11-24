import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function RequestSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 p-3 rounded-full mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Đã Gửi Thành Công</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Yêu cầu cứu trợ của bạn đã được ghi nhận vào hệ thống. Các tình nguyện viên sẽ sớm liên hệ hoặc đến hỗ trợ.
          </p>
          <p className="mt-4 text-sm font-medium">Hãy giữ liên lạc qua điện thoại nếu có thể.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full bg-transparent">
              Về Trang Chủ
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

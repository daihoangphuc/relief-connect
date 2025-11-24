import { RequestList } from "@/components/request-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function VolunteerPage() {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Danh sách cần hỗ trợ</h1>
          <p className="text-muted-foreground">Các yêu cầu đang chờ người giúp đỡ</p>
        </div>
      </div>

      <RequestList />
    </div>
  )
}

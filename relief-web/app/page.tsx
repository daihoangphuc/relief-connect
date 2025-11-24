import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Radio, HandHelping, ShieldCheck, Zap, Heart, Activity } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center py-12 px-4 md:py-20 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-3xl -z-10 dark:bg-blue-950/20" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-50/50 rounded-full blur-3xl -z-10 dark:bg-red-950/20" />

        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-4">
            <Zap className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
            Live Response System
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Cứu trợ{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">Khẩn cấp</span>
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl max-w-[600px] mx-auto text-balance">
            Kết nối người cần giúp đỡ với tình nguyện viên gần nhất trong thời gian thực.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto px-4">
          {/* Request Help Card */}
          <Link href="/request" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
            <div className="relative h-full flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-red-100 shadow-xl transition-transform duration-300 group-hover:-translate-y-1 dark:border-red-900/50">
              <div className="mb-6 p-4 bg-red-100 rounded-full text-red-600 dark:bg-red-900/30">
                <Radio className="h-10 w-10 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Tôi Cần Giúp Đỡ</h2>
              <p className="text-muted-foreground text-center mb-6">
                Gửi tín hiệu SOS kèm vị trí của bạn để nhận hỗ trợ ngay lập tức.
              </p>
              <Button
                size="lg"
                className="w-full bg-red-600 hover:bg-red-700 text-white shadow-red-200 dark:shadow-none rounded-xl h-12"
              >
                Gửi Yêu Cầu SOS
              </Button>
            </div>
          </Link>

          {/* Give Help Card */}
          <Link href="/volunteer" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
            <div className="relative h-full flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-blue-100 shadow-xl transition-transform duration-300 group-hover:-translate-y-1 dark:border-blue-900/50">
              <div className="mb-6 p-4 bg-blue-100 rounded-full text-blue-600 dark:bg-blue-900/30">
                <HandHelping className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-foreground">Tôi Muốn Giúp</h2>
              <p className="text-muted-foreground text-center mb-6">
                Xem danh sách người cần hỗ trợ và tham gia cứu trợ cộng đồng.
              </p>
              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-none rounded-xl h-12"
              >
                Trở Thành Tình Nguyện Viên
              </Button>
            </div>
          </Link>
        </div>
      </section>

      {/* Features / Trust Section */}
      <section className="py-12 bg-muted/30 border-t">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border flex items-center justify-center mb-4 text-green-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Xác thực & An toàn</h3>
              <p className="text-sm text-muted-foreground">
                Thông tin được kiểm duyệt để đảm bảo an toàn cho cả hai bên.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border flex items-center justify-center mb-4 text-orange-600">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Cập nhật Real-time</h3>
              <p className="text-sm text-muted-foreground">
                Trạng thái cứu trợ được cập nhật liên tục theo thời gian thực.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border flex items-center justify-center mb-4 text-rose-600">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Cộng đồng Tương thân</h3>
              <p className="text-sm text-muted-foreground">
                Kết nối sức mạnh cộng đồng để không ai bị bỏ lại phía sau.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

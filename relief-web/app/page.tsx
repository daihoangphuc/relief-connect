import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Radio, HandHelping, ShieldCheck, Zap, Heart, Activity, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center py-20 md:py-32 relative overflow-hidden">
        {/* Decorative background elements - Aurora Effect */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-destructive/20 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-screen" />

        <div className="text-center space-y-8 max-w-4xl mx-auto mb-16 md:mb-24 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-primary/10 mb-6" suppressHydrationWarning>
            <Zap className="w-4 h-4 mr-2 text-amber-500 fill-amber-500" />
            Hệ thống Phản ứng Nhanh 24/7
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.1]">
            Cứu trợ{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-destructive via-orange-500 to-amber-500">
              Khẩn cấp
            </span>
          </h1>

          <p className="text-xl text-muted-foreground md:text-2xl max-w-[800px] mx-auto leading-relaxed">
            Kết nối người cần giúp đỡ với cộng đồng tình nguyện viên gần nhất.
            {/* <span className="font-semibold text-foreground block mt-2"> Không cần đăng ký. Miễn phí trọn đời.</span> */}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl mx-auto px-4">
          {/* Request Help Card */}
          <Link href="/request" className="group relative transform transition-all duration-300 hover:-translate-y-2 block w-full">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-destructive to-orange-500 rounded-[2rem] blur opacity-30 group-hover:opacity-70 transition duration-500" />
            <div className="relative h-full flex flex-col items-center justify-center p-6 md:p-10 bg-card/80 backdrop-blur-xl rounded-[1.8rem] border border-destructive/20 shadow-2xl shadow-destructive/5">
              <div className="mb-6 md:mb-8 p-4 md:p-5 bg-destructive/10 rounded-2xl text-destructive ring-1 ring-destructive/20" suppressHydrationWarning>
                <Radio className="h-10 w-10 md:h-12 md:w-12 animate-[pulse_3s_ease-in-out_infinite]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground text-center">Tôi Cần Giúp Đỡ</h2>
              <p className="text-muted-foreground text-center mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
                Gửi tín hiệu SOS kèm vị trí GPS. <br className="hidden md:block" /> Cộng đồng sẽ tìm đến bạn sớm nhất có thể.
              </p>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-destructive to-orange-600 hover:from-destructive/90 hover:to-orange-700 text-white shadow-lg shadow-destructive/25 rounded-xl h-12 md:h-14 text-base md:text-lg font-semibold transition-all duration-300 group-hover:shadow-destructive/40"
              >
                Gửi Yêu Cầu SOS <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Link>

          {/* Give Help Card */}
          <Link href="/volunteer" className="group relative transform transition-all duration-300 hover:-translate-y-2 block w-full">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-cyan-500 rounded-[2rem] blur opacity-30 group-hover:opacity-70 transition duration-500" />
            <div className="relative h-full flex flex-col items-center justify-center p-6 md:p-10 bg-card/80 backdrop-blur-xl rounded-[1.8rem] border border-primary/20 shadow-2xl shadow-primary/5">
              <div className="mb-6 md:mb-8 p-4 md:p-5 bg-primary/10 rounded-2xl text-primary ring-1 ring-primary/20" suppressHydrationWarning>
                <HandHelping className="h-10 w-10 md:h-12 md:w-12" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground text-center">Tôi Muốn Giúp</h2>
              <p className="text-muted-foreground text-center mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
                Xem bản đồ các điểm cần hỗ trợ. <br className="hidden md:block" /> Tham gia cứu trợ cộng đồng ngay bây giờ.
              </p>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-700 text-white shadow-lg shadow-primary/25 rounded-xl h-12 md:h-14 text-base md:text-lg font-semibold transition-all duration-300 group-hover:shadow-primary/40"
              >
                Trở Thành Tình Nguyện Viên
              </Button>
            </div>
          </Link>
        </div>
      </section>

      {/* Features / Trust Section */}
      <section className="py-24 bg-secondary/30 border-t border-border">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col items-center text-center group">
              <div
                className="h-20 w-20 rounded-3xl bg-card shadow-sm border border-border flex items-center justify-center mb-6 text-amber-600 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md"
                suppressHydrationWarning
              >
                <Activity className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Cập nhật Real-time</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                Trạng thái cứu trợ được cập nhật liên tục theo thời gian thực trên bản đồ số.
              </p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div
                className="h-20 w-20 rounded-3xl bg-card shadow-sm border border-border flex items-center justify-center mb-6 text-destructive transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md"
                suppressHydrationWarning
              >
                <Heart className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Cộng đồng Tương thân</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                Kết nối sức mạnh của hàng ngàn tình nguyện viên để không ai bị bỏ lại phía sau.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

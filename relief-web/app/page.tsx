import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Radio, HandHelping, ShieldCheck, Zap, Heart, Activity, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center py-16 px-4 md:py-24 relative overflow-hidden">
        {/* Decorative background elements - Aurora Effect */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-indigo-200/40 rounded-full blur-[120px] -z-10 dark:bg-indigo-900/20 mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-rose-200/40 rounded-full blur-[120px] -z-10 dark:bg-rose-900/20 mix-blend-multiply dark:mix-blend-screen" />

        <div className="text-center space-y-6 max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          <div className="inline-flex items-center rounded-full border border-indigo-100 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm transition-colors hover:bg-white dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 mb-6">
            <Zap className="w-4 h-4 mr-2 text-amber-500 fill-amber-500" />
            Hệ thống Phản ứng Nhanh 24/7
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.1]">
            Cứu trợ{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500">
              Khẩn cấp
            </span>
          </h1>

          <p className="text-xl text-slate-600 md:text-2xl max-w-[700px] mx-auto leading-relaxed dark:text-slate-300">
            Kết nối người cần giúp đỡ với cộng đồng tình nguyện viên gần nhất.
            <span className="font-semibold text-slate-900 dark:text-white"> Không cần đăng ký. Miễn phí trọn đời.</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto px-4">
          {/* Request Help Card */}
          <Link href="/request" className="group relative transform transition-all duration-300 hover:-translate-y-2">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-rose-400 to-orange-400 rounded-[2rem] blur opacity-30 group-hover:opacity-70 transition duration-500" />
            <div className="relative h-full flex flex-col items-center justify-center p-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[1.8rem] border border-rose-100 dark:border-rose-900/30 shadow-2xl shadow-rose-900/5">
              <div className="mb-8 p-5 bg-rose-50 rounded-2xl text-rose-600 dark:bg-rose-950/30 ring-1 ring-rose-100 dark:ring-rose-900/50">
                <Radio className="h-12 w-12 animate-[pulse_3s_ease-in-out_infinite]" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Tôi Cần Giúp Đỡ</h2>
              <p className="text-slate-500 text-center mb-8 text-lg leading-relaxed dark:text-slate-400">
                Gửi tín hiệu SOS kèm vị trí GPS. <br /> Cộng đồng sẽ tìm đến bạn ngay lập tức.
              </p>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white shadow-lg shadow-rose-500/25 rounded-xl h-14 text-lg font-semibold transition-all duration-300 group-hover:shadow-rose-500/40"
              >
                Gửi Yêu Cầu SOS <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Link>

          {/* Give Help Card */}
          <Link href="/volunteer" className="group relative transform transition-all duration-300 hover:-translate-y-2">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-[2rem] blur opacity-30 group-hover:opacity-70 transition duration-500" />
            <div className="relative h-full flex flex-col items-center justify-center p-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[1.8rem] border border-indigo-100 dark:border-indigo-900/30 shadow-2xl shadow-indigo-900/5">
              <div className="mb-8 p-5 bg-indigo-50 rounded-2xl text-indigo-600 dark:bg-indigo-950/30 ring-1 ring-indigo-100 dark:ring-indigo-900/50">
                <HandHelping className="h-12 w-12" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Tôi Muốn Giúp</h2>
              <p className="text-slate-500 text-center mb-8 text-lg leading-relaxed dark:text-slate-400">
                Xem bản đồ các điểm cần hỗ trợ. <br /> Tham gia cứu trợ cộng đồng ngay hôm nay.
              </p>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg shadow-indigo-500/25 rounded-xl h-14 text-lg font-semibold transition-all duration-300 group-hover:shadow-indigo-500/40"
              >
                Trở Thành Tình Nguyện Viên
              </Button>
            </div>
          </Link>
        </div>
      </section>

      {/* Features / Trust Section */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/60 dark:border-slate-800">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center group">
              <div className="h-16 w-16 rounded-3xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 text-emerald-600 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Xác thực & An toàn</h3>
              <p className="text-slate-500 leading-relaxed dark:text-slate-400">
                Thông tin được cộng đồng và admin kiểm duyệt để đảm bảo tính chính xác và an toàn.
              </p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="h-16 w-16 rounded-3xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 text-amber-600 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
                <Activity className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Cập nhật Real-time</h3>
              <p className="text-slate-500 leading-relaxed dark:text-slate-400">
                Trạng thái cứu trợ được cập nhật liên tục theo thời gian thực trên bản đồ số.
              </p>
            </div>
            <div className="flex flex-col items-center text-center group">
              <div className="h-16 w-16 rounded-3xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 text-rose-600 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Cộng đồng Tương thân</h3>
              <p className="text-slate-500 leading-relaxed dark:text-slate-400">
                Kết nối sức mạnh của hàng ngàn tình nguyện viên để không ai bị bỏ lại phía sau.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

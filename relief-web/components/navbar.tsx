import Link from "next/link"
import { HeartHandshake } from "lucide-react"
import { DateTimeDisplay } from "@/components/date-time-display"
import { LocationIndicator } from "@/components/location-indicator"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60" suppressHydrationWarning>
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4" suppressHydrationWarning>
        <div className="flex items-center gap-6" suppressHydrationWarning>
          <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/20 transition-transform group-hover:scale-105" suppressHydrationWarning>
              <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col">
              <span className="hidden sm:block text-base sm:text-lg font-bold leading-none tracking-tight">Relief Connect</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium hidden sm:block">
                Emergency Response
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/missions"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
            >
              Nhiệm vụ
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div>
            <DateTimeDisplay />
          </div>
          <LocationIndicator />
        </div>
      </div>
    </nav>
  )
}

import Link from "next/link"
import { HeartHandshake } from "lucide-react"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-5xl mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/20 transition-transform group-hover:scale-105">
            <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold leading-none tracking-tight">Relief Connect</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium hidden sm:block">
              Emergency Response
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/missions"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary active:text-primary"
          >
            Nhiệm vụ
          </Link>
        </div>
      </div>
    </nav>
  )
}

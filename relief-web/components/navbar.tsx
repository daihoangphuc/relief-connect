import Link from "next/link"
import { HeartHandshake } from "lucide-react"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-5xl mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/20 transition-transform group-hover:scale-105">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none tracking-tight">Relief Connect</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Emergency Response
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/missions"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Nhiệm vụ của tôi
          </Link>
        </div>
      </div>
    </nav>
  )
}

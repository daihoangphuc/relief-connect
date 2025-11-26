import type React from "react"
import "./globals.css"
import { Be_Vietnam_Pro } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/sonner"

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata = {
  title: "RELIEF CONNECT - Cứu Trợ Khẩn Cấp",
  description: "Hệ thống kết nối cứu trợ khẩn cấp thời gian thực",
  generator: 'v0.app'
}

import { ServiceWorkerRegister } from "@/components/sw-register"
import { MobileNav } from "@/components/mobile-nav"
import { LocationPermissionModal } from "@/components/location-permission-modal"

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${beVietnamPro.variable} font-sans antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-x-hidden`} suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0" suppressHydrationWarning>{children}</main>
        <Toaster />
        <ServiceWorkerRegister />
        <LocationPermissionModal />
        <MobileNav />
      </body>
    </html>
  )
}

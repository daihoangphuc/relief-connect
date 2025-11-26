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

import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "RELIEF CONNECT - Cứu Trợ Khẩn Cấp",
  description: "Hệ thống kết nối cứu trợ khẩn cấp thời gian thực",
  generator: 'v0.app',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Relief Connect",
  },
}

export const viewport: Viewport = {
  themeColor: "#ef4444",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import { ServiceWorkerRegister } from "@/components/sw-register"
import { MobileNav } from "@/components/mobile-nav"

// ... imports

import { LocationProvider } from "@/context/location-context"

// ... imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${beVietnamPro.variable} font-sans antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-x-hidden`} suppressHydrationWarning>
        <LocationProvider>
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0" suppressHydrationWarning>{children}</main>
          <Toaster />
          <ServiceWorkerRegister />
          <MobileNav />
        </LocationProvider>
      </body>
    </html>
  )
}

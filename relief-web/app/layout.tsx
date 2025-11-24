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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${beVietnamPro.variable} font-sans antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950`} suppressHydrationWarning>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}

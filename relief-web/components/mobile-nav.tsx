"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Radio, HeartHandshake, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
    const pathname = usePathname()

    const navItems = [
        {
            href: "/",
            label: "Trang chủ",
            icon: Home,
        },
        {
            href: "/request",
            label: "Cần giúp",
            icon: Radio,
        },
        {
            href: "/volunteer",
            label: "Cứu trợ",
            icon: HeartHandshake,
        },
        // {
        //   href: "/profile",
        //   label: "Cá nhân",
        //   icon: User,
        // },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border md:hidden pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-all duration-200",
                                isActive ? "bg-primary/10" : "bg-transparent"
                            )}>
                                <item.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

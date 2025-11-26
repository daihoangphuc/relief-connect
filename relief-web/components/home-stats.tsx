"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { RequestStatus, type ReliefRequest } from "@/types/api"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, CheckCircle2, AlertTriangle, Radio } from "lucide-react"
import { useRealtimeGlobalUpdates } from "@/hooks/use-realtime"
import { motion, useSpring, useTransform } from "framer-motion"

// Animated Counter Component
function AnimatedCounter({ value }: { value: number }) {
    const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => Math.round(current));

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span>{display}</motion.span>;
}

export function HomeStats() {
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        completed: 0,
    })
    const [loading, setLoading] = useState(true)

    const fetchStats = useCallback(async () => {
        try {
            // Request a large limit to get full dataset for accurate stats
            const response = await api.getRequests(undefined, 1, 1000)
            const allRequests = response.data || []

            const open = allRequests.filter(r => r.status === RequestStatus.Open).length
            const completed = allRequests.filter(r => r.status === RequestStatus.Completed).length

            setStats({
                total: response.total || allRequests.length,
                open,
                completed,
            })
        } catch (error) {
            console.error("Failed to fetch stats", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    useRealtimeGlobalUpdates(fetchStats)

    if (loading) {
        return <div className="py-12 text-center animate-pulse" suppressHydrationWarning>Đang đồng bộ dữ liệu...</div>
    }

    return (
        <section className="py-16 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm font-medium animate-pulse">
                    <Radio className="h-4 w-4" />
                    Live Updates
                </div>
                <h2 className="text-4xl pb-2 md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                    Tình hình Cứu trợ Thời gian thực
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Hệ thống cập nhật liên tục dữ liệu từ cộng đồng, kết nối mọi miền tổ quốc.
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatsCard
                    title="Đang cần giúp"
                    value={stats.open}
                    icon={AlertTriangle}
                    gradient="from-red-500 to-orange-500"
                    shadow="shadow-red-500/20"
                    delay={0}
                />
                <StatsCard
                    title="Đã được cứu"
                    value={stats.completed}
                    icon={CheckCircle2}
                    gradient="from-green-500 to-emerald-500"
                    shadow="shadow-green-500/20"
                    delay={100}
                />
                <StatsCard
                    title="Tổng yêu cầu"
                    value={stats.total}
                    icon={Activity}
                    gradient="from-purple-500 to-pink-500"
                    shadow="shadow-purple-500/20"
                    delay={200}
                />
            </div>
        </section>
    )
}

function StatsCard({ title, value, icon: Icon, gradient, shadow, delay }: any) {
    return (
        <Card
            className={`border-none shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden relative group ${shadow}`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-15 transition-opacity duration-500`} />

            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-all transform group-hover:scale-110 duration-500 rotate-12">
                <Icon className="h-32 w-32" />
            </div>

            <CardContent className="p-6 flex flex-col items-start relative z-10">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} text-white mb-4 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="text-5xl font-bold mb-2 tracking-tight text-foreground">
                    <AnimatedCounter value={value} />
                </div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</div>
            </CardContent>
        </Card>
    )
}

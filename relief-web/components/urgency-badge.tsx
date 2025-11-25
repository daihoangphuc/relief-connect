import { UrgencyLevel } from "@/types/api"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Zap } from "lucide-react"

interface UrgencyBadgeProps {
    level: UrgencyLevel
    className?: string
}

export function UrgencyBadge({ level, className = "" }: UrgencyBadgeProps) {
    const configs = {
        [UrgencyLevel.Low]: {
            label: "Mức độ thấp",
            color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
            icon: Clock,
        },
        [UrgencyLevel.Medium]: {
            label: "Mức độ trung bình",
            color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300",
            icon: Clock,
        },
        [UrgencyLevel.High]: {
            label: "Mức độ cao",
            color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300",
            icon: Zap,
        },
        [UrgencyLevel.Critical]: {
            label: "Mức độ KHẨN CẤP",
            color: "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 animate-pulse",
            icon: AlertTriangle,
        },
    }

    const config = configs[level] || configs[UrgencyLevel.Medium]
    const Icon = config.icon

    return (
        <Badge variant="outline" className={`${config.color} ${className} font-semibold`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
        </Badge>
    )
}

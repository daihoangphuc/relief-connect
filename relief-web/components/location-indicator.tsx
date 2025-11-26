"use client"

import { MapPin, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLocation } from "@/context/location-context"

export function LocationIndicator() {
    const { address, status, refreshLocation } = useLocation()

    const handleRefresh = () => {
        refreshLocation()
    }

    return (
        <div className="flex items-center gap-2">
            {status === "success" || status === "loading" || address ? (
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/30 px-2 sm:px-3 py-1.5 rounded-full border border-border/50 animate-in fade-in zoom-in duration-300">
                    <MapPin className="h-4 w-4 text-destructive" />
                    <span className="max-w-[80px] sm:max-w-[150px] truncate inline-block">
                        {status === "loading" ? "Đang định vị..." : address || "Vị trí hiện tại"}
                    </span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 ml-1 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                    onClick={handleRefresh}
                                    disabled={status === "loading"}
                                >
                                    <RefreshCw className={`h-3 w-3 ${status === "loading" ? "animate-spin" : ""}`} />
                                    <span className="sr-only">Cập nhật vị trí</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Cập nhật vị trí</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refreshLocation()}
                    className="text-muted-foreground hover:text-foreground gap-2 px-3 py-1.5 h-auto rounded-full hover:bg-muted/50"
                >
                    <MapPin className="h-4 w-4" />
                    <span className="inline">Bật vị trí</span>
                </Button>
            )}
        </div>
    )
}

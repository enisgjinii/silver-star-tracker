import { formatDuration } from "@/lib/app-icons"
import { X, Clock, Calendar, BarChart2 } from "lucide-react"
import { AppIcon } from "./ui/AppIcon"

interface AppDetailModalProps {
    app: { appName: string; totalSeconds: number } | null
    onClose: () => void
}

export function AppDetailModal({ app, onClose }: AppDetailModalProps) {
    if (!app) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div
                className="relative w-full max-w-md rounded-xl border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                        <AppIcon appName={app.appName} size={48} className="rounded-xl shadow-sm bg-muted/20" />
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">{app.appName}</h2>
                            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Productivity Activity</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border bg-card p-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground mb-1">
                                <Clock className="h-3 w-3" />
                                Total Time
                            </div>
                            <div className="text-lg font-bold tabular-nums">{formatDuration(app.totalSeconds)}</div>
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground mb-1">
                                <BarChart2 className="h-3 w-3" />
                                Daily Avg
                            </div>
                            {/* Placeholder logic for daily avg */}
                            <div className="text-lg font-bold tabular-nums">{formatDuration(Math.round(app.totalSeconds / 1))}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-bold text-xs uppercase tracking-tight flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            Session History
                        </h3>
                        <div className="rounded-lg border bg-muted/20 p-3 text-[11px] text-muted-foreground text-center italic">
                            Detailed session history visualization would go here.
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

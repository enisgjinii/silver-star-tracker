import { useEffect, useState } from "react"
import { getAppIcon, formatDuration } from "@/lib/app-icons"
import { Clock, Zap, Activity } from "lucide-react"
import { AppDetailModal } from "./AppDetailModal"
import { AppIcon } from "./ui/AppIcon"

export function Dashboard() {
    const [currentApp, setCurrentApp] = useState<{ appName: string; title: string; icon?: string } | null>(null)
    const [todaySummary, setTodaySummary] = useState<Record<string, number>>({})
    const [appIcons, setAppIcons] = useState<Record<string, string>>({})
    const [dataPath, setDataPath] = useState<string>('')
    const [modalApp, setModalApp] = useState<{ appName: string; totalSeconds: number } | null>(null)

    useEffect(() => {
        window.api?.onActiveWindow((data: any) => {
            setCurrentApp({ appName: data.appName, title: data.title, icon: data.icon })
            // If we got a new icon, update the local cache
            if (data.icon) {
                setAppIcons(prev => ({ ...prev, [data.appName]: data.icon }))
            }
        })

        window.api?.getTodaySummary().then(setTodaySummary)
        window.api?.getAppIcons().then(setAppIcons)
        window.api?.getDataPath().then(setDataPath)

        // Refresh data every 10 seconds
        const interval = setInterval(() => {
            window.api?.getTodaySummary().then(setTodaySummary)
            window.api?.getAppIcons().then(setAppIcons)
        }, 10000)

        return () => clearInterval(interval)
    }, [])

    const sortedApps = Object.entries(todaySummary)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)

    const totalTime = Object.values(todaySummary).reduce((sum, t) => sum + t, 0)

    const handleAppClick = (appName: string, seconds: number) => {
        setModalApp({ appName, totalSeconds: seconds })
    }

    const renderIcon = (appName: string, className: string, size: number = 24) => {
        return <AppIcon appName={appName} icon={appIcons[appName]} className={className} size={size} />
    }

    // Debug effect
    useEffect(() => {
        console.log('[DEBUG] Current App Icons Cache:', Object.keys(appIcons))
    }, [appIcons])

    return (
        <div className="h-full flex flex-col p-5 gap-5 overflow-hidden w-full animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-end justify-between flex-shrink-0">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-primary/60">
                        <Activity className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest">Productivity Hub</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-xs text-muted-foreground font-medium">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-4 bg-card border border-border/50 p-3 rounded-xl shadow-sm">
                    <div className="text-right">
                        <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">Total Focus Time</div>
                        <div className="text-xl font-bold text-primary transition-all tabular-nums">{formatDuration(totalTime)}</div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-12 gap-5 min-h-0">
                {/* Current Activity */}
                <div className="col-span-12 lg:col-span-4 bg-card border border-border/50 rounded-2xl p-5 flex flex-col shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="h-16 w-16 text-primary" strokeWidth={1} />
                    </div>

                    <div className="flex items-center gap-2 mb-6 relative z-10">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">Live Tracking</h2>
                    </div>

                    {currentApp ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 relative z-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                                <div className="h-20 w-20 rounded-2xl bg-background border border-border/50 flex items-center justify-center shadow-lg relative z-10 overflow-hidden">
                                    {renderIcon(currentApp.appName, "", 48)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-xl tracking-tight text-foreground">{currentApp.appName}</h3>
                                <p className="text-sm text-muted-foreground font-medium max-w-[240px] line-clamp-2 mx-auto leading-tight italic">
                                    "{currentApp.title}"
                                </p>
                            </div>
                            <div className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold shadow-md shadow-primary/20">
                                Current Active Window
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-6 opacity-40">
                            <Clock className="h-16 w-16" strokeWidth={1} />
                            <p className="font-medium">Initializing Tracker...</p>
                        </div>
                    )}
                </div>

                {/* Top Apps */}
                <div className="col-span-12 lg:col-span-8 bg-card border border-border/50 rounded-2xl p-5 flex flex-col min-h-0 shadow-sm">
                    <div className="flex items-center justify-between mb-6 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            <h2 className="font-bold text-base tracking-tight">Today's Usage</h2>
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg uppercase tracking-wider">Top 10 Apps</span>
                    </div>

                    <div className="flex-1 overflow-hidden pr-4 -mr-4 space-y-2">
                        {sortedApps.map(([appName, seconds]) => {
                            const { color } = getAppIcon(appName)
                            const percent = totalTime > 0 ? Math.round((seconds / totalTime) * 100) : 0
                            return (
                                <button
                                    key={appName}
                                    onClick={() => handleAppClick(appName, seconds)}
                                    className="w-full flex items-center gap-3 p-3 bg-muted/10 hover:bg-muted/20 border border-transparent hover:border-border/30 rounded-xl transition-all duration-300 text-left group"
                                >
                                    <div className="h-10 w-10 rounded-lg bg-background border border-border/50 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                                        {renderIcon(appName, "", 24)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="font-semibold text-sm truncate pr-4">{appName}</span>
                                            <span className="text-[10px] font-bold tabular-nums bg-primary/5 text-primary px-1.5 py-0.5 rounded-md">{percent}%</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-background border border-border/30 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${percent}%`, backgroundColor: color }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-muted-foreground w-14 text-right tabular-nums">
                                                {formatDuration(seconds)}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                        {sortedApps.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 gap-4">
                                <Activity className="h-12 w-12" strokeWidth={1} />
                                <p className="font-bold tracking-tight">No data detected for today</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex justify-between items-center bg-card/50 border border-border/50 rounded-2xl px-6 py-3 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Engine Active</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Local Vault:</span>
                    <code className="text-[10px] font-mono font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">{dataPath || 'Reading...'}</code>
                </div>
            </div>

            <AppDetailModal
                app={modalApp}
                onClose={() => setModalApp(null)}
            />
        </div>
    )
}

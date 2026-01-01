import { useEffect, useState, useMemo } from "react"
import { formatDuration } from "@/lib/app-icons"
import {
    TrendingUp, Clock, PieChart as PieIcon,
    Calendar as CalendarIcon, Zap, Download, Target,
    Flame, Briefcase, MessageSquare, Code, Play, ChevronDown
} from "lucide-react"
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { Button } from "@/components/ui/button"
import { AppIcon } from "./ui/AppIcon"
import { cn } from "@/lib/utils"
import { jsPDF } from "jspdf"

type TimeRange = '7d' | '30d' | 'all'

interface CategoryConfig {
    label: string
    color: string
    icon: any
    keywords: string[]
}

const CATEGORIES: Record<string, CategoryConfig> = {
    work: { label: 'Work', color: '#3b82f6', icon: Briefcase, keywords: ['notion', 'linear', 'excel', 'word', 'slack', 'zoom', 'teams', 'document'] },
    code: { label: 'Coding', color: '#10b981', icon: Code, keywords: ['code', 'vscode', 'terminal', 'iterm', 'github', 'sublime', 'intellij', 'docker', 'cursor'] },
    social: { label: 'Social', color: '#f59e0b', icon: MessageSquare, keywords: ['discord', 'telegram', 'whatsapp', 'messenger', 'twitter', 'x', 'instagram'] },
    entertainment: { label: 'Entertainment', color: '#ef4444', icon: Play, keywords: ['youtube', 'netflix', 'spotify', 'vlc', 'steam', 'game'] },
    browsing: { label: 'Browsing', color: '#8b5cf6', icon: CalendarIcon, keywords: ['chrome', 'safari', 'firefox', 'arc', 'browser', 'edge'] },
    other: { label: 'Other', color: '#6b7280', icon: Target, keywords: [] }
}

export function Stats() {
    const [data, setData] = useState<any[]>([])
    const [appIcons, setAppIcons] = useState<Record<string, string>>({})
    const [timeRange, setTimeRange] = useState<TimeRange>('7d')
    const [showExportMenu, setShowExportMenu] = useState(false)

    useEffect(() => {
        Promise.all([
            window.api.getActivityData(),
            window.api.getAppIcons()
        ]).then(([activityData, icons]) => {
            setData(activityData || [])
            setAppIcons(icons || {})
        })
    }, [])

    const getCategory = (appName: string) => {
        const lower = appName.toLowerCase()
        for (const [key, config] of Object.entries(CATEGORIES)) {
            if (config.keywords.some(k => lower.includes(k))) return key
        }
        return 'other'
    }

    // Advanced Data Processing
    const analytics = useMemo(() => {
        if (!data || !data.length) return null

        let currentPeriod = [...data]
        let prevPeriod: any[] = []

        const dayCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : data.length
        currentPeriod = data.slice(-dayCount)
        prevPeriod = data.slice(-dayCount * 2, -dayCount)

        const processPeriod = (period: any[]) => {
            const aggregated: Record<string, number> = {}
            const categories: Record<string, number> = {}
            const hourlyPattern = Array(24).fill(0).map((_, i) => ({ hour: i, seconds: 0 }))
            const appByDay: Record<string, Set<string>> = {} // appName -> set of dates used
            let totalSeconds = 0

            period.forEach(day => {
                const dateStr = day.date
                for (const [app, time] of Object.entries(day.appSummary || {})) {
                    const sec = time as number
                    aggregated[app] = (aggregated[app] || 0) + sec
                    totalSeconds += sec

                    const cat = getCategory(app)
                    categories[cat] = (categories[cat] || 0) + sec

                    if (!appByDay[app]) appByDay[app] = new Set()
                    appByDay[app].add(dateStr)
                }

                if (day.entries) {
                    day.entries.forEach((e: any) => {
                        const start = new Date(e.startTime)
                        const hour = start.getHours()
                        const sec = (new Date(e.endTime).getTime() - start.getTime()) / 1000
                        hourlyPattern[hour].seconds += sec
                    })
                }
            })

            return { aggregated, categories, totalSeconds, hourlyPattern, appByDay, dayCount: period.length }
        }

        const current = processPeriod(currentPeriod)
        const prev = processPeriod(prevPeriod)

        const totalChange = prev.totalSeconds > 0
            ? ((current.totalSeconds - prev.totalSeconds) / prev.totalSeconds) * 100
            : 0

        let currentStreak = 0
        let maxStreak = 0
        let tempStreak = 0
        const sortedDates = data.map(d => d.date).sort()
        for (let i = 0; i < sortedDates.length; i++) {
            const d1 = new Date(sortedDates[i])
            const d2 = i > 0 ? new Date(sortedDates[i - 1]) : null

            if (d2 && (d1.getTime() - d2.getTime()) <= 86400000 * 1.5) {
                tempStreak++
            } else {
                tempStreak = 1
            }
            maxStreak = Math.max(maxStreak, tempStreak)
            if (i === sortedDates.length - 1) currentStreak = tempStreak
        }

        const sortedApps = Object.entries(current.aggregated)
            .sort(([, a], [, b]) => b - a)
            .map(([name, seconds]) => ({
                name,
                seconds,
                loyalty: (current.appByDay[name]?.size || 0) / current.dayCount,
                category: getCategory(name)
            }))

        return {
            current,
            totalChange,
            currentStreak,
            maxStreak,
            sortedApps,
            categories: Object.entries(current.categories).map(([key, val]) => ({
                name: CATEGORIES[key].label,
                value: val,
                color: CATEGORIES[key].color
            })),
            hourlyPattern: current.hourlyPattern.map(p => ({
                ...p,
                hours: Number((p.seconds / 3600).toFixed(2))
            }))
        }
    }, [data, timeRange])

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type })
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false)
    }

    const exportFormats = {
        csv: () => {
            if (!analytics) return
            const headers = ["App Name", "Category", "Seconds", "Loyalty"]
            const content = [headers.join(","), ...analytics.sortedApps.map(a => `"${a.name}",${CATEGORIES[a.category].label},${a.seconds},${a.loyalty.toFixed(2)}`)].join("\n")
            downloadFile(content, `stats_${timeRange}.csv`, "text/csv")
        },
        json: () => {
            if (!analytics) return
            downloadFile(JSON.stringify(analytics, null, 2), `stats_${timeRange}.json`, "application/json")
        },
        txt: () => {
            if (!analytics) return
            const content = analytics.sortedApps.map(a => `${a.name}: ${formatDuration(a.seconds)} (${CATEGORIES[a.category].label})`).join("\n")
            downloadFile(`SILVER STAR STATS REPORT\nRange: ${timeRange}\n\n${content}`, `stats_${timeRange}.txt`, "text/plain")
        },
        html: () => {
            if (!analytics) return
            const rows = analytics.sortedApps.map(a => `<tr><td>${a.name}</td><td>${CATEGORIES[a.category].label}</td><td>${formatDuration(a.seconds)}</td></tr>`).join("")
            const content = `<html><body><h1>Silver Star Report (${timeRange})</h1><table border="1"><thead><tr><th>App</th><th>Category</th><th>Time</th></tr></thead><tbody>${rows}</tbody></table></body></html>`
            downloadFile(content, `stats_${timeRange}.html`, "text/html")
        },
        pdf: () => {
            if (!analytics) return
            const doc = new jsPDF()
            doc.setFontSize(20)
            doc.text(`Silver Star Activity Report (${timeRange})`, 20, 20)
            doc.setFontSize(12)
            doc.text(`Total Time: ${formatDuration(analytics.current.totalSeconds)}`, 20, 30)
            doc.text(`Peak Hour: ${(() => {
                const peak = [...analytics.hourlyPattern].sort((a, b) => b.seconds - a.seconds)[0]
                return peak ? `${peak.hour}:00` : 'N/A'
            })()}`, 20, 37)

            let y = 50
            doc.text("Top Apps:", 20, y)
            y += 10
            analytics.sortedApps.slice(0, 20).forEach(app => {
                if (y > 270) { doc.addPage(); y = 20 }
                doc.text(`${app.name}: ${formatDuration(app.seconds)}`, 20, y)
                y += 7
            })
            doc.save(`stats_${timeRange}.pdf`)
            setShowExportMenu(false)
        }
    }

    if (!analytics) return <div className="p-8 text-center text-muted-foreground">Loading Analytics...</div>

    return (
        <div className="h-full flex flex-col p-6 gap-6 overflow-hidden bg-background">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Performance Analytics</h1>
                    <p className="text-xs text-muted-foreground">Detailed insights into your digital habits.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-muted p-1 rounded-xl border">
                        {(['7d', '30d', 'all'] as const).map((r) => (
                            <Button
                                key={r}
                                variant="ghost"
                                size="sm"
                                onClick={() => setTimeRange(r)}
                                className={cn(
                                    "h-8 px-4 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                                    timeRange === r ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
                            </Button>
                        ))}
                    </div>

                    <div className="relative">
                        <Button variant="outline" size="sm" onClick={() => setShowExportMenu(!showExportMenu)} className="h-10 gap-2 border-primary/20">
                            <Download className="h-4 w-4" />
                            Export
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>

                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-card border rounded-xl shadow-xl z-50 p-1 animate-in fade-in zoom-in duration-200">
                                <button onClick={exportFormats.csv} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-muted rounded-lg flex items-center justify-between">CSV <span>.csv</span></button>
                                <button onClick={exportFormats.pdf} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-muted rounded-lg flex items-center justify-between">PDF <span>.pdf</span></button>
                                <button onClick={exportFormats.json} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-muted rounded-lg flex items-center justify-between">JSON <span>.json</span></button>
                                <button onClick={exportFormats.txt} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-muted rounded-lg flex items-center justify-between">Text <span>.txt</span></button>
                                <button onClick={exportFormats.html} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-muted rounded-lg flex items-center justify-between">HTML <span>.html</span></button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="h-12 w-12" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Tracked</div>
                    <div className="text-2xl font-bold text-primary tabular-nums">{formatDuration(analytics.current.totalSeconds)}</div>
                    <div className={cn("text-[10px] mt-1 font-bold", analytics.totalChange >= 0 ? "text-green-500" : "text-red-500")}>
                        {analytics.totalChange >= 0 ? '↑' : '↓'} {Math.abs(Math.round(analytics.totalChange))}% vs prev. period
                    </div>
                </div>

                <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Flame className="h-12 w-12 text-orange-500" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Active Streak</div>
                    <div className="text-2xl font-bold tabular-nums">{analytics.currentStreak} Days</div>
                    <div className="text-[10px] mt-1 text-muted-foreground">Record: {analytics.maxStreak} Days</div>
                </div>

                <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="h-12 w-12 text-yellow-500" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Peak Hour</div>
                    <div className="text-2xl font-bold">
                        {(() => {
                            const peak = [...analytics.hourlyPattern].sort((a, b) => b.seconds - a.seconds)[0]
                            return peak ? `${peak.hour % 12 || 12}${peak.hour >= 12 ? ' PM' : ' AM'}` : 'N/A'
                        })()}
                    </div>
                    <div className="text-[10px] mt-1 text-muted-foreground">Highest activity density</div>
                </div>

                <div className="bg-card border rounded-2xl p-5 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Target className="h-12 w-12" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Focus Score</div>
                    <div className="text-2xl font-bold">
                        {Math.round((analytics.current.totalSeconds / (analytics.current.dayCount * 8 * 3600)) * 100)}%
                    </div>
                    <div className="text-[10px] mt-1 text-muted-foreground">Of 8h workday goal</div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                <div className="col-span-8 bg-card border rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            Hourly Activity Pattern
                        </h3>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.hourlyPattern}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                <XAxis
                                    dataKey="hour"
                                    axisLine={false} tickLine={false}
                                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                    tickFormatter={(h) => `${h % 12 || 12}${h >= 12 ? 'p' : 'a'}`}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(v) => [`${v}h`, 'Time tracked']}
                                    labelFormatter={(h) => `Time: ${h}:00`}
                                />
                                <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-span-4 bg-card border rounded-2xl p-6 shadow-sm flex flex-col overflow-hidden">
                    <h3 className="font-bold text-sm mb-6 flex items-center gap-2">
                        <PieIcon className="h-4 w-4 text-primary" />
                        Category Breakdown
                    </h3>
                    <div className="flex-1 flex flex-col justify-center items-center relative">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={analytics.categories}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={80}
                                    paddingAngle={5} dataKey="value"
                                >
                                    {analytics.categories.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(v) => formatDuration(v as number)} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <div className="text-xl font-black">{Math.round((analytics.categories.find(c => c.name === 'Work')?.value || 0) / analytics.current.totalSeconds * 100)}%</div>
                            <div className="text-[8px] uppercase font-bold text-muted-foreground tracking-tighter">Work Focus</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col h-[300px]">
                <h3 className="font-bold text-sm mb-6 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> App Engagement</h3>
                <div className="flex-1 grid grid-cols-5 gap-6 overflow-hidden">
                    {analytics.sortedApps.slice(0, 10).map((app) => (
                        <div key={app.name} className="flex flex-col gap-3 p-4 rounded-xl border border-border/40 bg-muted/20">
                            <div className="flex items-center justify-between">
                                <AppIcon appName={app.name} icon={appIcons[app.name]} size={28} />
                                <div className="text-[10px] font-black">{Math.round(app.loyalty * 100)}%</div>
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold truncate mb-0.5">{app.name}</div>
                                <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">{formatDuration(app.seconds)}</div>
                            </div>
                            <div className="h-1 bg-muted rounded-full">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.round(app.loyalty * 100)}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

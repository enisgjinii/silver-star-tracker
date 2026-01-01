import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface HeatmapDay {
    date: string
    score: number
    count: number
}

interface ActivityHeatmapProps {
    data: HeatmapDay[]
    className?: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ActivityHeatmap({ data, className }: ActivityHeatmapProps) {
    const heatmapData = useMemo(() => {
        // Create a map of date -> data
        const dataMap = new Map(data.map(d => [d.date, d]))

        // Generate last 365 days
        const days: (HeatmapDay | null)[][] = []
        const today = new Date()
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 364)

        // Align to start of week (Sunday)
        const startDay = startDate.getDay()
        startDate.setDate(startDate.getDate() - startDay)

        let currentWeek: (HeatmapDay | null)[] = []
        let currentDate = new Date(startDate)

        while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split('T')[0]
            const dayData = dataMap.get(dateStr) || { date: dateStr, score: 0, count: 0 }

            currentWeek.push(dayData)

            if (currentWeek.length === 7) {
                days.push(currentWeek)
                currentWeek = []
            }

            currentDate.setDate(currentDate.getDate() + 1)
        }

        if (currentWeek.length > 0) {
            days.push(currentWeek)
        }

        return days
    }, [data])

    const getIntensity = (count: number): string => {
        if (count === 0) return 'bg-muted/30'
        if (count < 1800) return 'bg-green-200 dark:bg-green-900' // < 30 min
        if (count < 7200) return 'bg-green-400 dark:bg-green-700' // < 2 hours
        if (count < 14400) return 'bg-green-500 dark:bg-green-600' // < 4 hours
        return 'bg-green-600 dark:bg-green-500' // 4+ hours
    }

    const getMonthLabels = useMemo(() => {
        const labels: { month: string; week: number }[] = []
        let lastMonth = -1

        heatmapData.forEach((week, weekIndex) => {
            const firstDay = week.find(d => d)
            if (firstDay) {
                const month = new Date(firstDay.date).getMonth()
                if (month !== lastMonth) {
                    labels.push({ month: MONTHS[month], week: weekIndex })
                    lastMonth = month
                }
            }
        })

        return labels
    }, [heatmapData])

    const totalActivity = data.reduce((sum, d) => sum + d.count, 0)
    const totalHours = Math.round(totalActivity / 3600)
    const activeDays = data.filter(d => d.count > 0).length

    return (
        <div className={cn("bg-card border rounded-2xl p-6", className)}>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-sm">Activity Heatmap</h3>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <span><strong className="text-foreground">{totalHours}</strong> hours total</span>
                    <span><strong className="text-foreground">{activeDays}</strong> active days</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                {/* Month labels */}
                <div className="flex gap-1 mb-1 pl-8">
                    {getMonthLabels.map((label, i) => (
                        <div
                            key={i}
                            className="text-[10px] text-muted-foreground"
                            style={{
                                marginLeft: i === 0 ? 0 : `${(label.week - (getMonthLabels[i - 1]?.week || 0) - 1) * 14}px`
                            }}
                        >
                            {label.month}
                        </div>
                    ))}
                </div>

                <div className="flex">
                    {/* Day labels */}
                    <div className="flex flex-col gap-1 pr-2 text-[10px] text-muted-foreground">
                        {DAYS.map((day, i) => (
                            <div key={day} className="h-3 flex items-center" style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap grid */}
                    <div className="flex gap-1">
                        {heatmapData.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1">
                                {week.map((day, dayIndex) => (
                                    <div
                                        key={day?.date || `${weekIndex}-${dayIndex}`}
                                        className={cn(
                                            "w-3 h-3 rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-primary",
                                            day ? getIntensity(day.count) : 'bg-muted/10'
                                        )}
                                        title={day ? `${day.date}: ${Math.round(day.count / 60)} minutes` : ''}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-muted-foreground">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-muted/30" />
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
                <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
                <span>More</span>
            </div>
        </div>
    )
}

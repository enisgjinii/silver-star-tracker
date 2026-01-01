import { useEffect, useState, useMemo, useCallback } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import type { View } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'
import { getAppIcon, formatDuration } from '@/lib/app-icons'
import { CalendarToolbar } from './calendar/CalendarToolbar'
import { CalendarFilters } from './calendar/CalendarFilters'
import { EventPopover } from './calendar/EventPopover'
import { AppIcon } from './ui/AppIcon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/types/calendar'

const localizer = momentLocalizer(moment)

export function CalendarView() {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [view, setView] = useState<View>(Views.WEEK)
    const [date, setDate] = useState(new Date())
    const [selectedApps, setSelectedApps] = useState<string[]>([])
    const [availableApps, setAvailableApps] = useState<string[]>([])
    const [showFilters, setShowFilters] = useState(false)
    const [zoomLevel, setZoomLevel] = useState(1) // 0: Compact, 1: Normal, 2: Zoomed
    const [showGapAnalysis, setShowGapAnalysis] = useState(false)

    // Load Data
    useEffect(() => {
        // @ts-ignore
        Promise.all([
            window.api?.getActivityData(),
            window.api?.getAppIcons()
        ]).then(([data, appIcons]: [any[], Record<string, string>]) => {
            const calendarEvents: CalendarEvent[] = []
            const appSet = new Set<string>()

            for (const day of data || []) {
                for (const entry of day.entries) {
                    const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / 1000
                    if (duration < 60) continue // Skip entries shorter than 1 minute

                    appSet.add(entry.appName)
                    calendarEvents.push({
                        id: entry.id,
                        title: entry.appName,
                        start: new Date(entry.startTime),
                        end: new Date(entry.endTime),
                        appName: entry.appName,
                        color: getAppIcon(entry.appName).color,
                        icon: appIcons?.[entry.appName]
                    })
                }
            }

            setEvents(calendarEvents)
            const apps = Array.from(appSet).sort()
            setAvailableApps(apps)
            setSelectedApps(apps) // Default select all
        })
    }, [])

    // Filtered Events
    const filteredEvents = useMemo(() => {
        return events.filter(e => selectedApps.includes(e.appName))
    }, [events, selectedApps])

    // Summary Metrics
    const metrics = useMemo(() => {
        let totalSeconds = 0
        const appDurations: Record<string, number> = {}

        // Filter based on view range would be better, but for now filtering total filtered events
        // A real implementation would need to check if event overlaps the current View range

        filteredEvents.forEach(e => {
            const duration = (e.end.getTime() - e.start.getTime()) / 1000
            totalSeconds += duration
            appDurations[e.appName] = (appDurations[e.appName] || 0) + duration
        })

        const topApp = Object.entries(appDurations).sort(([, a], [, b]) => b - a)[0]

        return {
            totalDuration: formatDuration(totalSeconds),
            topAppName: topApp ? topApp[0] : 'N/A',
            topAppDuration: topApp ? formatDuration(topApp[1]) : ''
        }
    }, [filteredEvents])

    // Handlers
    const handleToggleApp = (appName: string) => {
        setSelectedApps(prev =>
            prev.includes(appName)
                ? prev.filter(a => a !== appName)
                : [...prev, appName]
        )
    }

    const handleSelectAll = () => setSelectedApps(availableApps)
    const handleClearFilters = () => setSelectedApps([])

    const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY', newDate?: Date) => {
        if (newDate) {
            setDate(newDate)
            return
        }

        const dateToUse = new Date(date)
        if (action === 'TODAY') {
            setDate(new Date())
            return
        }

        const method = view === Views.MONTH ? 'Month' : view === Views.WEEK ? 'Week' : 'Day'
        const amount = action === 'NEXT' ? 1 : -1

        if (method === 'Month') dateToUse.setMonth(dateToUse.getMonth() + amount)
        else if (method === 'Week') dateToUse.setDate(dateToUse.getDate() + (amount * 7))
        else dateToUse.setDate(dateToUse.getDate() + amount)

        setDate(dateToUse)
    }

    const handleExport = () => {
        const headers = ["ID", "App Name", "Start Time", "End Time", "Duration (s)"]
        const csvContent = [
            headers.join(","),
            ...filteredEvents.map(e => [
                e.id,
                `"${e.appName}"`, // Quote to handle commas in names
                e.start.toISOString(),
                e.end.toISOString(),
                (e.end.getTime() - e.start.getTime()) / 1000
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `activity_export_${moment(date).format("YYYY-MM-DD")}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Zoom Config
    const { step, timeslots } = useMemo(() => {
        switch (zoomLevel) {
            case 0: return { step: 60, timeslots: 1 } // Compact: 1 hour slots
            case 2: return { step: 15, timeslots: 4 } // Zoomed: 15 min slots
            default: return { step: 30, timeslots: 2 } // Normal: 30 min slots
        }
    }, [zoomLevel])

    // Event Component
    const EventWrapper = useCallback(({ event }: { event: CalendarEvent }) => {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className="h-full w-full rounded px-1 text-[10px] font-semibold leading-tight overflow-hidden text-white opacity-90 hover:opacity-100 transition-opacity flex items-center gap-1"
                            style={{ backgroundColor: event.color }}>
                            <AppIcon appName={event.appName} icon={event.icon} size={14} className="rounded-sm" />
                            <div className="truncate">{event.title}</div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="p-0 border-none bg-transparent shadow-none" avoidCollisions={true}>
                        <EventPopover event={event} />
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }, [])

    return (
        <div className="h-full flex flex-col p-4 gap-4 overflow-hidden">
            {/* Toolbar */}
            <CalendarToolbar
                date={date}
                view={view}
                onViewChange={setView}
                onNavigate={handleNavigate}
                onZoomIn={() => setZoomLevel(prev => Math.min(prev + 1, 2))}
                onZoomOut={() => setZoomLevel(prev => Math.max(prev - 1, 0))}
                onExport={handleExport}
                onToggleFilters={() => setShowFilters(!showFilters)}
                showFilters={showFilters}
                showGapAnalysis={showGapAnalysis}
                onToggleGapAnalysis={() => setShowGapAnalysis(!showGapAnalysis)}
            />

            <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
                {/* Filters Sidebar */}
                <div className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden flex flex-col gap-4",
                    showFilters ? "w-[260px] opacity-100" : "w-0 opacity-0"
                )}>
                    <div className="bg-primary/5 border rounded-xl p-4 space-y-2 flex-shrink-0">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selection Summary</h3>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[10px] text-muted-foreground">Total Time</div>
                                <div className="text-xl font-bold text-primary tabular-nums">{metrics.totalDuration}</div>
                            </div>
                        </div>
                        {metrics.topAppName !== 'N/A' && (
                            <div className="pt-2 border-t border-primary/10">
                                <div className="text-[10px] text-muted-foreground">Top App</div>
                                <div className="font-semibold text-sm truncate">{metrics.topAppName}</div>
                                <div className="text-[10px] opacity-70">{metrics.topAppDuration}</div>
                            </div>
                        )}
                    </div>

                    <CalendarFilters
                        availableApps={availableApps}
                        selectedApps={selectedApps}
                        onToggleApp={handleToggleApp}
                        onClearFilters={handleClearFilters}
                        onSelectAll={handleSelectAll}
                    />
                </div>

                {/* Calendar Area */}
                <div className="flex-1 bg-card rounded-xl border overflow-hidden shadow-sm relative">
                    {/* Productivity Heatmap (Mini) could go here as absolute overlay or specialized view */}
                    <Calendar
                        localizer={localizer}
                        events={filteredEvents}
                        startAccessor="start"
                        endAccessor="end"
                        view={view}
                        onView={setView}
                        date={date}
                        onNavigate={setDate}
                        step={step}
                        timeslots={timeslots}
                        components={{
                            event: EventWrapper,
                            toolbar: () => null // We use custom toolbar
                        }}
                        style={{ height: '100%' }}
                        dayPropGetter={(date) => {
                            // Gap Analysis: Highlight everything, standard non-worked areas will be default
                            // Actually, rbc doesn't easily let us style "gaps" directly without background events
                            // But we can style weekends/off-hours if we want

                            if (showGapAnalysis) {
                                // This is a naive implementation; improved gap analysis requires 'background events' for gaps
                                // For now, let's just create a visual distinction
                                return { style: { backgroundColor: 'hsl(var(--muted) / 0.3)' } }
                            }

                            // Simple highlighting for weekends
                            const day = date.getDay()
                            if (day === 0 || day === 6) {
                                return { className: 'bg-muted/10' }
                            }
                            return {}
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

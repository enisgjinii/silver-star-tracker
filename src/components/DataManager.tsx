import { useEffect, useState } from "react"
import { getAppIcon, formatDuration } from "@/lib/app-icons"
import type { ActivityData } from "@/vite-env"
import { Trash2, Database, FolderOpen, AlertTriangle } from "lucide-react"

export function DataManager() {
    const [data, setData] = useState<ActivityData[]>([])
    const [dataPath, setDataPath] = useState('')
    const [selectedDay, setSelectedDay] = useState<string | null>(null)

    const loadData = () => {
        window.api?.getActivityData().then(setData)
        window.api?.getDataPath().then(setDataPath)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleDelete = async (entryId: string) => {
        const confirmed = confirm('Delete this entry?')
        if (confirmed) {
            await window.api?.deleteEntry(entryId)
            loadData()
        }
    }

    const handleClearAll = async () => {
        const confirmed = confirm('⚠️ Clear ALL activity data? This cannot be undone.')
        if (confirmed) {
            await window.api?.clearAllData()
            loadData()
        }
    }

    const selectedDayData = data.find(d => d.date === selectedDay)

    return (
        <div className="h-full flex flex-col p-5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">Data Manager</h1>
                </div>
                <button
                    onClick={handleClearAll}
                    className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg hover:bg-destructive/20 transition-colors"
                >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Clear All
                </button>
            </div>

            {/* Data Path */}
            <div className="flex items-center gap-2 mb-5 p-2 bg-muted/50 rounded-lg flex-shrink-0">
                <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <code className="text-[10px] font-mono text-muted-foreground truncate">{dataPath}</code>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-5 min-h-0">
                {/* Days List */}
                <div className="w-56 flex flex-col bg-card border rounded-xl overflow-hidden">
                    <div className="p-3 border-b bg-muted/30">
                        <h2 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Days ({data.length})</h2>
                    </div>
                    <div className="flex-1 overflow-hidden p-2">
                        {data.map((day) => {
                            const totalTime = Object.values(day.appSummary).reduce((s, t) => s + t, 0)
                            return (
                                <button
                                    key={day.date}
                                    onClick={() => setSelectedDay(day.date)}
                                    className={`w-full text-left p-2.5 rounded-lg mb-1 transition-colors ${selectedDay === day.date
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'hover:bg-muted'
                                        }`}
                                >
                                    <div className="font-semibold text-xs">{day.date}</div>
                                    <div className="text-[10px] opacity-70">
                                        {day.entries.length} entries • {formatDuration(totalTime)}
                                    </div>
                                </button>
                            )
                        })}
                        {data.length === 0 && (
                            <div className="text-center text-muted-foreground py-8 text-sm">
                                No data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Entries */}
                <div className="flex-1 flex flex-col bg-card border rounded-xl overflow-hidden">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="font-semibold text-sm">
                            {selectedDay ? `Entries for ${selectedDay}` : 'Select a day'}
                        </h2>
                        {selectedDayData && (
                            <span className="text-xs text-muted-foreground">
                                {selectedDayData.entries.length} entries
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden p-2">
                        {selectedDayData?.entries.map((entry) => {
                            const { icon, color } = getAppIcon(entry.appName)
                            return (
                                <div
                                    key={entry.id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group"
                                >
                                    <div
                                        className="h-8 w-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                                        style={{ backgroundColor: color + '20' }}
                                    >
                                        {icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-xs truncate">{entry.appName}</div>
                                        <div className="text-[10px] text-muted-foreground truncate leading-tight">{entry.title}</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-xs font-bold tabular-nums">{formatDuration(entry.duration)}</div>
                                        <div className="text-[9px] text-muted-foreground uppercase font-black tracking-tight">
                                            {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-all"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )
                        })}
                        {!selectedDay && (
                            <div className="text-center text-muted-foreground py-8">
                                Select a day to view entries
                            </div>
                        )}
                        {selectedDay && selectedDayData?.entries.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No entries for this day
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

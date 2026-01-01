import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, ZoomIn, ZoomOut, Search, Clock } from 'lucide-react'
import { Views } from 'react-big-calendar'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface CalendarToolbarProps {
    date: Date
    view: string
    onViewChange: (view: any) => void
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY', newDate?: Date) => void
    onZoomIn: () => void
    onZoomOut: () => void
    onExport: () => void
    onToggleFilters: () => void
    showFilters: boolean
    showGapAnalysis: boolean
    onToggleGapAnalysis: () => void
}

export function CalendarToolbar({
    date,
    view,
    onViewChange,
    onNavigate,
    onZoomIn,
    onZoomOut,
    onExport,
    onToggleFilters,
    showFilters,
    showGapAnalysis,
    onToggleGapAnalysis
}: CalendarToolbarProps) {
    return (
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4 p-1">
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-card border rounded-lg overflow-hidden shadow-sm">
                    <Button variant="ghost" size="icon" onClick={() => onNavigate('PREV')} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onNavigate('TODAY')} className="font-bold text-xs px-3">
                        Today
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onNavigate('NEXT')} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "justify-start text-left font-bold text-lg border-none hover:bg-transparent px-2 h-auto",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-5 w-5 opacity-50" />
                            {format(date, "MMMM yyyy")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => d && onNavigate('TODAY', d)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex items-center gap-2">
                {/* View Switcher */}
                <div className="flex bg-muted/50 p-1 rounded-lg">
                    {[Views.DAY, Views.WEEK, Views.MONTH].map((v) => (
                        <button
                            key={v}
                            onClick={() => onViewChange(v)}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-semibold transition-all",
                                view === v
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            )}
                        >
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center bg-card border rounded-lg overflow-hidden shadow-sm">
                    <Button variant="ghost" size="icon" onClick={onZoomOut} className="h-8 w-8" title="Zoom Out">
                        <ZoomOut className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onZoomIn} className="h-8 w-8" title="Zoom In">
                        <ZoomIn className="h-3.5 w-3.5" />
                    </Button>
                </div>

                {/* Gap Analysis Toggle */}
                <Button
                    variant={showGapAnalysis ? 'secondary' : 'outline'}
                    size="icon"
                    onClick={onToggleGapAnalysis}
                    className="h-8 w-8"
                    title="Toggle Gap Analysis (Highlight Empty Time)"
                >
                    <Clock className="h-3.5 w-3.5" />
                </Button>

                {/* Search / Filter Toggle */}
                <Button
                    variant={showFilters ? 'secondary' : 'outline'}
                    size="icon"
                    onClick={onToggleFilters}
                    className="h-8 w-8"
                    title="Toggle Filters"
                >
                    <Search className="h-3.5 w-3.5" />
                </Button>

                {/* Export */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onExport}
                    className="h-8 gap-2 text-xs font-semibold"
                >
                    <Download className="h-3.5 w-3.5" />
                    Export
                </Button>
            </div>
        </div>
    )
}

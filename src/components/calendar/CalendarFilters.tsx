import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppIcon } from '../ui/AppIcon'

interface CalendarFiltersProps {
    availableApps: string[]
    selectedApps: string[]
    onToggleApp: (appName: string) => void
    onClearFilters: () => void
    onSelectAll: () => void
}

export function CalendarFilters({
    availableApps,
    selectedApps,
    onToggleApp,
    onClearFilters,
    onSelectAll
}: CalendarFiltersProps) {

    return (
        <div className="bg-card border rounded-xl p-4 flex flex-col gap-3 min-w-[240px]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">Filter Apps</span>
                </div>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onSelectAll}
                        title="Select All"
                    >
                        <Check className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onClearFilters}
                        title="Clear Filters"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
                {availableApps.map(appName => {
                    const isSelected = selectedApps.includes(appName)
                    return (
                        <button
                            key={appName}
                            onClick={() => onToggleApp(appName)}
                            className={cn(
                                "flex items-center gap-2 p-2 rounded-lg text-xs transition-colors hover:bg-muted/50",
                                isSelected ? "bg-muted/30" : "opacity-60"
                            )}
                        >
                            <AppIcon appName={appName} size={16} className="rounded-sm" />
                            <span className="truncate max-w-[140px] font-medium">{appName}</span>
                            {isSelected && (
                                <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                                    <Check className="h-2 w-2" />
                                </Badge>
                            )}
                        </button>
                    )
                })}

                {availableApps.length === 0 && (
                    <div className="text-center text-xs text-muted-foreground py-4">
                        No apps found
                    </div>
                )}
            </div>
        </div>
    )
}

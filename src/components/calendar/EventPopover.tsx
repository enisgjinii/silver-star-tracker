import { getAppIcon, formatDuration } from '@/lib/app-icons'
import type { CalendarEvent } from '@/types/calendar'

interface EventPopoverProps {
    event: CalendarEvent
}

export function EventPopover({ event }: EventPopoverProps) {
    const duration = (event.end.getTime() - event.start.getTime()) / 1000

    return (
        <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 w-[250px] space-y-2 relative z-50">
            <div className="flex items-center gap-3">
                <div
                    className="h-8 w-8 rounded bg-muted/20 flex items-center justify-center text-lg overflow-hidden"
                    style={{ backgroundColor: event.color + '20', color: event.color }}
                >
                    {event.icon ? (
                        <img src={event.icon} alt={event.appName} className="h-full w-full object-contain p-1" />
                    ) : (
                        getAppIcon(event.appName).icon
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-sm leading-none">{event.appName}</h4>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {formatDuration(duration)}
                    </span>
                </div>
            </div>

            <div className="pt-2 border-t flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                    <span>Start:</span>
                    <span className="font-mono text-foreground">
                        {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>End:</span>
                    <span className="font-mono text-foreground">
                        {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    )
}

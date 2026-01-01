// Activity tracking types
export interface ActivityEntry {
    id: string
    appName: string
    windowTitle: string
    title?: string
    startTime: string
    endTime: string
    duration: number
}

export interface ActivityData {
    date: string
    entries: ActivityEntry[]
    appSummary: Record<string, number>
}

// Calendar types
export interface CalendarEvent {
    id: string
    title: string
    start: Date
    end: Date
    resource?: {
        appName: string
        duration: number
        color: string
    }
}

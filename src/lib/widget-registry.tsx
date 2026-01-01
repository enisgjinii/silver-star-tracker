import type { ReactNode } from "react"
import { PomodoroTimer } from "@/components/PomodoroTimer"
// import { ActivityHeatmap } from "@/components/ActivityHeatmap"
import { TaskManager } from "@/components/TaskManager"
import { Stats } from "@/components/Stats"
import { Timer, BarChart2, CheckCircle2, Activity } from "lucide-react"

export interface WidgetDefinition {
    id: string
    title: string
    icon: any
    component: ReactNode
    defaultSize: 'small' | 'medium' | 'large' | 'full'
}

export const AVAILABLE_WIDGETS: WidgetDefinition[] = [
    {
        id: 'pomodoro',
        title: 'Focus Timer',
        icon: Timer,
        component: <div className="h-full overflow-hidden"><PomodoroTimer /></div>,
        defaultSize: 'medium'
    },
    {
        id: 'heatmap',
        title: 'Activity Heatmap',
        icon: Activity,
        // We need to pass data to heatmap, but for now we'll wrap it or let it fetch its own if possible. 
        // The current ActivityHeatmap expects data prop. We might need a wrapper.
        // For now, let's just use a placeholder text if data fetching is complex to decouple.
        // Actually, Stats.tsx fetches data. Let's create a wrapper in the dashboard component later.
        component: <div className="flex items-center justify-center h-full text-muted-foreground">Heatmap Data Source Required</div>,
        defaultSize: 'full'
    },
    {
        id: 'tasks',
        title: 'Task Board',
        icon: CheckCircle2,
        component: <div className="h-full overflow-hidden zoom-75"><TaskManager /></div>, // Zoom hack for mini view
        defaultSize: 'large'
    },
    {
        id: 'stats',
        title: 'Analytics Overview',
        icon: BarChart2,
        component: <div className="h-full overflow-hidden"><Stats /></div>,
        defaultSize: 'full'
    }
]

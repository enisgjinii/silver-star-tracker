import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Plus, X, Layout, Save, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AVAILABLE_WIDGETS } from "@/lib/widget-registry"

interface DashboardWidget {
    instanceId: string
    widgetId: string
}

export function CustomDashboard() {
    const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
        const saved = localStorage.getItem('dashboard-layout')
        if (saved) return JSON.parse(saved)
        return [] // Start empty or default
    })
    const [isEditing, setIsEditing] = useState(false)
    const [availablePanelOpen, setAvailablePanelOpen] = useState(false)

    useEffect(() => {
        localStorage.setItem('dashboard-layout', JSON.stringify(widgets))
    }, [widgets])

    const addWidget = (widgetId: string) => {
        const newWidget: DashboardWidget = {
            instanceId: Math.random().toString(36).substr(2, 9),
            widgetId
        }
        setWidgets([...widgets, newWidget])
    }

    const removeWidget = (instanceId: string) => {
        setWidgets(widgets.filter(w => w.instanceId !== instanceId))
    }

    const moveWidget = (index: number, direction: 'up' | 'down') => {
        const newWidgets = [...widgets]
        if (direction === 'up' && index > 0) {
            [newWidgets[index], newWidgets[index - 1]] = [newWidgets[index - 1], newWidgets[index]]
        } else if (direction === 'down' && index < newWidgets.length - 1) {
            [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]]
        }
        setWidgets(newWidgets)
    }

    const getWidgetDef = (id: string) => AVAILABLE_WIDGETS.find(w => w.id === id)

    return (
        <div className="h-full flex flex-col p-6 gap-6 overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Layout className="h-6 w-6 text-primary" />
                        My Dashboard
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {isEditing ? "Drag and drop (wip) or use arrows to arrange widgets." : "Your personalized productivity center."}
                    </p>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setAvailablePanelOpen(!availablePanelOpen)}>
                                <Plus className="h-4 w-4 mr-2" /> Add Widget
                            </Button>
                            <Button onClick={() => setIsEditing(false)}>
                                <Save className="h-4 w-4 mr-2" /> Done
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            Customize
                        </Button>
                    )}
                </div>
            </div>

            {/* Widget Selection Panel */}
            {isEditing && availablePanelOpen && (
                <div className="bg-muted/50 border rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4">
                    {AVAILABLE_WIDGETS.map(w => (
                        <button
                            key={w.id}
                            onClick={() => addWidget(w.id)}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border hover:border-primary transition-all text-center"
                        >
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                                <w.icon className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold">{w.title}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{w.defaultSize}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Dashboard Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 pb-20">
                {widgets.length === 0 && !isEditing && (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-2xl">
                        <Layout className="h-10 w-10 mb-2 opacity-20" />
                        <p>Dashboard is empty.</p>
                        <Button variant="link" onClick={() => setIsEditing(true)}>Customize to add widgets</Button>
                    </div>
                )}

                {widgets.map((widget, index) => {
                    const def = getWidgetDef(widget.widgetId)
                    if (!def) return null

                    // Basic sizing logic for grid columns
                    const colSpan = def.defaultSize === 'full' ? 'lg:col-span-12' :
                        def.defaultSize === 'large' ? 'lg:col-span-8' :
                            def.defaultSize === 'medium' ? 'lg:col-span-6' : 'lg:col-span-4'

                    return (
                        <div
                            key={widget.instanceId}
                            className={cn(
                                "bg-card border rounded-2xl p-1 shadow-sm flex flex-col overflow-hidden min-h-[300px] relative group transition-all",
                                colSpan,
                                isEditing && "ring-2 ring-primary/20",
                                // Height constraints based on widget type
                                def.id === 'pomodoro' ? 'h-[400px]' : 'h-[500px]'
                            )}
                        >
                            {isEditing && (
                                <div className="absolute top-2 right-2 z-50 flex items-center gap-1 bg-background/80 backdrop-blur-sm p-1 rounded-lg border shadow-sm">
                                    <button onClick={() => moveWidget(index, 'up')} className="p-1 hover:bg-muted rounded"><Move className="h-3 w-3 rotate-180" /></button>
                                    <button onClick={() => moveWidget(index, 'down')} className="p-1 hover:bg-muted rounded"><Move className="h-3 w-3" /></button>
                                    <div className="w-px h-3 bg-border mx-1" />
                                    <button onClick={() => removeWidget(widget.instanceId)} className="p-1 hover:bg-red-100 text-red-500 rounded"><X className="h-3 w-3" /></button>
                                </div>
                            )}

                            {/* Widget Content - Wrapped to prevent interaction when editing if needed */}
                            <div className={cn("flex-1 h-full w-full", isEditing && "pointer-events-none opacity-80 scale-[0.98] transition-transform")}>
                                {def.component}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

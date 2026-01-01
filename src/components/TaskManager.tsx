import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, RefreshCw, ChevronDown, ChevronRight, Calendar, Flag, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { integrations } from "@/lib/task-integrations"
import type { Task } from "@/lib/task-integrations"

export function TaskManager() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterProvider, setFilterProvider] = useState<string>('all')
    const [activeProviders, setActiveProviders] = useState<string[]>([])
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
        done: true
    })

    const loadTasks = async () => {
        setIsLoading(true)
        try {
            const allTasks: Task[] = []
            const active: string[] = []

            for (const adapter of integrations) {
                if (adapter.isConnected) {
                    active.push(adapter.id)
                    const providerTasks = await adapter.getTasks()
                    allTasks.push(...providerTasks)
                }
            }

            setTasks(allTasks)
            setActiveProviders(active)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadTasks()
    }, [])

    const handleComplete = async (taskId: string, providerId: string) => {
        // Optimistic update
        const originalTasks = [...tasks]
        setTasks(prev => prev.filter(t => t.id !== taskId))

        const adapter = integrations.find(i => i.id === providerId)
        if (adapter && adapter.completeTask) {
            const success = await adapter.completeTask(taskId)
            if (!success) {
                setTasks(originalTasks)
                console.error("Failed to complete task")
            }
        }
    }

    const toggleSection = (section: string) => {
        setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const filteredTasks = tasks.filter(task => {
        if (filterProvider !== 'all' && task.provider !== filterProvider) return false
        return true
    })

    const groupedTasks = {
        active: filteredTasks.filter(t => t.status !== 'done'),
        done: filteredTasks.filter(t => t.status === 'done')
    }

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'jira': return '🔷'
            case 'trello': return '📋'
            case 'github': return '🐙'
            case 'asana': return '⚪'
            case 'todoist': return '✅'
            default: return '🔌'
        }
    }

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'text-red-600'
            case 'medium': return 'text-orange-600'
            case 'low': return 'text-blue-600'
            default: return 'text-muted-foreground'
        }
    }

    if (activeProviders.length === 0 && !isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-background">
                <div className="max-w-md space-y-4">
                    <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto text-4xl">
                        🔌
                    </div>
                    <h2 className="text-2xl font-bold">No Integrations Connected</h2>
                    <p className="text-muted-foreground">
                        Connect services like Todoist to see your tasks here.
                    </p>
                    <Button onClick={() => window.location.hash = 'integrations'}>
                        Go to Integrations
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">Today</h1>
                    <span className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                        <button
                            onClick={() => setFilterProvider('all')}
                            className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", filterProvider === 'all' && "bg-background shadow-sm")}
                        >
                            All
                        </button>
                        {activeProviders.map(p => (
                            <button
                                key={p}
                                onClick={() => setFilterProvider(p)}
                                className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all capitalize", filterProvider === p && "bg-background shadow-sm")}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <Button variant="ghost" size="icon" onClick={loadTasks}>
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-[800px] mx-auto p-6 space-y-8">

                    {/* Active Tasks Section */}
                    <div className="space-y-2">
                        {groupedTasks.active.length === 0 && !isLoading ? (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>No active tasks. You're all caught up! 🎉</p>
                            </div>
                        ) : (
                            groupedTasks.active.map(task => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    getProviderIcon={getProviderIcon}
                                    getPriorityColor={getPriorityColor}
                                    onComplete={() => handleComplete(task.id, task.provider)}
                                />
                            ))
                        )}
                    </div>

                    {/* Done Section */}
                    {groupedTasks.done.length > 0 && (
                        <div className="space-y-2 pt-4 border-t">
                            <button
                                onClick={() => toggleSection('done')}
                                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                            >
                                {collapsedSections.done ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                Completed ({groupedTasks.done.length})
                            </button>

                            {!collapsedSections.done && (
                                <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                                    {groupedTasks.done.map(task => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            getProviderIcon={getProviderIcon}
                                            getPriorityColor={getPriorityColor}
                                            isDone
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function TaskRow({ task, getProviderIcon, getPriorityColor, isDone = false, onComplete }: { task: Task, getProviderIcon: any, getPriorityColor: any, isDone?: boolean, onComplete?: () => void }) {
    return (
        <div className="group flex items-start gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
            {/* Checkbox Area */}
            <div className="mt-1 flex-shrink-0">
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        if (!isDone && onComplete) onComplete()
                    }}
                    className={cn(
                        "h-5 w-5 rounded-full border border-muted-foreground/40 flex items-center justify-center transition-all hover:border-foreground",
                        isDone && "bg-muted-foreground/20 border-transparent text-muted-foreground",
                        !isDone && "hover:bg-primary/10 hover:border-primary"
                    )}>
                    {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
                <div className={cn(
                    "text-sm leading-tight mb-1",
                    isDone && "text-muted-foreground line-through decoration-muted-foreground/50"
                )}>
                    {task.title}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    {/* Provider & Project */}
                    <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                        <span>{getProviderIcon(task.provider)}</span>
                        {task.projectName && <span className="font-medium text-foreground/80">{task.projectName}</span>}
                    </div>

                    {/* Date */}
                    {task.dueDate && (
                        <div className={cn("flex items-center gap-1",
                            new Date(task.dueDate) < new Date() ? "text-red-500 font-medium" : "text-muted-foreground"
                        )}>
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                    )}

                    {/* Priority */}
                    {task.priority && (
                        <div className={cn("flex items-center gap-1", getPriorityColor(task.priority))}>
                            <Flag className="h-3 w-3" />
                        </div>
                    )}
                </div>
            </div>

            {/* Actions (Hover) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

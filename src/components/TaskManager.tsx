import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { integrations } from "@/lib/task-integrations"
import type { Task } from "@/lib/task-integrations"

export function TaskManager() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterProvider, setFilterProvider] = useState<string>('all')
    const [activeProviders, setActiveProviders] = useState<string[]>([])

    // Load tasks from all connected adapters
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

    const filteredTasks = tasks.filter(task => {
        if (filterProvider !== 'all' && task.provider !== filterProvider) return false
        return true
    })

    // Grouping helper
    const groupedTasks = {
        todo: filteredTasks.filter(t => t.status === 'todo'),
        inProgress: filteredTasks.filter(t => t.status === 'in-progress'),
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
            case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20'
            case 'medium': return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
            case 'low': return 'bg-green-500/10 text-green-600 border-green-500/20'
            default: return 'bg-muted text-muted-foreground border-transparent'
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
                        Connect services like Jira, Trello, or GitHub to see your tasks here.
                    </p>
                    <Button onClick={() => window.location.hash = 'integrations' /* This is a hack, usually handled by parent router */}>
                        Go to Integrations
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col p-6 gap-6 overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                        Unified Tasks
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {tasks.length} tasks synced from {activeProviders.length} sources
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-muted rounded-lg p-1">
                        <button
                            onClick={() => setFilterProvider('all')}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                filterProvider === 'all' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            All
                        </button>
                        {activeProviders.map(p => (
                            <button
                                key={p}
                                onClick={() => setFilterProvider(p)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-all capitalize",
                                    filterProvider === p ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <Button variant="ghost" size="icon" onClick={loadTasks} disabled={isLoading}>
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full gap-6 min-w-[800px]">
                    {/* To Do Column */}
                    <div className="flex-1 flex flex-col bg-muted/30 rounded-2xl border p-4">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="font-bold text-sm bg-muted/50 px-3 py-1 rounded-full border">To Do</h3>
                            <span className="text-xs text-muted-foreground">{groupedTasks.todo.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                            {groupedTasks.todo.map(task => (
                                <TaskCard key={task.id} task={task} getProviderIcon={getProviderIcon} getPriorityColor={getPriorityColor} />
                            ))}
                        </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="flex-1 flex flex-col bg-muted/30 rounded-2xl border p-4">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="font-bold text-sm bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full border border-blue-500/20">In Progress</h3>
                            <span className="text-xs text-muted-foreground">{groupedTasks.inProgress.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                            {groupedTasks.inProgress.map(task => (
                                <TaskCard key={task.id} task={task} getProviderIcon={getProviderIcon} getPriorityColor={getPriorityColor} />
                            ))}
                        </div>
                    </div>

                    {/* Done Column */}
                    <div className="flex-1 flex flex-col bg-muted/30 rounded-2xl border p-4">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="font-bold text-sm bg-green-500/10 text-green-600 px-3 py-1 rounded-full border border-green-500/20">Done</h3>
                            <span className="text-xs text-muted-foreground">{groupedTasks.done.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                            {groupedTasks.done.map(task => (
                                <TaskCard key={task.id} task={task} getProviderIcon={getProviderIcon} getPriorityColor={getPriorityColor} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TaskCard({ task, getProviderIcon, getPriorityColor }: { task: Task, getProviderIcon: any, getPriorityColor: any }) {
    return (
        <div className="bg-card border p-4 rounded-xl shadow-sm hover:shadow-md transition-all group dark:hover:bg-accent/5">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="text-sm font-semibold line-clamp-2 leading-tight">
                    {task.title}
                </div>
                <div title={task.provider} className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    {getProviderIcon(task.provider)}
                </div>
            </div>

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {task.id}
                    </span>
                    {task.priority && (
                        <span className={cn(
                            "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border",
                            getPriorityColor(task.priority)
                        )}>
                            {task.priority}
                        </span>
                    )}
                </div>
                {task.assignee && (
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {task.assignee.charAt(0)}
                    </div>
                )}
            </div>
        </div>
    )
}

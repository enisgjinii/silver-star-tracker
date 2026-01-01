import { cn } from "@/lib/utils"
import { LayoutDashboard, Layout as LayoutIcon, Timer, BarChart2, CalendarDays, Database, Sparkles, Play, Pause, ChevronLeft, ChevronRight, CheckCircle2, Link, Settings } from "lucide-react"
import { useState, useEffect } from "react"

interface LayoutProps {
    children: React.ReactNode
    currentView: string
    onViewChange: (view: string) => void
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
    const [isTracking, setIsTracking] = useState(true)
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        window.api?.isTracking().then(setIsTracking)
    }, [])

    const toggleTracking = async () => {
        const newValue = !isTracking
        const result = await window.api?.setTracking(newValue)
        setIsTracking(result ?? newValue)
    }

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
        { id: 'custom-dashboard', icon: LayoutIcon, label: 'My Dashboard' },
        { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
        { id: 'focus', icon: Timer, label: 'Focus' },
        { id: 'stats', icon: BarChart2, label: 'Stats' },
        { id: 'data', icon: Database, label: 'Data' },
    ]

    const premiumItems = [
        { id: 'tasks', icon: CheckCircle2, label: 'Tasks' },
        { id: 'achievements', icon: Sparkles, label: 'Achievements' },
        { id: 'coach', icon: LayoutDashboard, label: 'AI Coach' },
        { id: 'integrations', icon: Link, label: 'Integrations' },
    ]


    return (
        <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
            {/* Sidebar */}
            <div className={cn(
                "border-r border-border/40 bg-card/30 backdrop-blur-xl flex flex-col z-50 transition-all duration-300 relative",
                isCollapsed ? "w-20" : "w-64"
            )}>
                {/* Header */}
                {/* Header */}
                <div className={cn(
                    "h-14 flex items-center border-b border-border/40 mb-2 drag-region transition-all duration-300",
                    // Add padding for macOS traffic lights when not collapsed, otherwise center the logo
                    isCollapsed ? "justify-center px-0" : "pl-20 pr-4"
                )}>
                    <div className={cn("flex items-center gap-3", !isCollapsed && "w-full")}>
                        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground shadow-sm flex-shrink-0">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-semibold tracking-tight leading-none truncate">Silver Star</span>
                                <span className="text-[10px] text-muted-foreground font-medium truncate">Enterprise</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-16 h-6 w-6 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors z-[60]"
                >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </button>

                {/* Nav Items */}
                <div className="flex-1 px-3 py-2 overflow-y-auto">
                    {!isCollapsed && (
                        <div className="mb-2 px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider animate-in fade-in duration-200">
                            Platform
                        </div>
                    )}
                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group relative",
                                    currentView === item.id
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    isCollapsed && "justify-center px-0"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon className={cn("h-4 w-4 flex-shrink-0", currentView === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                                {currentView === item.id && (
                                    <div className={cn("absolute bg-primary rounded-full", isCollapsed ? "bottom-1 w-1 h-1" : "right-3 w-1.5 h-1.5")} />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Premium Section */}
                    {!isCollapsed && (
                        <div className="mt-4 mb-2 px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider animate-in fade-in duration-200">
                            Premium
                        </div>
                    )}
                    <nav className="space-y-1 mt-1">
                        {premiumItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group relative",
                                    currentView === item.id
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    isCollapsed && "justify-center px-0"
                                )}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <item.icon className={cn("h-4 w-4 flex-shrink-0", currentView === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                                {currentView === item.id && (
                                    <div className={cn("absolute bg-primary rounded-full", isCollapsed ? "bottom-1 w-1 h-1" : "right-3 w-1.5 h-1.5")} />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>


                {/* Bottom Actions */}
                <div className="p-3 border-t border-border/40 space-y-2">
                    {!isCollapsed && (
                        <div className="mb-2 px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            Controls
                        </div>
                    )}

                    <button
                        onClick={toggleTracking}
                        className={cn(
                            "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all border border-transparent",
                            isTracking
                                ? "bg-green-500/5 text-green-700 hover:bg-green-500/10 border-green-500/10"
                                : "bg-red-500/5 text-red-700 hover:bg-red-500/10 border-red-500/10",
                            isCollapsed ? "justify-center" : "justify-between"
                        )}
                        title={isTracking ? 'Tracking Active' : 'Tracking Paused'}
                    >
                        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                            {isTracking ? <Play className="h-4 w-4 fill-current flex-shrink-0" /> : <Pause className="h-4 w-4 fill-current flex-shrink-0" />}
                            {!isCollapsed && <span>{isTracking ? 'Tracking Active' : 'Tracking Paused'}</span>}
                        </div>
                        {!isCollapsed && (
                            <div className={cn("w-2 h-2 rounded-full animate-pulse", isTracking ? "bg-green-500" : "bg-red-500")} />
                        )}
                    </button>

                    <button
                        onClick={() => onViewChange('settings')}
                        className={cn(
                            "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
                            isCollapsed ? "justify-center" : "gap-3"
                        )}
                        title="Theme Settings"
                    >
                        <Settings className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span>Settings</span>}
                    </button>
                </div>


                {/* User Profile Stub */}
                <div className="p-3 border-t border-border/40">
                    <div className={cn("flex items-center gap-3 px-2 py-1", isCollapsed && "justify-center px-0")}>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-sm flex-shrink-0" />
                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-xs font-semibold truncate text-foreground">Admin User</span>
                                <span className="text-[10px] text-muted-foreground truncate">admin@silverstar.ai</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative flex flex-col">
                <div className="h-full w-full relative z-10 transition-all duration-300">
                    {children}
                </div>
            </main>
        </div>
    )
}

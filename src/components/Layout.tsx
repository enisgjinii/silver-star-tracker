import { cn } from "@/lib/utils"
import { LayoutDashboard, Timer, BarChart2, CalendarDays, Database, Sparkles, Sun, Moon, Play, Pause } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { useState, useEffect } from "react"

interface LayoutProps {
    children: React.ReactNode
    currentView: string
    onViewChange: (view: string) => void
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
    const { theme, toggleTheme } = useTheme()
    const [isTracking, setIsTracking] = useState(true)

    useEffect(() => {
        window.api?.isTracking().then(setIsTracking)
    }, [])

    const toggleTracking = async () => {
        const newValue = !isTracking
        const result = await window.api?.setTracking(newValue)
        setIsTracking(result ?? newValue)
    }

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
        { id: 'focus', icon: Timer, label: 'Focus' },
        { id: 'stats', icon: BarChart2, label: 'Stats' },
        { id: 'data', icon: Database, label: 'Data' },
    ]

    return (
        <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
            {/* Sidebar */}
            <div className="w-64 border-r border-border/40 bg-card/30 backdrop-blur-xl flex flex-col z-50 transition-all duration-300">
                {/* Header */}
                <div className="h-14 px-4 flex items-center border-b border-border/40 mb-2">
                    <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                            <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold tracking-tight leading-none">Silver Star</span>
                            <span className="text-[10px] text-muted-foreground font-medium">Enterprise Edition</span>
                        </div>
                    </div>
                </div>

                {/* Nav Items */}
                <div className="flex-1 px-3 py-2">
                    <div className="mb-2 px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Platform
                    </div>
                    <nav className="space-y-0.5">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group",
                                    currentView === item.id
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", currentView === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                <span>{item.label}</span>
                                {currentView === item.id && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-border/40 space-y-2">
                    <div className="mb-2 px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Controls
                    </div>

                    <button
                        onClick={toggleTracking}
                        className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-all border border-transparent",
                            isTracking
                                ? "bg-green-500/5 text-green-700 hover:bg-green-500/10 border-green-500/10"
                                : "bg-red-500/5 text-red-700 hover:bg-red-500/10 border-red-500/10"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {isTracking ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
                            <span>{isTracking ? 'Tracking Active' : 'Tracking Paused'}</span>
                        </div>
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", isTracking ? "bg-green-500" : "bg-red-500")} />
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>
                </div>

                {/* User Profile Stub */}
                <div className="p-3 border-t border-border/40">
                    <div className="flex items-center gap-3 px-2 py-1">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-sm" />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-semibold truncate text-foreground">Admin User</span>
                            <span className="text-[10px] text-muted-foreground truncate">admin@silverstar.ai</span>
                        </div>
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

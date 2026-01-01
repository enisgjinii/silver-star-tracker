import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Shield, Eye, EyeOff, Lock, Unlock, Plus, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PrivacyRule {
    id: string
    appName: string
    pattern: string
    enabled: boolean
}

export function PrivacySettings() {
    const [privateApps, setPrivateApps] = useState<PrivacyRule[]>([])
    const [privateModeActive, setPrivateModeActive] = useState(false)
    const [newAppName, setNewAppName] = useState('')
    const [availableApps, setAvailableApps] = useState<string[]>([])

    useEffect(() => {
        // Load tracked apps to suggest
        loadAvailableApps()
        loadPrivacySettings()
    }, [])

    const loadAvailableApps = async () => {
        try {
            const activity = await window.api?.getActivityData()
            if (activity) {
                const apps = new Set<string>()
                activity.forEach((day: any) => {
                    Object.keys(day.appSummary || {}).forEach(app => apps.add(app))
                })
                setAvailableApps(Array.from(apps).sort())
            }
        } catch (error) {
            console.error('Failed to load apps:', error)
        }
    }

    const loadPrivacySettings = () => {
        // Would load from localStorage or backend
        const saved = localStorage.getItem('privacy-rules')
        if (saved) {
            setPrivateApps(JSON.parse(saved))
        }
        setPrivateModeActive(localStorage.getItem('private-mode') === 'true')
    }

    const savePrivacySettings = (rules: PrivacyRule[]) => {
        localStorage.setItem('privacy-rules', JSON.stringify(rules))
        setPrivateApps(rules)
    }

    const addPrivateApp = (appName: string) => {
        if (!appName.trim()) return
        const newRule: PrivacyRule = {
            id: Date.now().toString(),
            appName: appName.trim(),
            pattern: appName.trim().toLowerCase(),
            enabled: true
        }
        savePrivacySettings([...privateApps, newRule])
        setNewAppName('')
    }

    const removePrivateApp = (id: string) => {
        savePrivacySettings(privateApps.filter(app => app.id !== id))
    }

    const toggleRule = (id: string) => {
        savePrivacySettings(privateApps.map(app =>
            app.id === id ? { ...app, enabled: !app.enabled } : app
        ))
    }

    const togglePrivateMode = () => {
        const newValue = !privateModeActive
        setPrivateModeActive(newValue)
        localStorage.setItem('private-mode', String(newValue))
    }

    const filteredApps = availableApps.filter(app =>
        app.toLowerCase().includes(newAppName.toLowerCase()) &&
        !privateApps.some(p => p.appName.toLowerCase() === app.toLowerCase())
    )

    return (
        <div className="h-full flex flex-col p-6 gap-6 overflow-auto bg-background">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        Privacy & Security
                    </h1>
                    <p className="text-xs text-muted-foreground">Control what gets tracked and keep your data safe</p>
                </div>
            </div>

            {/* Private Mode Toggle */}
            <div className="bg-card border rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-full flex items-center justify-center transition-all",
                            privateModeActive ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
                        )}>
                            {privateModeActive ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                        </div>
                        <div>
                            <h3 className="font-bold">Private Mode</h3>
                            <p className="text-sm text-muted-foreground">
                                {privateModeActive
                                    ? "Tracking is paused. No activity is being recorded."
                                    : "Activity tracking is active."}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={togglePrivateMode}
                        variant={privateModeActive ? "destructive" : "default"}
                        className="gap-2"
                    >
                        {privateModeActive ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        {privateModeActive ? "Resume Tracking" : "Enable Private Mode"}
                    </Button>
                </div>
            </div>

            {/* Excluded Apps */}
            <div className="bg-card border rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-primary" />
                    Excluded Apps
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    These apps will not be tracked even when tracking is enabled.
                </p>

                {/* Add new app */}
                <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search or enter app name..."
                            value={newAppName}
                            onChange={(e) => setNewAppName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addPrivateApp(newAppName)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
                        />
                    </div>
                    <Button onClick={() => addPrivateApp(newAppName)} disabled={!newAppName.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                    </Button>
                </div>

                {/* Quick add suggestions */}
                {newAppName && filteredApps.length > 0 && (
                    <div className="mb-4 p-2 border rounded-lg bg-muted/50">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                            Suggestions from your tracked apps:
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {filteredApps.slice(0, 8).map(app => (
                                <button
                                    key={app}
                                    onClick={() => addPrivateApp(app)}
                                    className="px-3 py-1 text-sm bg-background border rounded-full hover:bg-muted transition-colors"
                                >
                                    {app}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Current rules */}
                <div className="space-y-2">
                    {privateApps.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No apps excluded yet. Add apps above to exclude them from tracking.
                        </div>
                    ) : (
                        privateApps.map(rule => (
                            <div
                                key={rule.id}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                                    rule.enabled ? "bg-muted/50" : "bg-muted/20 opacity-50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleRule(rule.id)}
                                        className={cn(
                                            "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                                            rule.enabled ? "bg-primary border-primary" : "border-muted-foreground"
                                        )}
                                    >
                                        {rule.enabled && <span className="text-primary-foreground text-xs">✓</span>}
                                    </button>
                                    <span className={cn("font-medium", !rule.enabled && "line-through")}>
                                        {rule.appName}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removePrivateApp(rule.id)}
                                    className="p-1 hover:bg-muted rounded transition-colors"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Data Security Info */}
            <div className="bg-card border rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Data Security
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                        <div className="font-bold mb-1">🔒 Local Storage</div>
                        <p className="text-sm text-muted-foreground">
                            All your data is stored locally on your device. Nothing is sent to external servers.
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                        <div className="font-bold mb-1">🛡️ End-to-End Encryption</div>
                        <p className="text-sm text-muted-foreground">
                            Premium feature: Enable encryption for your exported reports.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

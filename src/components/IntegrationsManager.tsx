import { useState } from "react"
import { cn } from "@/lib/utils"
import { Check, X, Link, Loader2, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { integrations, SimulationTaskAdapter } from "@/lib/task-integrations"

// Helper to get brand colors/icons for services
const getServiceConfig = (id: string) => {
    switch (id) {
        case 'jira': return { color: 'bg-[#0052CC]', icon: '🔷' }
        case 'trello': return { color: 'bg-[#0079BF]', icon: '📋' }
        case 'github': return { color: 'bg-[#24292e]', icon: '🐙' }
        case 'asana': return { color: 'bg-[#F06A6A]', icon: '⚪' } // Asana pinkish red
        default: return { color: 'bg-gray-500', icon: '🔌' }
    }
}

export function IntegrationsManager() {
    const [adapters, setAdapters] = useState<SimulationTaskAdapter[]>(integrations)
    const [connectingId, setConnectingId] = useState<string | null>(null)
    const [tokenInput, setTokenInput] = useState('')
    const [activeModal, setActiveModal] = useState<string | null>(null)

    // Force re-render helper since adapters are mutable
    const refreshAdapters = () => setAdapters([...integrations])

    const handleConnect = async (adapter: SimulationTaskAdapter) => {
        setConnectingId(adapter.id)
        try {
            const success = await adapter.connect(tokenInput)
            if (success) {
                setActiveModal(null)
                setTokenInput('')
                refreshAdapters()
            }
        } catch (e) {
            console.error(e)
        } finally {
            setConnectingId(null)
        }
    }

    const handleDisconnect = (adapter: SimulationTaskAdapter) => {
        adapter.disconnect()
        refreshAdapters()
    }

    return (
        <div className="h-full flex flex-col p-6 gap-6 overflow-auto bg-background animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Link className="h-6 w-6 text-primary" />
                        Integrations Hub
                    </h1>
                    <p className="text-xs text-muted-foreground">Connect your productivity tools to centralized your workflow</p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adapters.map((adapter) => {
                    const config = getServiceConfig(adapter.id)
                    return (
                        <div
                            key={adapter.id}
                            className="bg-card border rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center text-2xl shadow-sm text-white",
                                    config.color
                                )}>
                                    {config.icon}
                                </div>
                                {adapter.isConnected ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold border border-green-500/20">
                                        <Check className="h-3 w-3" /> Connected
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium border">
                                        Not Connected
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="font-bold text-lg">{adapter.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    Sync tasks, issues, and projects from {adapter.name} directly into your dashboard.
                                </p>
                            </div>

                            <div className="mt-auto pt-4 relative z-10">
                                {adapter.isConnected ? (
                                    <Button
                                        variant="outline"
                                        className="w-full border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900/30 dark:hover:bg-red-900/10"
                                        onClick={() => handleDisconnect(adapter)}
                                    >
                                        Disconnect
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full"
                                        onClick={() => setActiveModal(adapter.id)}
                                    >
                                        Connect
                                    </Button>
                                )}
                            </div>

                            {/* Background Decoration */}
                            <div className={cn(
                                "absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 blur-2xl transition-all group-hover:opacity-10 pointer-events-none",
                                config.color.replace('bg-', 'bg-')
                            )} />
                        </div>
                    )
                })}
            </div>

            {/* Connection Modal */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background border rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Connect {integrations.find(i => i.id === activeModal)?.name}</h3>
                            <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-muted rounded-full">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-xl text-xs text-muted-foreground flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                                    <Database className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-foreground mb-1">Simulation Mode</p>
                                    This is a simulated environment. You can enter any dummy token (e.g. "123") to test the integration. No real data will be accessed.
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">API Token / Key</label>
                                <input
                                    type="password"
                                    value={tokenInput}
                                    onChange={(e) => setTokenInput(e.target.value)}
                                    placeholder="Enter your access token..."
                                    className="w-full px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" className="flex-1" onClick={() => setActiveModal(null)}>Cancel</Button>
                                <Button
                                    className="flex-1"
                                    disabled={!tokenInput || connectingId === activeModal}
                                    onClick={() => {
                                        const adapter = integrations.find(i => i.id === activeModal)
                                        if (adapter) handleConnect(adapter)
                                    }}
                                >
                                    {connectingId === activeModal ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting...
                                        </>
                                    ) : (
                                        'Connect Account'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

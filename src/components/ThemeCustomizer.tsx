import { useTheme } from "@/hooks/use-theme"
import { THEMES } from "@/lib/themes"
import { cn } from "@/lib/utils"
import { PaintBucket, Check, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeCustomizer() {
    const { theme, toggleTheme, presetId, setPreset } = useTheme()

    return (
        <div className="h-full flex flex-col p-6 gap-6 overflow-auto bg-background animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <PaintBucket className="h-6 w-6 text-primary" />
                        Theme Settings
                    </h1>
                    <p className="text-xs text-muted-foreground">Customize the look and feel of your workspace.</p>
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-sm mb-4">Appearance Mode</h3>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                    <button
                        onClick={() => theme === 'dark' && toggleTheme()}
                        className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border transition-all",
                            theme === 'light' ? "bg-primary/5 border-primary ring-1 ring-primary" : "hover:bg-muted"
                        )}
                    >
                        <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                            <Sun className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold">Light Mode</div>
                            <div className="text-[10px] text-muted-foreground">Clean & bright</div>
                        </div>
                        {theme === 'light' && <Check className="ml-auto h-4 w-4 text-primary" />}
                    </button>

                    <button
                        onClick={() => theme === 'light' && toggleTheme()}
                        className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border transition-all",
                            theme === 'dark' ? "bg-primary/5 border-primary ring-1 ring-primary" : "hover:bg-muted"
                        )}
                    >
                        <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center">
                            <Moon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold">Dark Mode</div>
                            <div className="text-[10px] text-muted-foreground">Easy on the eyes</div>
                        </div>
                        {theme === 'dark' && <Check className="ml-auto h-4 w-4 text-primary" />}
                    </button>
                </div>
            </div>

            {/* Presets */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-sm mb-4">Color Presets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {THEMES.map(preset => (
                        <button
                            key={preset.id}
                            onClick={() => setPreset(preset.id)}
                            className={cn(
                                "group relative overflow-hidden rounded-xl border p-1 transition-all",
                                presetId === preset.id ? "ring-2 ring-primary border-transparent" : "hover:border-primary/50"
                            )}
                        >
                            <div className="flex h-full w-full flex-col gap-2 rounded-lg bg-background p-4">
                                <div className="flex items-center justify-between font-semibold">
                                    <span>{preset.name}</span>
                                    {presetId === preset.id && <Check className="h-4 w-4 text-primary" />}
                                </div>
                                <div className="flex gap-2">
                                    <div
                                        className="h-6 w-6 rounded-full border shadow-sm"
                                        style={{ backgroundColor: `hsl(${preset.colors.primary})` }}
                                    />
                                    <div
                                        className="h-6 w-6 rounded-full border shadow-sm"
                                        style={{ backgroundColor: `hsl(${preset.colors.background})` }}
                                    />
                                    <div
                                        className="h-6 w-6 rounded-full border shadow-sm"
                                        style={{ backgroundColor: `hsl(${preset.colors.accent})` }}
                                    />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview Card */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-sm mb-4">Live Preview</h3>
                <div className="flex gap-4">
                    <Button>Primary Button</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                </div>
            </div>

        </div>
    )
}

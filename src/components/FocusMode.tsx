import { useState, useEffect } from "react"
import { Play, Pause, RotateCcw, Timer } from "lucide-react"

export function FocusMode() {
    const [timeLeft, setTimeLeft] = useState(25 * 60)
    const [isActive, setIsActive] = useState(false)
    const [preset, setPreset] = useState(25)

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setIsActive(false)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isActive, timeLeft])

    const toggleTimer = () => setIsActive(!isActive)

    const resetTimer = (mins: number = preset) => {
        setIsActive(false)
        setPreset(mins)
        setTimeLeft(mins * 60)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const progress = ((preset * 60 - timeLeft) / (preset * 60)) * 100

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 overflow-hidden">
            <div className="flex flex-col items-center gap-8 w-full">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Timer className="h-5 w-5 text-primary" />
                        <h1 className="text-xl font-bold tracking-tight">Focus Mode</h1>
                    </div>
                    <p className="text-muted-foreground text-xs font-medium">Stay focused, stay productive</p>
                </div>

                {/* Timer Circle */}
                <div className="relative">
                    <svg className="w-56 h-56 transform -rotate-90">
                        <circle
                            cx="112"
                            cy="112"
                            r="104"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="6"
                        />
                        <circle
                            cx="112"
                            cy="112"
                            r="104"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="6"
                            strokeDasharray={2 * Math.PI * 104}
                            strokeDashoffset={2 * Math.PI * 104 * (1 - progress / 100)}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl font-mono font-bold tabular-nums">
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTimer}
                        className={`h-14 w-14 rounded-full flex items-center justify-center transition-all shadow-md ${isActive
                            ? "bg-muted text-foreground"
                            : "bg-primary text-primary-foreground"
                            }`}
                    >
                        {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                    </button>
                    <button
                        onClick={() => resetTimer()}
                        className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                        <RotateCcw className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Presets */}
                <div className="flex gap-3">
                    {[15, 25, 45, 60].map((mins) => (
                        <button
                            key={mins}
                            onClick={() => resetTimer(mins)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${preset === mins
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            {mins}m
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

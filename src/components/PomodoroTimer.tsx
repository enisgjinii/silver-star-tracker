import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Play, Pause, RotateCcw, Coffee, Zap, Volume2, VolumeX, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PomodoroSettings {
    workMinutes: number
    shortBreakMinutes: number
    longBreakMinutes: number
    sessionsBeforeLongBreak: number
}

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak'

const DEFAULT_SETTINGS: PomodoroSettings = {
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4
}

export function PomodoroTimer() {
    const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS)
    const [mode, setMode] = useState<PomodoroMode>('work')
    const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60)
    const [isRunning, setIsRunning] = useState(false)
    const [completedSessions, setCompletedSessions] = useState(0)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [showSettings, setShowSettings] = useState(false)

    const intervalRef = useRef<number | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const getModeTime = useCallback((m: PomodoroMode) => {
        switch (m) {
            case 'work': return settings.workMinutes * 60
            case 'shortBreak': return settings.shortBreakMinutes * 60
            case 'longBreak': return settings.longBreakMinutes * 60
        }
    }, [settings])

    const playSound = useCallback(() => {
        if (soundEnabled && audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch(() => { })
        }
    }, [soundEnabled])

    const switchMode = useCallback((newMode: PomodoroMode) => {
        setMode(newMode)
        setTimeLeft(getModeTime(newMode))
        setIsRunning(false)
    }, [getModeTime])

    const handleTimerComplete = useCallback(() => {
        playSound()

        if (mode === 'work') {
            const newCompleted = completedSessions + 1
            setCompletedSessions(newCompleted)

            if (newCompleted % settings.sessionsBeforeLongBreak === 0) {
                switchMode('longBreak')
            } else {
                switchMode('shortBreak')
            }
        } else {
            switchMode('work')
        }
    }, [mode, completedSessions, settings.sessionsBeforeLongBreak, playSound, switchMode])

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!)
                        handleTimerComplete()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isRunning, timeLeft, handleTimerComplete])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const progress = 1 - (timeLeft / getModeTime(mode))
    const circumference = 2 * Math.PI * 120

    const modeColors = {
        work: { bg: 'from-blue-500/20 to-indigo-500/20', ring: 'stroke-blue-500', text: 'text-blue-500' },
        shortBreak: { bg: 'from-green-500/20 to-emerald-500/20', ring: 'stroke-green-500', text: 'text-green-500' },
        longBreak: { bg: 'from-purple-500/20 to-pink-500/20', ring: 'stroke-purple-500', text: 'text-purple-500' }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-background">
            <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVopQn3S4rODThA1ct/v2bB+SDRawvLHhUoRB1PP77NHKA==" />

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Focus Timer</h1>
                <p className="text-muted-foreground text-sm">Stay productive with the Pomodoro technique</p>
            </div>

            <div className="flex gap-2 mb-8">
                {(['work', 'shortBreak', 'longBreak'] as const).map((m) => (
                    <Button
                        key={m}
                        variant="ghost"
                        size="sm"
                        onClick={() => switchMode(m)}
                        className={cn(
                            "px-4 py-2 rounded-lg font-medium transition-all",
                            mode === m ? `${modeColors[m].text} bg-muted` : "text-muted-foreground"
                        )}
                    >
                        {m === 'work' ? <Zap className="h-4 w-4 mr-2" /> :
                            m === 'shortBreak' ? <Coffee className="h-4 w-4 mr-2" /> :
                                <Coffee className="h-4 w-4 mr-2" />}
                        {m === 'work' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </Button>
                ))}
            </div>

            <div className={cn(
                "relative w-72 h-72 rounded-full bg-gradient-to-br flex items-center justify-center mb-8 transition-all duration-500",
                modeColors[mode].bg
            )}>
                <svg className="absolute w-full h-full -rotate-90">
                    <circle
                        cx="144" cy="144" r="120"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/30"
                    />
                    <circle
                        cx="144" cy="144" r="120"
                        fill="none"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress)}
                        className={cn("transition-all duration-1000", modeColors[mode].ring)}
                    />
                </svg>

                <div className="text-center z-10">
                    <div className="text-6xl font-bold tabular-nums tracking-tight">
                        {formatTime(timeLeft)}
                    </div>
                    <div className={cn("text-sm font-medium mt-2 uppercase tracking-wider", modeColors[mode].text)}>
                        {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <Button
                    onClick={() => setIsRunning(!isRunning)}
                    size="lg"
                    className={cn(
                        "h-14 w-14 rounded-full shadow-lg transition-all",
                        isRunning ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                    )}
                >
                    {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                        setIsRunning(false)
                        setTimeLeft(getModeTime(mode))
                    }}
                    className="h-14 w-14 rounded-full"
                >
                    <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="h-14 w-14 rounded-full"
                >
                    {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>

                <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => setShowSettings(!showSettings)}
                    className="h-14 w-14 rounded-full"
                >
                    <Settings className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Sessions completed:</span>
                <span className="font-bold text-foreground">{completedSessions}</span>
            </div>

            {showSettings && (
                <div className="mt-8 p-6 bg-card border rounded-2xl shadow-lg w-full max-w-md animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="font-bold mb-4">Timer Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm">Focus Duration (min)</label>
                            <input
                                type="number"
                                value={settings.workMinutes}
                                onChange={(e) => setSettings({ ...settings, workMinutes: parseInt(e.target.value) || 25 })}
                                className="w-20 px-3 py-1 border rounded-lg text-center bg-background"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm">Short Break (min)</label>
                            <input
                                type="number"
                                value={settings.shortBreakMinutes}
                                onChange={(e) => setSettings({ ...settings, shortBreakMinutes: parseInt(e.target.value) || 5 })}
                                className="w-20 px-3 py-1 border rounded-lg text-center bg-background"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm">Long Break (min)</label>
                            <input
                                type="number"
                                value={settings.longBreakMinutes}
                                onChange={(e) => setSettings({ ...settings, longBreakMinutes: parseInt(e.target.value) || 15 })}
                                className="w-20 px-3 py-1 border rounded-lg text-center bg-background"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm">Sessions before long break</label>
                            <input
                                type="number"
                                value={settings.sessionsBeforeLongBreak}
                                onChange={(e) => setSettings({ ...settings, sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })}
                                className="w-20 px-3 py-1 border rounded-lg text-center bg-background"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

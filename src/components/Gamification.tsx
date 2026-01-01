import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Trophy, Flame, Star, Target, Zap, Award, Crown, Rocket, Calendar, Clock } from "lucide-react"

interface Badge {
    id: string
    name: string
    description: string
    icon: any
    color: string
    unlocked: boolean
    unlockedAt?: string
    requirement: string
}

interface Streak {
    current: number
    longest: number
    lastActiveDate: string
}

interface Goal {
    id: string
    name: string
    target: number
    current: number
    unit: string
    period: 'daily' | 'weekly' | 'monthly'
    color: string
}

const BADGE_DEFINITIONS: Omit<Badge, 'unlocked' | 'unlockedAt'>[] = [
    { id: 'first_hour', name: 'First Hour', description: 'Track your first hour of activity', icon: Clock, color: 'bg-blue-500', requirement: '1+ hours tracked' },
    { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: Flame, color: 'bg-orange-500', requirement: '7 days streak' },
    { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: Crown, color: 'bg-yellow-500', requirement: '30 days streak' },
    { id: 'productive_day', name: 'Productivity Pro', description: 'Achieve 80%+ productivity score', icon: Target, color: 'bg-green-500', requirement: '80%+ productivity' },
    { id: 'early_bird', name: 'Early Bird', description: 'Start work before 8 AM', icon: Star, color: 'bg-purple-500', requirement: 'Work before 8 AM' },
    { id: 'night_owl', name: 'Night Owl', description: 'Work past midnight', icon: Zap, color: 'bg-indigo-500', requirement: 'Work after midnight' },
    { id: 'marathon', name: 'Marathon Runner', description: 'Log 10+ hours in a day', icon: Rocket, color: 'bg-red-500', requirement: '10+ hours/day' },
    { id: 'consistent', name: 'Consistency King', description: 'Work 5 days in a row', icon: Calendar, color: 'bg-teal-500', requirement: '5 consecutive days' },
]

const DEFAULT_GOALS: Goal[] = [
    { id: '1', name: 'Daily Focus Time', target: 6, current: 0, unit: 'hours', period: 'daily', color: 'bg-blue-500' },
    { id: '2', name: 'Weekly Productivity', target: 75, current: 0, unit: '%', period: 'weekly', color: 'bg-green-500' },
    { id: '3', name: 'Monthly Streak', target: 20, current: 0, unit: 'days', period: 'monthly', color: 'bg-purple-500' },
]

export function Gamification() {
    const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0, lastActiveDate: '' })
    const [badges, setBadges] = useState<Badge[]>([])
    const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS)
    const [points, setPoints] = useState(0)

    useEffect(() => {
        // Load gamification data from activity
        loadGamificationData()
    }, [])

    const loadGamificationData = async () => {
        try {
            const activityData = await window.api?.getActivityData()
            if (!activityData || !activityData.length) return

            // Calculate streak
            const sortedDates = activityData.map((d: any) => d.date).sort().reverse()
            let currentStreak = 0
            let longestStreak = 0
            let tempStreak = 0

            for (let i = 0; i < sortedDates.length; i++) {
                const d1 = new Date(sortedDates[i])
                const d2 = i > 0 ? new Date(sortedDates[i - 1]) : new Date()

                const diffDays = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))

                if (i === 0) {
                    const today = new Date()
                    const daysSinceLastActive = Math.floor((today.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
                    if (daysSinceLastActive <= 1) {
                        tempStreak = 1
                    }
                }

                if (diffDays <= 1) {
                    tempStreak++
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak)
                    tempStreak = 1
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak)
            currentStreak = tempStreak

            setStreak({
                current: currentStreak,
                longest: longestStreak,
                lastActiveDate: sortedDates[0] || ''
            })

            // Calculate total hours for points
            let totalSeconds = 0
            activityData.forEach((day: any) => {
                Object.values(day.appSummary || {}).forEach((sec) => {
                    totalSeconds += sec as number
                })
            })
            const totalHours = totalSeconds / 3600
            setPoints(Math.floor(totalHours * 10))

            // Check badges
            const unlockedBadges = BADGE_DEFINITIONS.map(badge => ({
                ...badge,
                unlocked: checkBadgeUnlocked(badge.id, { totalHours, currentStreak, longestStreak, activityData }),
                unlockedAt: checkBadgeUnlocked(badge.id, { totalHours, currentStreak, longestStreak, activityData }) ? new Date().toISOString() : undefined
            }))
            setBadges(unlockedBadges)

            // Update goals
            setGoals(prev => prev.map(goal => ({
                ...goal,
                current: calculateGoalProgress(goal, { totalHours, currentStreak, activityData })
            })))

        } catch (error) {
            console.error('Failed to load gamification data:', error)
        }
    }

    const checkBadgeUnlocked = (badgeId: string, data: any): boolean => {
        switch (badgeId) {
            case 'first_hour': return data.totalHours >= 1
            case 'streak_7': return data.currentStreak >= 7 || data.longestStreak >= 7
            case 'streak_30': return data.currentStreak >= 30 || data.longestStreak >= 30
            case 'productive_day': return data.totalHours >= 6
            case 'early_bird': return true // Would check actual start times
            case 'night_owl': return false
            case 'marathon': return data.totalHours >= 10
            case 'consistent': return data.currentStreak >= 5
            default: return false
        }
    }

    const calculateGoalProgress = (goal: Goal, data: any): number => {
        switch (goal.id) {
            case '1': return Math.min(data.totalHours / (data.activityData?.length || 1), goal.target)
            case '2': return Math.min((data.totalHours / 8) * 100, 100)
            case '3': return data.currentStreak
            default: return 0
        }
    }

    return (
        <div className="h-full flex flex-col p-6 gap-6 overflow-auto bg-background">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        Gamification Center
                    </h1>
                    <p className="text-xs text-muted-foreground">Unlock achievements and track your progress</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{points}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Productivity Points</div>
                    </div>
                </div>
            </div>

            {/* Streak Section */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 rounded-2xl p-6 text-center">
                    <Flame className="h-10 w-10 mx-auto text-orange-500 mb-2" />
                    <div className="text-4xl font-bold">{streak.current}</div>
                    <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/20 rounded-2xl p-6 text-center">
                    <Crown className="h-10 w-10 mx-auto text-yellow-500 mb-2" />
                    <div className="text-4xl font-bold">{streak.longest}</div>
                    <div className="text-sm text-muted-foreground">Longest Streak</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 rounded-2xl p-6 text-center">
                    <Award className="h-10 w-10 mx-auto text-green-500 mb-2" />
                    <div className="text-4xl font-bold">{badges.filter(b => b.unlocked).length}/{badges.length}</div>
                    <div className="text-sm text-muted-foreground">Badges Unlocked</div>
                </div>
            </div>

            {/* Goals Section */}
            <div className="bg-card border rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Productivity Goals
                </h3>
                <div className="space-y-4">
                    {goals.map(goal => (
                        <div key={goal.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{goal.name}</span>
                                <span className="text-muted-foreground">
                                    {goal.current.toFixed(1)} / {goal.target} {goal.unit}
                                </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all", goal.color)}
                                    style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges Grid */}
            <div className="bg-card border rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Achievement Badges
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    {badges.map(badge => (
                        <div
                            key={badge.id}
                            className={cn(
                                "p-4 rounded-xl border text-center transition-all",
                                badge.unlocked
                                    ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
                                    : "bg-muted/50 border-transparent opacity-50 grayscale"
                            )}
                        >
                            <div className={cn(
                                "h-12 w-12 rounded-full mx-auto mb-3 flex items-center justify-center",
                                badge.unlocked ? badge.color : "bg-muted"
                            )}>
                                <badge.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="font-bold text-sm mb-1">{badge.name}</div>
                            <div className="text-[10px] text-muted-foreground">{badge.requirement}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

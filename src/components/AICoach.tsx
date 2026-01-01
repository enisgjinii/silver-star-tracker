import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Sparkles, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnalyticsEngine } from "@/lib/analytics-engine"

interface Insight {
    id: string
    type: 'tip' | 'warning' | 'achievement' | 'prediction'
    title: string
    description: string
    icon: any
    color: string
    actionLabel?: string
    action?: () => void
}

export function AICoach() {
    const [insights, setInsights] = useState<Insight[]>([])
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null)

    useEffect(() => {
        analyzeActivity()
    }, [])

    const analyzeActivity = async () => {
        setIsAnalyzing(true)
        try {
            const activityData = await window.api?.getActivityData()
            if (!activityData || !activityData.length) {
                setInsights([{
                    id: 'no-data',
                    type: 'tip',
                    title: 'Start Tracking',
                    description: 'Use your computer normally and I\'ll start gathering insights about your productivity patterns.',
                    icon: Lightbulb,
                    color: 'text-blue-500'
                }])
                return
            }

            const generatedInsights = generateInsights(activityData)
            setInsights(generatedInsights)
            setLastAnalysis(new Date())
        } catch (error) {
            console.error('Failed to analyze activity:', error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const generateInsights = (data: any[]): Insight[] => {
        const insights: Insight[] = []

        // Calculate metrics
        let totalSeconds = 0
        let productiveSeconds = 0
        const hourlyTotals = new Array(24).fill(0)
        const appUsage: Record<string, number> = {}

        data.forEach(day => {
            Object.entries(day.appSummary || {}).forEach(([app, sec]) => {
                const seconds = sec as number
                totalSeconds += seconds
                appUsage[app] = (appUsage[app] || 0) + seconds

                const category = AnalyticsEngine.categorizeApp(app)
                if (category === 'productive') {
                    productiveSeconds += seconds
                }
            })

            day.entries?.forEach((entry: any) => {
                const hour = new Date(entry.startTime).getHours()
                const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / 1000
                hourlyTotals[hour] += duration
            })
        })

        const productivityScore = AnalyticsEngine.calculateProductivityScore(productiveSeconds, totalSeconds)
        const avgDailyHours = (totalSeconds / data.length) / 3600

        // Find peak hours
        const peakHour = hourlyTotals.indexOf(Math.max(...hourlyTotals))
        const morningActivity = hourlyTotals.slice(6, 12).reduce((a, b) => a + b, 0)
        const afternoonActivity = hourlyTotals.slice(12, 18).reduce((a, b) => a + b, 0)
        const eveningActivity = hourlyTotals.slice(18, 24).reduce((a, b) => a + b, 0)

        // Generate insights based on data

        // 1. Productivity Score Insight
        if (productivityScore >= 70) {
            insights.push({
                id: 'high-productivity',
                type: 'achievement',
                title: 'Productivity Champion! 🏆',
                description: `Your productivity score is ${productivityScore}%. You're in the top tier of focused workers. Keep up the amazing work!`,
                icon: Sparkles,
                color: 'text-green-500'
            })
        } else if (productivityScore >= 50) {
            insights.push({
                id: 'medium-productivity',
                type: 'tip',
                title: 'Room for Improvement',
                description: `Your productivity score is ${productivityScore}%. Try blocking distracting apps during focus time to boost this score.`,
                icon: TrendingUp,
                color: 'text-yellow-500'
            })
        } else {
            insights.push({
                id: 'low-productivity',
                type: 'warning',
                title: 'Focus Needed',
                description: `Your productivity score is ${productivityScore}%. Consider using the Pomodoro timer to build better focus habits.`,
                icon: AlertTriangle,
                color: 'text-red-500'
            })
        }

        // 2. Peak Performance Insight
        const peakPeriod = peakHour < 12 ? 'morning' : peakHour < 18 ? 'afternoon' : 'evening'
        insights.push({
            id: 'peak-time',
            type: 'prediction',
            title: `Your Power Hours: ${peakHour}:00 - ${(peakHour + 2) % 24}:00`,
            description: `You're most productive in the ${peakPeriod}. Schedule your most important tasks during these hours for maximum impact.`,
            icon: Brain,
            color: 'text-purple-500'
        })

        // 3. Work-Life Balance
        if (avgDailyHours > 10) {
            insights.push({
                id: 'overwork',
                type: 'warning',
                title: 'Burnout Risk Detected',
                description: `You're averaging ${avgDailyHours.toFixed(1)} hours per day. Consider taking regular breaks and maintaining work-life balance.`,
                icon: AlertTriangle,
                color: 'text-orange-500'
            })
        }

        // 4. Top Distractor
        const sortedApps = Object.entries(appUsage).sort(([, a], [, b]) => b - a)
        const topDistractor = sortedApps.find(([app]) =>
            AnalyticsEngine.categorizeApp(app) === 'distracting'
        )
        if (topDistractor) {
            const hours = (topDistractor[1] / 3600).toFixed(1)
            insights.push({
                id: 'top-distractor',
                type: 'tip',
                title: `${topDistractor[0]} is your top distraction`,
                description: `You've spent ${hours} hours on ${topDistractor[0]}. Try setting a daily limit for this app.`,
                icon: Lightbulb,
                color: 'text-blue-500'
            })
        }

        // 5. Pattern Recognition
        if (eveningActivity > morningActivity && eveningActivity > afternoonActivity) {
            insights.push({
                id: 'night-owl',
                type: 'prediction',
                title: 'Night Owl Detected 🦉',
                description: 'You tend to work more in the evening. Make sure you\'re getting enough sleep for optimal cognitive performance.',
                icon: Brain,
                color: 'text-indigo-500'
            })
        } else if (morningActivity > afternoonActivity && morningActivity > eveningActivity) {
            insights.push({
                id: 'early-bird',
                type: 'prediction',
                title: 'Early Bird Advantage 🌅',
                description: 'You\'re most active in the morning. Great! Research shows morning work often leads to better focus.',
                icon: Sparkles,
                color: 'text-amber-500'
            })
        }

        return insights
    }

    const getInsightStyle = (type: Insight['type']) => {
        switch (type) {
            case 'achievement': return 'bg-green-500/10 border-green-500/20'
            case 'warning': return 'bg-red-500/10 border-red-500/20'
            case 'prediction': return 'bg-purple-500/10 border-purple-500/20'
            default: return 'bg-blue-500/10 border-blue-500/20'
        }
    }

    return (
        <div className="h-full flex flex-col p-6 gap-6 overflow-auto bg-background">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Brain className="h-6 w-6 text-primary" />
                        AI Productivity Coach
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        Personalized insights powered by your activity data
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={analyzeActivity}
                    disabled={isAnalyzing}
                    className="gap-2"
                >
                    <RefreshCw className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
                    {isAnalyzing ? 'Analyzing...' : 'Refresh Insights'}
                </Button>
            </div>

            {/* Last Analysis */}
            {lastAnalysis && (
                <div className="text-xs text-muted-foreground">
                    Last analyzed: {lastAnalysis.toLocaleTimeString()}
                </div>
            )}

            {/* Insights Grid */}
            <div className="grid gap-4">
                {insights.map(insight => (
                    <div
                        key={insight.id}
                        className={cn(
                            "p-6 rounded-2xl border transition-all hover:shadow-lg",
                            getInsightStyle(insight.type)
                        )}
                    >
                        <div className="flex items-start gap-4">
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                insight.type === 'achievement' ? 'bg-green-500' :
                                    insight.type === 'warning' ? 'bg-red-500' :
                                        insight.type === 'prediction' ? 'bg-purple-500' :
                                            'bg-blue-500'
                            )}>
                                <insight.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{insight.title}</h3>
                                <p className="text-muted-foreground">{insight.description}</p>
                                {insight.actionLabel && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-3 gap-1"
                                        onClick={insight.action}
                                    >
                                        {insight.actionLabel}
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Disclaimer */}
            <div className="mt-auto p-4 bg-muted/50 rounded-xl text-center text-xs text-muted-foreground">
                🤖 Insights are generated based on your activity patterns using rule-based analysis.
                Premium subscription unlocks advanced ML-powered predictions.
            </div>
        </div>
    )
}

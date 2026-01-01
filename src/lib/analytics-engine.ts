export interface DayStats {
    totalSeconds: number
    productivityScore: number // 0-100
    productiveSeconds: number
    neutralSeconds: number
    distractingSeconds: number
    hourlyActivity: number[] // 0-23 array of seconds
}

export type HeatmapData = { date: string; score: number; count: number }[]

export class AnalyticsEngine {
    // Mock categorization for Phase 1 (Replace with AI later)
    // In a real app, this would use the app name/window title
    static categorizeApp(appName: string): 'productive' | 'neutral' | 'distracting' {
        const productiveApps = ['vscode', 'cursor', 'terminal', 'figma', 'notion', 'slack']
        const distractingApps = ['twitter', 'reddit', 'youtube', 'facebook', 'instagram']

        const normalized = appName.toLowerCase()
        if (productiveApps.some(p => normalized.includes(p))) return 'productive'
        if (distractingApps.some(d => normalized.includes(d))) return 'distracting'
        return 'neutral'
    }

    static calculateProductivityScore(productiveSec: number, totalSec: number): number {
        if (totalSec === 0) return 0
        // Simple algorithm: (Productive / Total) * 100
        // Can be enhanced with weights (e.g. Neutral = 0.5)
        return Math.round((productiveSec / totalSec) * 100)
    }

    static processDayData(entries: any[]): DayStats {
        let total = 0
        let productive = 0
        let neutral = 0
        let distracting = 0
        const hourly = new Array(24).fill(0)

        entries.forEach(entry => {
            const duration = entry.duration || 0
            const category = this.categorizeApp(entry.appName || '')

            total += duration
            if (category === 'productive') productive += duration
            else if (category === 'distracting') distracting += duration
            else neutral += duration

            // Hourly distribution (simplified, assumes entry fits one hour)
            const hour = new Date(entry.timestamp).getHours()
            if (hour >= 0 && hour < 24) {
                hourly[hour] += duration
            }
        })

        return {
            totalSeconds: total,
            productivityScore: this.calculateProductivityScore(productive, total),
            productiveSeconds: productive,
            neutralSeconds: neutral,
            distractingSeconds: distracting,
            hourlyActivity: hourly
        }
    }

    static generateHeatmapData(history: Record<string, any[]>): HeatmapData {
        return Object.entries(history).map(([date, entries]) => {
            const stats = this.processDayData(entries)
            return {
                date,
                score: stats.productivityScore,
                count: stats.totalSeconds // Activity level for heatmap intensity
            }
        })
    }
}

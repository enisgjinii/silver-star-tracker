// App icon mappings - common apps to their brand colors and icons
export const APP_ICONS: Record<string, { icon: string; color: string }> = {
    'Visual Studio Code': { icon: '💻', color: '#007ACC' },
    'Code': { icon: '💻', color: '#007ACC' },
    'Google Chrome': { icon: '🌐', color: '#4285F4' },
    'Chrome': { icon: '🌐', color: '#4285F4' },
    'Safari': { icon: '🧭', color: '#006CFF' },
    'Firefox': { icon: '🦊', color: '#FF7139' },
    'Slack': { icon: '💬', color: '#4A154B' },
    'Discord': { icon: '🎮', color: '#5865F2' },
    'Figma': { icon: '🎨', color: '#F24E1E' },
    'Terminal': { icon: '⬛', color: '#333333' },
    'iTerm2': { icon: '⬛', color: '#333333' },
    'Notion': { icon: '📝', color: '#000000' },
    'Spotify': { icon: '🎵', color: '#1DB954' },
    'Finder': { icon: '📁', color: '#4A90D9' },
    'Mail': { icon: '📧', color: '#007AFF' },
    'Messages': { icon: '💬', color: '#34C759' },
    'Zoom': { icon: '📹', color: '#2D8CFF' },
    'Microsoft Teams': { icon: '👥', color: '#6264A7' },
    'GitHub Desktop': { icon: '🐙', color: '#24292E' },
    'Postman': { icon: '🚀', color: '#FF6C37' },
    'Docker Desktop': { icon: '🐳', color: '#2496ED' },
    'TablePlus': { icon: '📊', color: '#F8A51C' },
    'Arc': { icon: '🌈', color: '#FF6B6B' },
    'Obsidian': { icon: '💎', color: '#7C3AED' },
    'Notes': { icon: '📒', color: '#FFCC00' },
    'Preview': { icon: '🖼️', color: '#FF9500' },
    'System Preferences': { icon: '⚙️', color: '#8E8E93' },
    'Activity Monitor': { icon: '📈', color: '#34C759' },
    'Electron': { icon: '⚛️', color: '#47848F' },
}

export function getAppIcon(appName: string): { icon: string; color: string } {
    // Check for exact match
    if (APP_ICONS[appName]) {
        return APP_ICONS[appName]
    }

    // Check for partial match
    for (const [key, value] of Object.entries(APP_ICONS)) {
        if (appName.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(appName.toLowerCase())) {
            return value
        }
    }

    // Default
    return { icon: '📱', color: '#6B7280' }
}

export function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) {
        const mins = Math.floor(seconds / 60)
        return `${mins}m`
    }
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${mins}m`
}

export function formatDurationLong(seconds: number): string {
    if (seconds < 60) return `${seconds} seconds`
    if (seconds < 3600) {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return secs > 0 ? `${mins} min ${secs} sec` : `${mins} minutes`
    }
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`
}

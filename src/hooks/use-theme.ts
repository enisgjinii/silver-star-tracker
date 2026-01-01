import { useEffect, useState } from 'react'
import { THEMES } from '@/lib/themes'

export function useTheme() {
    const [mode, setMode] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme-mode') as 'light' | 'dark'
        return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    })

    const [presetId, setPresetId] = useState<string>(() => {
        return localStorage.getItem('theme-preset') || 'default'
    })

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(mode)
        localStorage.setItem('theme-mode', mode)

        // Apply Preset Colors
        const preset = THEMES.find(p => p.id === presetId) || THEMES[0]
        if (preset && preset.colors) {
            Object.entries(preset.colors).forEach(([key, value]) => {
                // Convert camelCase to kebab-case (primaryForeground -> --primary-foreground)
                const cssVar = '--' + key.replace(/([A-Z])/g, "-$1").toLowerCase()
                root.style.setProperty(cssVar, value)
            })
        }
        localStorage.setItem('theme-preset', presetId)
    }, [mode, presetId])

    const toggleMode = () => {
        setMode(prev => prev === 'light' ? 'dark' : 'light')
    }

    const setPreset = (id: string) => {
        setPresetId(id)
    }

    return {
        theme: mode,
        toggleTheme: toggleMode,
        presetId,
        setPreset
    }
}

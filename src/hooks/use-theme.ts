import { useEffect, useState } from 'react'

export function useTheme() {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        // Try to get from localStorage or system preference
        const saved = localStorage.getItem('theme') as 'light' | 'dark'
        if (saved) return saved
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    })

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    return { theme, toggleTheme }
}

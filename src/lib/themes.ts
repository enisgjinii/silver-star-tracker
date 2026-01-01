export interface ThemePreset {
    id: string
    name: string
    colors: {
        primary: string
        primaryForeground: string
        background: string
        foreground: string
        card: string
        cardForeground: string
        popover: string
        popoverForeground: string
        muted: string
        mutedForeground: string
        accent: string
        accentForeground: string
        border: string
    }
}

export const THEMES: ThemePreset[] = [
    {
        id: 'default',
        name: 'Default (Silver)',
        colors: {
            primary: '0 0% 9%',
            primaryForeground: '0 0% 98%',
            background: '0 0% 100%',
            foreground: '0 0% 3.9%',
            card: '0 0% 100%',
            cardForeground: '0 0% 3.9%',
            popover: '0 0% 100%',
            popoverForeground: '0 0% 3.9%',
            muted: '0 0% 96.1%',
            mutedForeground: '0 0% 45.1%',
            accent: '0 0% 96.1%',
            accentForeground: '0 0% 9%',
            border: '0 0% 89.8%'
        }
    },
    {
        id: 'midnight',
        name: 'Midnight (Blue)',
        colors: {
            primary: '221.2 83.2% 53.3%',
            primaryForeground: '210 40% 98%',
            background: '222.2 84% 4.9%',
            foreground: '210 40% 98%',
            card: '222.2 84% 4.9%',
            cardForeground: '210 40% 98%',
            popover: '222.2 84% 4.9%',
            popoverForeground: '210 40% 98%',
            muted: '217.2 32.6% 17.5%',
            mutedForeground: '215 20.2% 65.1%',
            accent: '217.2 32.6% 17.5%',
            accentForeground: '210 40% 98%',
            border: '217.2 32.6% 17.5%'
        }
    },
    {
        id: 'forest',
        name: 'Forest (Green)',
        colors: {
            primary: '142.1 76.2% 36.3%',
            primaryForeground: '355.7 100% 97.3%',
            background: '20 14.3% 4.1%',
            foreground: '0 0% 95%',
            card: '24 9.8% 10%',
            cardForeground: '0 0% 95%',
            popover: '0 0% 9%',
            popoverForeground: '0 0% 95%',
            muted: '143.8 6.9% 19.8%',
            mutedForeground: '142.4 12% 65%',
            accent: '143.8 6.9% 19.8%',
            accentForeground: '0 0% 95%',
            border: '143.8 6.9% 19.8%'
        }
    },
    {
        id: 'sunset',
        name: 'Sunset (Orange)',
        colors: {
            primary: '24.6 95% 53.1%',
            primaryForeground: '60 9.1% 97.8%',
            background: '20 14.3% 4.1%',
            foreground: '60 9.1% 97.8%',
            card: '24 9.8% 10%',
            cardForeground: '60 9.1% 97.8%',
            popover: '20 14.3% 4.1%',
            popoverForeground: '60 9.1% 97.8%',
            muted: '12 6.5% 15.1%',
            mutedForeground: '24 5.4% 63.9%',
            accent: '12 6.5% 15.1%',
            accentForeground: '60 9.1% 97.8%',
            border: '12 6.5% 15.1%'
        }
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk (Neon)',
        colors: {
            primary: '270 100% 60%', // Neon Purple
            primaryForeground: '0 0% 100%',
            background: '270 50% 5%', // Deep Purple Black
            foreground: '0 0% 100%',
            card: '270 30% 10%',
            cardForeground: '0 0% 100%',
            popover: '270 30% 10%',
            popoverForeground: '0 0% 100%',
            muted: '270 30% 20%',
            mutedForeground: '270 10% 70%',
            accent: '180 100% 50%', // Cyan Accent
            accentForeground: '270 50% 5%',
            border: '270 30% 20%'
        }
    }
]

/// <reference types="vite/client" />

interface Window {
    api: {
        onActiveWindow: (callback: (data: any) => void) => void
        getActivityData: () => Promise<any[]>
        getTodaySummary: () => Promise<Record<string, number>>
        getAppIcons: () => Promise<Record<string, string>>
        getDataPath: () => Promise<string>
        deleteEntry: (id: string) => Promise<boolean>
        clearAllData: () => Promise<boolean>
        isTracking: () => Promise<boolean>
        setTracking: (value: boolean) => Promise<boolean>
    }
}

declare module 'get-app-icon' {
    export function extractIcon(path: string): Promise<string>;
}

import { ipcRenderer, contextBridge } from 'electron'

export interface ActivityData {
    date: string
    entries: {
        id: string
        appName: string
        title: string
        startTime: number
        endTime: number
        duration: number
    }[]
    appSummary: Record<string, number>
}

declare global {
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
}

contextBridge.exposeInMainWorld('api', {
    onActiveWindow: (callback: (data: any) => void) => {
        ipcRenderer.on('active-window', (_event, data) => callback(data))
    },
    getActivityData: (): Promise<ActivityData[]> => ipcRenderer.invoke('get-activity-data'),
    getTodaySummary: (): Promise<Record<string, number>> => ipcRenderer.invoke('get-today-summary'),
    getAppIcons: (): Promise<Record<string, string>> => ipcRenderer.invoke('get-app-icons'),
    getDataPath: (): Promise<string> => ipcRenderer.invoke('get-data-path'),
    deleteEntry: (id: string): Promise<boolean> => ipcRenderer.invoke('delete-entry', id),
    clearAllData: (): Promise<boolean> => ipcRenderer.invoke('clear-all-data'),
    isTracking: (): Promise<boolean> => ipcRenderer.invoke('is-tracking'),
    setTracking: (value: boolean): Promise<boolean> => ipcRenderer.invoke('set-tracking', value),
})

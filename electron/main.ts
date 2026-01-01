import { app, BrowserWindow, powerMonitor, ipcMain, nativeImage } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
// @ts-ignore
import { extractIcon } from 'get-app-icon'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Data storage path
const dataPath = path.join(app.getPath('userData'), 'activity-data.json')

interface ActivityEntry {
    id: string
    appName: string
    title: string
    startTime: number
    endTime: number
    duration: number // in seconds
    iconPath?: string
}

interface DailyData {
    date: string
    entries: ActivityEntry[]
    appSummary: Record<string, number> // appName -> total seconds
}

interface AppIcon {
    appName: string
    icon: string // base64
    color?: string
}

let appIcons: Record<string, string> = {} // appName -> base64 icon

// Load or initialize data
function loadData(): DailyData[] {
    try {
        if (fs.existsSync(dataPath)) {
            return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
        }
    } catch (e) {
        console.error('Error loading data:', e)
    }
    return []
}

function saveData(data: DailyData[]) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
    } catch (e) {
        console.error('Error saving data:', e)
    }
}

// Get today's date string
function getTodayStr(): string {
    return new Date().toISOString().split('T')[0]
}

// Main window setup
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')

let win: BrowserWindow | null
let currentActivity: { appName: string; title: string; startTime: number } | null = null
let allData: DailyData[] = []
let isTracking: boolean = true

function createWindow() {
    const publicDir = process.env.VITE_PUBLIC || path.join(__dirname, '../public')
    const distDir = process.env.DIST || path.join(__dirname, '../dist')

    win = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 600,
        icon: path.join(publicDir, 'icon.png'),
        titleBarStyle: 'hiddenInset',
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    // Maximize and show when ready
    win.once('ready-to-show', () => {
        win?.maximize()
        win?.show()
    })

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
        win.loadFile(path.join(distDir, 'index.html'))
    }
}

function updateActivity(appName: string, title: string) {
    const now = Date.now()
    const todayStr = getTodayStr()

    // End previous activity
    if (currentActivity && currentActivity.appName !== appName) {
        const duration = Math.round((now - currentActivity.startTime) / 1000)
        if (duration > 0) {
            let todayData = allData.find(d => d.date === todayStr)
            if (!todayData) {
                todayData = { date: todayStr, entries: [], appSummary: {} }
                allData.push(todayData)
            }

            const entry: ActivityEntry = {
                id: `${todayStr}-${Date.now()}`,
                appName: currentActivity.appName,
                title: currentActivity.title,
                startTime: currentActivity.startTime,
                endTime: now,
                duration,
            }
            todayData.entries.push(entry)
            todayData.appSummary[currentActivity.appName] =
                (todayData.appSummary[currentActivity.appName] || 0) + duration

            saveData(allData)
        }
    }

    // Start new activity
    if (!currentActivity || currentActivity.appName !== appName) {
        currentActivity = { appName, title, startTime: now }
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(() => {
    allData = loadData()
    createWindow()

    // IPC Handlers
    ipcMain.handle('get-activity-data', () => allData)

    ipcMain.handle('get-today-summary', () => {
        const todayStr = getTodayStr()
        const todayData = allData.find(d => d.date === todayStr)
        return todayData?.appSummary || {}
    })

    ipcMain.handle('get-app-icons', () => {
        // console.log('[DEBUG] Serving app icons:', Object.keys(appIcons))
        return appIcons
    })

    ipcMain.handle('is-tracking', () => isTracking)
    ipcMain.handle('set-tracking', (_event, value: boolean) => {
        isTracking = value
        return isTracking
    })

    ipcMain.handle('get-data-path', () => dataPath)

    ipcMain.handle('delete-entry', (_event, entryId: string) => {
        for (const day of allData) {
            const idx = day.entries.findIndex(e => e.id === entryId)
            if (idx !== -1) {
                const entry = day.entries[idx]
                day.appSummary[entry.appName] -= entry.duration
                if (day.appSummary[entry.appName] <= 0) {
                    delete day.appSummary[entry.appName]
                }
                day.entries.splice(idx, 1)
                saveData(allData)
                return true
            }
        }
        return false
    })

    ipcMain.handle('clear-all-data', () => {
        allData = []
        saveData(allData)
        return true
    })

    // Track active window every second
    setInterval(async () => {
        if (win && !win.isDestroyed() && isTracking) {
            try {
                const activeWin = await import('active-win')
                const result = await activeWin.default()
                const idleTime = powerMonitor.getSystemIdleTime()

                if (result && idleTime < 60) {
                    const rawAppName = result.owner?.name || 'Unknown'
                    const appName = rawAppName.trim()
                    const appPath = result.owner?.path
                    console.log(`[DEBUG] Active App: ${appName}, Path: ${appPath}`)

                    updateActivity(appName, result.title || '')

                    // Fetch icon if not already cached
                    if (!appIcons[appName] && appPath) {
                        try {
                            // Try to find the .app path if given a binary path
                            let iconPath = appPath
                            if (process.platform === 'darwin' && !appPath.endsWith('.app')) {
                                const appIndex = appPath.indexOf('.app/')
                                if (appIndex !== -1) {
                                    iconPath = appPath.substring(0, appIndex + 4)
                                }
                            }

                            console.log(`[DEBUG] Fetching icon for ${appName} at ${iconPath} (orig: ${appPath})`)

                            // Use get-app-icon to extract icon
                            const iconDataUrl = await extractIcon(iconPath)

                            if (iconDataUrl && iconDataUrl !== 'data:image/png;base64,') {
                                appIcons[appName] = iconDataUrl
                                console.log(`[DEBUG] Successfully fetched icon for ${appName}`)
                            } else {
                                console.log(`[DEBUG] Icon fetched but empty for ${appName}`)
                            }
                        } catch (e) {
                            console.error(`[DEBUG] Error fetching icon for ${appName}:`, e)
                        }
                    } else if (appIcons[appName]) {
                        console.log(`[DEBUG] Icon already cached for ${appName}`)
                    }

                    win.webContents.send('active-window', {
                        appName,
                        title: result.title || '',
                        idleTime,
                        timestamp: Date.now(),
                        icon: appIcons[appName]
                    })
                }
            } catch (e) {
                // Silently handle errors
            }
        }
    }, 1000)
})

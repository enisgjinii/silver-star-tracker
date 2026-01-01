import { app, BrowserWindow, ipcMain, powerMonitor } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { extractIcon } from "get-app-icon";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(app.getPath("userData"), "activity-data.json");
let appIcons = {};
function loadData() {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    }
  } catch (e) {
    console.error("Error loading data:", e);
  }
  return [];
}
function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error saving data:", e);
  }
}
function getTodayStr() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
process.env.DIST = path.join(__dirname$1, "../dist");
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname$1, "../public");
let win;
let currentActivity = null;
let allData = [];
let isTracking = true;
function createWindow() {
  const publicDir = process.env.VITE_PUBLIC || path.join(__dirname$1, "../public");
  const distDir = process.env.DIST || path.join(__dirname$1, "../dist");
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1e3,
    minHeight: 600,
    icon: path.join(publicDir, "icon.png"),
    titleBarStyle: "hiddenInset",
    show: false,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.js")
    }
  });
  win.once("ready-to-show", () => {
    win?.maximize();
    win?.show();
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(distDir, "index.html"));
  }
}
function updateActivity(appName, title) {
  const now = Date.now();
  const todayStr = getTodayStr();
  if (currentActivity && currentActivity.appName !== appName) {
    const duration = Math.round((now - currentActivity.startTime) / 1e3);
    if (duration > 0) {
      let todayData = allData.find((d) => d.date === todayStr);
      if (!todayData) {
        todayData = { date: todayStr, entries: [], appSummary: {} };
        allData.push(todayData);
      }
      const entry = {
        id: `${todayStr}-${Date.now()}`,
        appName: currentActivity.appName,
        title: currentActivity.title,
        startTime: currentActivity.startTime,
        endTime: now,
        duration
      };
      todayData.entries.push(entry);
      todayData.appSummary[currentActivity.appName] = (todayData.appSummary[currentActivity.appName] || 0) + duration;
      saveData(allData);
    }
  }
  if (!currentActivity || currentActivity.appName !== appName) {
    currentActivity = { appName, title, startTime: now };
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  allData = loadData();
  createWindow();
  ipcMain.handle("get-activity-data", () => allData);
  ipcMain.handle("get-today-summary", () => {
    const todayStr = getTodayStr();
    const todayData = allData.find((d) => d.date === todayStr);
    return todayData?.appSummary || {};
  });
  ipcMain.handle("get-app-icons", () => {
    return appIcons;
  });
  ipcMain.handle("is-tracking", () => isTracking);
  ipcMain.handle("set-tracking", (_event, value) => {
    isTracking = value;
    return isTracking;
  });
  ipcMain.handle("get-data-path", () => dataPath);
  ipcMain.handle("delete-entry", (_event, entryId) => {
    for (const day of allData) {
      const idx = day.entries.findIndex((e) => e.id === entryId);
      if (idx !== -1) {
        const entry = day.entries[idx];
        day.appSummary[entry.appName] -= entry.duration;
        if (day.appSummary[entry.appName] <= 0) {
          delete day.appSummary[entry.appName];
        }
        day.entries.splice(idx, 1);
        saveData(allData);
        return true;
      }
    }
    return false;
  });
  ipcMain.handle("clear-all-data", () => {
    allData = [];
    saveData(allData);
    return true;
  });
  setInterval(async () => {
    if (win && !win.isDestroyed() && isTracking) {
      try {
        const activeWin = await import("active-win");
        const result = await activeWin.default();
        const idleTime = powerMonitor.getSystemIdleTime();
        if (result && idleTime < 60) {
          const rawAppName = result.owner?.name || "Unknown";
          const appName = rawAppName.trim();
          const appPath = result.owner?.path;
          console.log(`[DEBUG] Active App: ${appName}, Path: ${appPath}`);
          updateActivity(appName, result.title || "");
          if (!appIcons[appName] && appPath) {
            try {
              let iconPath = appPath;
              if (process.platform === "darwin" && !appPath.endsWith(".app")) {
                const appIndex = appPath.indexOf(".app/");
                if (appIndex !== -1) {
                  iconPath = appPath.substring(0, appIndex + 4);
                }
              }
              console.log(`[DEBUG] Fetching icon for ${appName} at ${iconPath} (orig: ${appPath})`);
              const iconDataUrl = await extractIcon(iconPath);
              if (iconDataUrl && iconDataUrl !== "data:image/png;base64,") {
                appIcons[appName] = iconDataUrl;
                console.log(`[DEBUG] Successfully fetched icon for ${appName}`);
              } else {
                console.log(`[DEBUG] Icon fetched but empty for ${appName}`);
              }
            } catch (e) {
              console.error(`[DEBUG] Error fetching icon for ${appName}:`, e);
            }
          } else if (appIcons[appName]) {
            console.log(`[DEBUG] Icon already cached for ${appName}`);
          }
          win.webContents.send("active-window", {
            appName,
            title: result.title || "",
            idleTime,
            timestamp: Date.now(),
            icon: appIcons[appName]
          });
        }
      } catch (e) {
      }
    }
  }, 1e3);
});

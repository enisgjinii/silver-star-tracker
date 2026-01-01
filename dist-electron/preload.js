"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  onActiveWindow: (callback) => {
    electron.ipcRenderer.on("active-window", (_event, data) => callback(data));
  },
  getActivityData: () => electron.ipcRenderer.invoke("get-activity-data"),
  getTodaySummary: () => electron.ipcRenderer.invoke("get-today-summary"),
  getAppIcons: () => electron.ipcRenderer.invoke("get-app-icons"),
  getDataPath: () => electron.ipcRenderer.invoke("get-data-path"),
  deleteEntry: (id) => electron.ipcRenderer.invoke("delete-entry", id),
  clearAllData: () => electron.ipcRenderer.invoke("clear-all-data"),
  isTracking: () => electron.ipcRenderer.invoke("is-tracking"),
  setTracking: (value) => electron.ipcRenderer.invoke("set-tracking", value)
});

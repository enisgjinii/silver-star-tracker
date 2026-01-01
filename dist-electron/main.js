import { app as m, BrowserWindow as v, ipcMain as l, powerMonitor as T } from "electron";
import { fileURLToPath as U } from "node:url";
import c from "node:path";
import g from "node:fs";
import { extractIcon as N } from "get-app-icon";
const h = c.dirname(U(import.meta.url)), w = c.join(m.getPath("userData"), "activity-data.json");
let u = {};
function _() {
  try {
    if (g.existsSync(w))
      return JSON.parse(g.readFileSync(w, "utf-8"));
  } catch (a) {
    console.error("Error loading data:", a);
  }
  return [];
}
function D(a) {
  try {
    g.writeFileSync(w, JSON.stringify(a, null, 2));
  } catch (t) {
    console.error("Error saving data:", t);
  }
}
function E() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
process.env.DIST = c.join(h, "../dist");
process.env.VITE_PUBLIC = m.isPackaged ? process.env.DIST : c.join(h, "../public");
let s, o = null, r = [], y = !0;
function I() {
  const a = process.env.VITE_PUBLIC || c.join(h, "../public"), t = process.env.DIST || c.join(h, "../dist");
  s = new v({
    width: 1400,
    height: 900,
    minWidth: 1e3,
    minHeight: 600,
    icon: c.join(a, "icon.png"),
    titleBarStyle: "hiddenInset",
    show: !1,
    webPreferences: {
      preload: c.join(h, "preload.js")
    }
  }), s.once("ready-to-show", () => {
    s?.maximize(), s?.show();
  }), process.env.VITE_DEV_SERVER_URL ? s.loadURL(process.env.VITE_DEV_SERVER_URL) : s.loadFile(c.join(t, "index.html"));
}
function $(a, t) {
  const n = Date.now(), p = E();
  if (o && o.appName !== a) {
    const e = Math.round((n - o.startTime) / 1e3);
    if (e > 0) {
      let i = r.find((f) => f.date === p);
      i || (i = { date: p, entries: [], appSummary: {} }, r.push(i));
      const d = {
        id: `${p}-${Date.now()}`,
        appName: o.appName,
        title: o.title,
        startTime: o.startTime,
        endTime: n,
        duration: e
      };
      i.entries.push(d), i.appSummary[o.appName] = (i.appSummary[o.appName] || 0) + e, D(r);
    }
  }
  (!o || o.appName !== a) && (o = { appName: a, title: t, startTime: n });
}
m.on("window-all-closed", () => {
  process.platform !== "darwin" && (m.quit(), s = null);
});
m.on("activate", () => {
  v.getAllWindows().length === 0 && I();
});
m.whenReady().then(() => {
  r = _(), I(), l.handle("get-activity-data", () => r), l.handle("get-today-summary", () => {
    const a = E();
    return r.find((n) => n.date === a)?.appSummary || {};
  }), l.handle("get-app-icons", () => u), l.handle("is-tracking", () => y), l.handle("set-tracking", (a, t) => (y = t, y)), l.handle("get-data-path", () => w), l.handle("delete-entry", (a, t) => {
    for (const n of r) {
      const p = n.entries.findIndex((e) => e.id === t);
      if (p !== -1) {
        const e = n.entries[p];
        return n.appSummary[e.appName] -= e.duration, n.appSummary[e.appName] <= 0 && delete n.appSummary[e.appName], n.entries.splice(p, 1), D(r), !0;
      }
    }
    return !1;
  }), l.handle("clear-all-data", () => (r = [], D(r), !0)), setInterval(async () => {
    if (s && !s.isDestroyed() && y)
      try {
        const t = await (await import("active-win")).default(), n = T.getSystemIdleTime();
        if (t && n < 60) {
          const e = (t.owner?.name || "Unknown").trim(), i = t.owner?.path;
          if (console.log(`[DEBUG] Active App: ${e}, Path: ${i}`), $(e, t.title || ""), !u[e] && i)
            try {
              let d = i;
              if (process.platform === "darwin" && !i.endsWith(".app")) {
                const S = i.indexOf(".app/");
                S !== -1 && (d = i.substring(0, S + 4));
              }
              console.log(`[DEBUG] Fetching icon for ${e} at ${d} (orig: ${i})`);
              const f = await N(d);
              f && f !== "data:image/png;base64," ? (u[e] = f, console.log(`[DEBUG] Successfully fetched icon for ${e}`)) : console.log(`[DEBUG] Icon fetched but empty for ${e}`);
            } catch (d) {
              console.error(`[DEBUG] Error fetching icon for ${e}:`, d);
            }
          else u[e] && console.log(`[DEBUG] Icon already cached for ${e}`);
          s.webContents.send("active-window", {
            appName: e,
            title: t.title || "",
            idleTime: n,
            timestamp: Date.now(),
            icon: u[e]
          });
        }
      } catch {
      }
  }, 1e3);
});

import activeWin from "active-win";
async function getActiveWindow() {
  try {
    const result = await activeWin();
    return result;
  } catch (error) {
    console.error("Error getting active window:", error);
    return null;
  }
}
export {
  getActiveWindow
};

import type { WebContents } from "electron";

export const toggleDetachedDevTools = (webContents: WebContents) => {
  if (!webContents) {
    return;
  }

  if (webContents.isDevToolsOpened()) {
    webContents.closeDevTools();

    return;
  }

  webContents.openDevTools({ mode: "detach" });
};

import { describe, expect, it, spyOn } from "bun:test";
import type { WebContents } from "electron";
import { toggleDetachedDevTools } from "Utils/Main/devTools";

describe("devTools utils", () => {
  describe("toggleDetachedDevTools", () => {
    it("should do nothing if webContents is null", () => {
      // @ts-expect-error - testing null input
      expect(() => toggleDetachedDevTools(null)).not.toThrow();
    });

    it("should close DevTools if they are already open", () => {
      const mockWebContents = {
        isDevToolsOpened: () => true,
        closeDevTools: () => {},
        openDevTools: () => {},
      } as unknown as WebContents;

      const closeSpy = spyOn(mockWebContents, "closeDevTools");
      const openSpy = spyOn(mockWebContents, "openDevTools");

      toggleDetachedDevTools(mockWebContents);

      expect(closeSpy).toHaveBeenCalled();
      expect(openSpy).not.toHaveBeenCalled();
    });

    it("should open DevTools in detach mode if they are closed", () => {
      const mockWebContents = {
        isDevToolsOpened: () => false,
        closeDevTools: () => {},
        openDevTools: () => {},
      } as unknown as WebContents;

      const closeSpy = spyOn(mockWebContents, "closeDevTools");
      const openSpy = spyOn(mockWebContents, "openDevTools");

      toggleDetachedDevTools(mockWebContents);

      expect(closeSpy).not.toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith({ mode: "detach" });
    });
  });
});

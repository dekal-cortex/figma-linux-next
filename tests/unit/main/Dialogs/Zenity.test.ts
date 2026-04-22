import { describe, expect, test, mock, beforeEach } from "bun:test";
import { ZenityDialogs } from "Main/Dialogs/Zenity";

// Mock Process
mock.module("Main/Process", () => ({
  process: {
    exec: mock(),
    execSync: mock(),
  },
}));

// Mock Logger
mock.module("Main/Logger", () => ({
  logger: {
    error: mock(),
    warn: mock(),
    info: mock(),
  },
}));

import { process } from "Main/Process";

describe("ZenityDialogs", () => {
  let zenity: ZenityDialogs;

  beforeEach(() => {
    zenity = new ZenityDialogs();
    (process.exec as any).mockReset();
    (process.execSync as any).mockReset();
  });

  test("initializes correctly", () => {
    expect(zenity).toBeDefined();
  });

  describe("showMessageBox", () => {
    test("returns 0 when process.exec succeeds", async () => {
      (process.exec as any).mockResolvedValue("OK");

      const result = await zenity.showMessageBox({
        type: "info",
        message: "Hello",
      });

      expect(result).toBe(0);
      expect(process.exec).toHaveBeenCalledWith(expect.stringContaining("zenity --info"));
    });

    test("returns 1 when process.exec fails", async () => {
      (process.exec as any).mockRejectedValue(new Error("Zenity error"));

      const result = await zenity.showMessageBox({
        type: "error",
        message: "Error",
      });

      expect(result).toBe(1);
    });
  });

  describe("showMessageBoxSync", () => {
    test("returns 0 when process.execSync succeeds", () => {
      (process.execSync as any).mockReturnValue("OK");

      const result = zenity.showMessageBoxSync({
        type: "warning",
        message: "Warning",
      });

      expect(result).toBe(0);
      expect(process.execSync).toHaveBeenCalledWith(expect.stringContaining("zenity --warning"));
    });

    test("returns 1 when process.execSync throws", () => {
      (process.execSync as any).mockImplementation(() => {
        throw new Error("Zenity error");
      });

      const result = zenity.showMessageBoxSync({
        type: "question",
        message: "Question?",
        defaultFocusedButton: "Ok",
      });

      expect(result).toBe(1);
    });
  });

  describe("showOpenDialog", () => {
    test("returns path array when process.exec succeeds", async () => {
      (process.exec as any).mockResolvedValue("/test/path/file.txt\n");

      const result = await zenity.showOpenDialog({});

      expect(result).toEqual(["/test/path/file.txt"]);
    });

    test("handles multiple selections", async () => {
      (process.exec as any).mockResolvedValue("/path1|/path2\n");

      const result = await zenity.showOpenDialog({
        properties: ["multiSelections"],
      });

      expect(result).toEqual(["/path1", "/path2"]);
    });

    test("returns null when process.exec fails", async () => {
      (process.exec as any).mockRejectedValue(new Error("Zenity error"));

      const result = await zenity.showOpenDialog({});

      expect(result).toBeNull();
    });
  });

  describe("showOpenDialogSync", () => {
    test("returns path array when process.execSync succeeds", () => {
      (process.execSync as any).mockReturnValue("/test/path/file.txt\n");

      const result = zenity.showOpenDialogSync({});

      expect(result).toEqual(["/test/path/file.txt"]);
    });

    test("returns null when process.execSync throws", () => {
      (process.execSync as any).mockImplementation(() => {
        throw new Error("Zenity error");
      });

      const result = zenity.showOpenDialogSync({});

      expect(result).toBeNull();
    });
  });

  describe("showSaveDialog", () => {
    test("returns path string when process.exec succeeds", async () => {
      (process.exec as any).mockResolvedValue("/test/path/save.txt\n");

      const result = await zenity.showSaveDialog({});

      expect(result).toBe("/test/path/save.txt");
    });

    test("returns null when process.exec fails", async () => {
      (process.exec as any).mockRejectedValue(new Error("Zenity error"));

      const result = await zenity.showSaveDialog({});

      expect(result).toBeNull();
    });
  });

  describe("showSaveDialogSync", () => {
    test("returns path string when process.execSync succeeds", () => {
      (process.execSync as any).mockReturnValue("/test/path/save.txt\n");

      const result = zenity.showSaveDialogSync({});

      expect(result).toBe("/test/path/save.txt");
    });

    test("returns null when process.execSync throws", () => {
      (process.execSync as any).mockImplementation(() => {
        throw new Error("Zenity error");
      });

      const result = zenity.showSaveDialogSync({});

      expect(result).toBeNull();
    });
  });
});

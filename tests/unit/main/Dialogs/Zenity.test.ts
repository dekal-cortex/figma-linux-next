import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { ZenityDialogs } from "../../../../src/main/Dialogs/Zenity";
import { process } from "../../../../src/main/Process";

// Mock the process module
mock.module("../../../../src/main/Process", () => ({
  process: {
    execFile: mock(() => Promise.resolve("")),
    execFileSync: mock(() => ""),
  },
}));

describe("ZenityDialogs", () => {
  let zenityDialogs: ZenityDialogs;

  beforeEach(() => {
    zenityDialogs = new ZenityDialogs();
  });

  afterEach(() => {
    mock.restore();
  });

  describe("showMessageBox", () => {
    it("should call execFile with correct arguments", async () => {
      const options: Dialogs.MessageBoxOptions = {
        type: "info",
        message: "Hello World",
        title: "Test Title",
      };

      await zenityDialogs.showMessageBox(options);

      expect(process.execFile).toHaveBeenCalledWith("zenity", [
        "--info",
        "--ellipsize",
        "--title",
        "Test Title",
        "--text",
        "Hello World",
      ]);
    });

    it("should handle detail correctly", async () => {
      const options: Dialogs.MessageBoxOptions = {
        type: "error",
        message: "Main Error",
        detail: "Some details",
      };

      await zenityDialogs.showMessageBox(options);

      expect(process.execFile).toHaveBeenCalledWith("zenity", [
        "--error",
        "--ellipsize",
        "--text",
        "Main Error\nSome details",
      ]);
    });

    it("should handle question options correctly", async () => {
      const options: Dialogs.MessageBoxOptions = {
        type: "question",
        message: "Are you sure?",
        textOkButton: "Yes",
        textCancelButton: "No",
        defaultFocusedButton: "Cancel",
      };

      await zenityDialogs.showMessageBox(options);

      expect(process.execFile).toHaveBeenCalledWith("zenity", [
        "--question",
        "--ellipsize",
        "--text",
        "Are you sure?",
        "--ok-label",
        "Yes",
        "--cancel-label",
        "No",
        "--default-cancel",
      ]);
    });
  });

  describe("showSaveDialog", () => {
    it("should handle defaultPath without injection risk", async () => {
      const options: Dialogs.SaveOptions = {
        defaultPath: '"; touch injected; "',
      };

      (process.execFile as any).mockResolvedValue("/tmp/saved-file\n");

      const result = await zenityDialogs.showSaveDialog(options);

      expect(process.execFile).toHaveBeenCalledWith("zenity", [
        "--file-selection",
        "--save",
        "--confirm-overwrite",
        "--filename",
        '"; touch injected; "',
      ]);
      expect(result).toBe("/tmp/saved-file");
    });
  });

  describe("showOpenDialog", () => {
    it("should handle multiple properties correctly", async () => {
      const options: Dialogs.OpenOptions = {
        properties: ["openDirectory", "multiSelections"],
      };

      (process.execFile as any).mockResolvedValue("/dir1|/dir2\n");

      const result = await zenityDialogs.showOpenDialog(options);

      expect(process.execFile).toHaveBeenCalledWith("zenity", [
        "--file-selection",
        "--directory",
        "--multiple",
      ]);
      expect(result).toEqual(["/dir1", "/dir2"]);
    });
  });
});

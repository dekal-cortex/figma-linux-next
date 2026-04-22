import { describe, it, expect, mock, beforeEach } from "bun:test";
import { ZenityDialogs } from "../../../../src/main/Dialogs/Zenity";
import { process } from "../../../../src/main/Process";

// Mock the process object
mock.module("../../../../src/main/Process", () => ({
  process: {
    execFile: mock(() => Promise.resolve("test-output\n")),
    execFileSync: mock(() => "test-output-sync\n"),
  },
}));

describe("ZenityDialogs", () => {
  let zenityDialogs: ZenityDialogs;

  beforeEach(() => {
    zenityDialogs = new ZenityDialogs();
    mock.restore(); // This might not be enough depending on how bun:test handles mocks
  });

  describe("showMessageBox", () => {
    it("should pass arguments correctly and handle malicious strings", async () => {
      const maliciousTitle = '"; touch /tmp/pwned; #';
      const options: Dialogs.MessageBoxOptions = {
        type: "info",
        title: maliciousTitle,
        message: "Hello World",
      };

      await zenityDialogs.showMessageBox(options);

      expect(process.execFile).toHaveBeenCalledWith("zenity", [
        "--info",
        "--ellipsize",
        "--title",
        maliciousTitle,
        "--text",
        "Hello World",
      ]);
    });

    it("should include detail in text argument when provided", async () => {
        const options: Dialogs.MessageBoxOptions = {
          type: "info",
          message: "Main message",
          detail: "Detail message"
        };

        await zenityDialogs.showMessageBox(options);

        expect(process.execFile).toHaveBeenCalledWith("zenity", [
          "--info",
          "--ellipsize",
          "--text",
          "Main message\nDetail message",
        ]);
      });
  });

  describe("showOpenDialog", () => {
    it("should pass filename as a separate argument without shell quoting", async () => {
      const maliciousPath = '/path/with/"quotes" & ; injection';
      const options: Dialogs.OpenOptions = {
        defaultPath: maliciousPath,
        properties: ["openDirectory", "multiSelections"],
      };

      await zenityDialogs.showOpenDialog(options);

      expect(process.execFile).toHaveBeenCalledWith("zenity", [
        "--file-selection",
        "--filename",
        maliciousPath,
        "--directory",
        "--multiple",
      ]);
    });
  });

  describe("showSaveDialog", () => {
    it("should pass filename as a separate argument for save dialog", async () => {
      const maliciousPath = '/path/with/"quotes" & ; injection';
      const options: Dialogs.SaveOptions = {
        defaultPath: maliciousPath,
      };

      await zenityDialogs.showSaveDialog(options);

      expect(process.execFile).toHaveBeenCalledWith("zenity", [
        "--file-selection",
        "--save",
        "--confirm-overwrite",
        "--filename",
        maliciousPath,
      ]);
    });
  });

  describe("Synchronous methods", () => {
    it("showMessageBoxSync should pass arguments correctly", () => {
      const options: Dialogs.MessageBoxOptions = {
        type: "warning",
        title: "Sync Title",
        message: "Sync Message",
      };

      zenityDialogs.showMessageBoxSync(options);

      expect(process.execFileSync).toHaveBeenCalledWith("zenity", [
        "--warning",
        "--ellipsize",
        "--title",
        "Sync Title",
        "--text",
        "Sync Message",
      ]);
    });
  });
});

import { process } from "../Process";

export class ZenityDialogs implements ProviderDialog {
  constructor() {}

  public showMessageBox = async (options: Dialogs.MessageBoxOptions) => {
    const args = [`--${options.type}`, "--ellipsize"];

    if (options.title) {
      args.push("--title", options.title);
    }
    if (options.detail) {
      args.push("--text", `${options.message}\n${options.detail}`);
    } else {
      args.push("--text", options.message);
    }
    if (options.textOkButton) {
      args.push("--ok-label", options.textOkButton);
    }
    if (options.type === "question") {
      if (options.textCancelButton) {
        args.push("--cancel-label", options.textCancelButton);
      }
      if (options.defaultFocusedButton === "Cancel") {
        args.push("--default-cancel");
      }
    }

    try {
      await process.execFile("zenity", args);
      return 0;
    } catch (error) {
      return 1;
    }
  };
  public showMessageBoxSync = (options: Dialogs.MessageBoxOptions) => {
    const args = [`--${options.type}`, "--ellipsize"];

    if (options.title) {
      args.push("--title", options.title);
    }
    if (options.detail) {
      args.push("--text", `${options.message}\n${options.detail}`);
    } else {
      args.push("--text", options.message);
    }
    if (options.textOkButton) {
      args.push("--ok-label", options.textOkButton);
    }
    if (options.type === "question") {
      if (options.textCancelButton) {
        args.push("--cancel-label", options.textCancelButton);
      }
      if (options.defaultFocusedButton === "Cancel") {
        args.push("--default-cancel");
      }
    }

    try {
      process.execFileSync("zenity", args);
      return 0;
    } catch (error) {
      return 1;
    }
  };

  public showOpenDialog = async (options: Dialogs.OpenOptions) => {
    const args = ["--file-selection"];

    if (options.defaultPath) {
      args.push("--filename", options.defaultPath);
    }
    if (Array.isArray(options.properties) && options.properties.length > 0) {
      for (const prop of options.properties) {
        switch (prop) {
          case "openDirectory": {
            args.push("--directory");
            break;
          }
          case "multiSelections": {
            args.push("--multiple");
            break;
          }
        }
      }
    }

    let result: string[] | undefined;
    try {
      const stdout = await process.execFile("zenity", args);
      result = stdout.replace(/\n/, "").split("|");
    } catch (error) {
      return null;
    }

    return result;
  };
  public showOpenDialogSync = (options: Dialogs.OpenOptions) => {
    const args = ["--file-selection"];

    if (options.defaultPath) {
      args.push("--filename", options.defaultPath);
    }
    if (Array.isArray(options.properties) && options.properties.length > 0) {
      for (const prop of options.properties) {
        switch (prop) {
          case "openDirectory": {
            args.push("--directory");
            break;
          }
          case "multiSelections": {
            args.push("--multiple");
            break;
          }
        }
      }
    }

    let result: string[] | undefined;
    try {
      const stdout = process.execFileSync("zenity", args);
      result = stdout.replace(/\n/, "").split("|");
    } catch (error) {
      return null;
    }

    return result;
  };

  public showSaveDialog = async (options: Dialogs.SaveOptions) => {
    const args = ["--file-selection", "--save", "--confirm-overwrite"];

    if (options.defaultPath) {
      args.push("--filename", options.defaultPath);
    }

    let result: string | undefined;
    try {
      result = await process.execFile("zenity", args);
      result = result.replace(/\n/, "");
    } catch (error) {
      return null;
    }

    return result;
  };
  public showSaveDialogSync = (options: Dialogs.SaveOptions) => {
    const args = ["--file-selection", "--save", "--confirm-overwrite"];

    if (options.defaultPath) {
      args.push("--filename", options.defaultPath);
    }

    let result: string | undefined;
    try {
      result = process.execFileSync("zenity", args);
      result = result.replace(/\n/, "");
    } catch (error) {
      return null;
    }

    return result;
  };
}

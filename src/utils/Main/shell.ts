import { shell } from "electron";
import { isValidExternalUrl } from "../Common/url";

export const openExternalSafe = (url: string) => {
  if (isValidExternalUrl(url)) {
    shell.openExternal(url);
  } else {
    console.warn(`Blocked attempt to open external unsafe URL: ${url}`);
  }
};

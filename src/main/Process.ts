import { promisify } from "util";
import { exec as cp_exec, execSync, execFile as cp_execFile, execFileSync as cp_execFileSync } from "child_process";

import { logger } from "./Logger";

export class Process {
  constructor() {}

  public exec = async (command: string): Promise<string> => {
    const exec = promisify(cp_exec);

    const result = await exec(command);

    if (result.stderr !== "") {
      logger.error(`Exec command: "${command}" fails with error: `, result.stderr);
      throw new Error(`Exec command: "${command}" fails with error: ${result.stderr}`);
    }

    return result.stdout;
  };

  public execSync = (command: string): string => {
    const result = execSync(command);

    return result.toString();
  };

  public execFile = async (file: string, args: string[]): Promise<string> => {
    const execFile = promisify(cp_execFile);

    const result = await execFile(file, args);

    if (result.stderr !== "") {
      logger.error(`Exec file: "${file} ${args.join(" ")}" fails with error: `, result.stderr);
      throw new Error(`Exec file: "${file} ${args.join(" ")}" fails with error: ${result.stderr}`);
    }

    return result.stdout;
  };

  public execFileSync = (file: string, args: string[]): string => {
    const result = cp_execFileSync(file, args);

    return result.toString();
  };
}

export const process = new Process();

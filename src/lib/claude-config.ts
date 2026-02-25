import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { ClaudeSettings, InstallScope } from "./types.js";

export function resolveConfigPath(input: {
  scope: InstallScope;
  projectDir?: string;
  configPath?: string;
}): string {
  if (input.configPath) {
    return path.resolve(input.configPath);
  }

  if (input.scope === "global") {
    return path.join(os.homedir(), ".claude", "settings.json");
  }

  const projectDir = input.projectDir ? path.resolve(input.projectDir) : process.cwd();
  return path.join(projectDir, ".claude", "settings.local.json");
}

export async function readSettings(configPath: string): Promise<ClaudeSettings> {
  try {
    const raw = await fs.readFile(configPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Settings file must contain a JSON object.");
    }
    return parsed as ClaudeSettings;
  } catch (error) {
    const asNodeError = error as NodeJS.ErrnoException;
    if (asNodeError.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

export async function writeSettings(configPath: string, settings: ClaudeSettings): Promise<void> {
  await fs.mkdir(path.dirname(configPath), { recursive: true });

  const exists = await pathExists(configPath);
  if (exists) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${configPath}.bak.${stamp}`;
    await fs.copyFile(configPath, backupPath);
  }

  const serialized = `${JSON.stringify(settings, null, 2)}\n`;
  await fs.writeFile(configPath, serialized, "utf8");
}

export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

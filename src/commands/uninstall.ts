import fs from "node:fs/promises";
import path from "node:path";
import {
  pathExists,
  readSettings,
  resolveConfigPath,
  writeSettings
} from "../lib/claude-config.js";
import { uninstallManagedHooks } from "../lib/hooks-merge.js";
import { confirmPrompt, selectPrompt } from "../lib/prompt.js";
import type { InstallScope, UninstallOptions } from "../lib/types.js";

export async function runUninstall(options: UninstallOptions): Promise<void> {
  const scope =
    options.scope ??
    (await selectPrompt<InstallScope>("Uninstall scope:", [
      { label: "Project local (.claude/settings.local.json)", value: "project" },
      { label: "Global (~/.claude/settings.json)", value: "global" }
    ]));

  const configPath = resolveConfigPath({
    scope,
    projectDir: options.projectDir,
    configPath: options.configPath
  });

  if (!options.yes) {
    const shouldContinue = await confirmPrompt(`Remove Claudecraft hooks from ${configPath}?`);
    if (!shouldContinue) {
      process.stdout.write("Cancelled.\n");
      return;
    }
  }

  const settings = await readSettings(configPath);
  const { removed } = uninstallManagedHooks(settings);
  const stateFilePath = path.join(path.dirname(configPath), "claudecraft-session.json");
  delete settings.claudecraft;
  await writeSettings(configPath, settings);
  if (await pathExists(stateFilePath)) {
    await fs.unlink(stateFilePath);
  }

  process.stdout.write(`Config: ${configPath}\n`);
  process.stdout.write(`Removed hooks: ${removed}\n`);
  process.stdout.write(`Removed state file: ${stateFilePath}\n`);
  process.stdout.write(removed === 0 ? "No matching hooks found.\n" : "Uninstall complete.\n");
}

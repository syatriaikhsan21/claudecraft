import { MANAGED_BY, type HookEventName, type RaceOption } from "./types.js";

function quote(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function normalizedForShell(filePath: string): string {
  return process.platform === "win32" ? filePath.replace(/\\/g, "/") : filePath;
}

export function buildHookCommand(input: {
  playerScriptPath: string;
  manifestPath: string;
  event: HookEventName;
  race: RaceOption;
  stateFilePath: string;
  soundsDir: string;
  toolCooldownSec: number;
  failureCooldownSec: number;
  failureFilter: boolean;
}): string {
  const scriptPath = normalizedForShell(input.playerScriptPath);
  const manifestPath = normalizedForShell(input.manifestPath);
  const stateFilePath = normalizedForShell(input.stateFilePath);
  const soundsDir = normalizedForShell(input.soundsDir);
  const parts = [
    "node",
    quote(scriptPath),
    "--event",
    quote(input.event),
    "--race",
    quote(input.race),
    "--manifest",
    quote(manifestPath),
    "--state-file",
    quote(stateFilePath),
    "--sounds-dir",
    quote(soundsDir),
    "--tool-cooldown",
    quote(String(input.toolCooldownSec)),
    "--failure-cooldown",
    quote(String(input.failureCooldownSec)),
    "--managed-by",
    quote(MANAGED_BY)
  ];

  if (!input.failureFilter) {
    parts.push("--no-failure-filter");
  }

  return parts.join(" ");
}

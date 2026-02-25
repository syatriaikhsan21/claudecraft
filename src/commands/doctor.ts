import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathExists, readSettings, resolveConfigPath } from "../lib/claude-config.js";
import { listInstalledManagedEvents } from "../lib/hooks-merge.js";
import { listAllManifestFiles, readManifest, resolveSelection, resolveSoundPath } from "../lib/manifest.js";
import { showOutro, withSpinner } from "../lib/ui.js";
import {
  ALL_EVENTS,
  FIXED_RACES,
  type DoctorOptions,
  type HookEventName,
  type InstallScope,
  type RaceOption
} from "../lib/types.js";

interface DoctorReport {
  configPath: string;
  configFound: boolean;
  installedEvents: HookEventName[];
  configuredRace?: RaceOption;
  soundsDir?: string;
  toolCooldownSec?: number;
  failureCooldownSec?: number;
  failureFilter?: boolean;
  missingSoundFiles: string[];
  missingMappings: string[];
  playbackSupport: {
    platform: NodeJS.Platform;
    supported: boolean;
    detail: string;
  };
}

function hasCommand(name: string): boolean {
  const probe =
    process.platform === "win32"
      ? spawnSync("where", [name], { stdio: "ignore" })
      : spawnSync("which", [name], { stdio: "ignore" });
  return probe.status === 0;
}

function playbackStatus(): DoctorReport["playbackSupport"] {
  if (process.platform === "darwin") {
    return {
      platform: process.platform,
      supported: hasCommand("afplay"),
      detail: hasCommand("afplay") ? "afplay available" : "afplay is not installed"
    };
  }

  if (process.platform === "linux") {
    if (hasCommand("aplay")) {
      return { platform: process.platform, supported: true, detail: "aplay available" };
    }
    if (hasCommand("paplay")) {
      return { platform: process.platform, supported: true, detail: "paplay available" };
    }
    return {
      platform: process.platform,
      supported: false,
      detail: "Neither aplay nor paplay is installed"
    };
  }

  if (process.platform === "win32") {
    return {
      platform: process.platform,
      supported: hasCommand("powershell"),
      detail: hasCommand("powershell")
        ? "powershell available"
        : "powershell is not available in PATH"
    };
  }

  return {
    platform: process.platform,
    supported: false,
    detail: "Unsupported platform"
  };
}

export async function runDoctor(
  options: DoctorOptions,
  runtime: { packageRoot: string }
): Promise<void> {
  const scope = (options.scope ?? "project") as InstallScope;
  const configPath = resolveConfigPath({
    scope,
    projectDir: options.projectDir,
    configPath: options.configPath
  });

  const report: DoctorReport = {
    configPath,
    configFound: false,
    installedEvents: [],
    configuredRace: undefined,
    soundsDir: undefined,
    toolCooldownSec: undefined,
    failureCooldownSec: undefined,
    failureFilter: undefined,
    missingSoundFiles: [],
    missingMappings: [],
    playbackSupport: playbackStatus()
  };

  await withSpinner("Inspecting Claude settings", async () => {
    report.configFound = await pathExists(configPath);

    try {
      const settings = await readSettings(configPath);
      report.installedEvents = listInstalledManagedEvents(settings);
      const race = settings.claudecraft?.race;
      if (race === "protoss" || race === "terran" || race === "zerg" || race === "random") {
        report.configuredRace = race;
      }
      if (typeof settings.claudecraft?.soundsDir === "string") {
        report.soundsDir = settings.claudecraft.soundsDir;
      }
      if (typeof settings.claudecraft?.toolCooldownSec === "number") {
        report.toolCooldownSec = settings.claudecraft.toolCooldownSec;
      }
      if (typeof settings.claudecraft?.failureCooldownSec === "number") {
        report.failureCooldownSec = settings.claudecraft.failureCooldownSec;
      }
      if (typeof settings.claudecraft?.failureFilter === "boolean") {
        report.failureFilter = settings.claudecraft.failureFilter;
      }
    } catch (error) {
      process.stderr.write(`Failed to parse config: ${(error as Error).message}\n`);
    }
  }, "Settings inspected");

  const manifestPath = path.join(runtime.packageRoot, "assets", "manifest.json");
  const manifest = await withSpinner("Validating manifest mappings", async () => {
    const manifest = await readManifest(manifestPath);
    for (const race of FIXED_RACES) {
      for (const event of ALL_EVENTS) {
        const selection = resolveSelection(manifest, race, event);
        if (selection.type === "single" && !selection.file) {
          report.missingMappings.push(`${race}.${event}`);
        }
        if (selection.type === "pool" && selection.files.length === 0) {
          report.missingMappings.push(`${race}.${event}`);
        }
      }
    }
    return manifest;
  }, "Mappings validated");

  await withSpinner("Checking curated sound files", async () => {
    for (const fileName of listAllManifestFiles(manifest)) {
      const resolved = resolveSoundPath(manifestPath, manifest, fileName, report.soundsDir);
      try {
        await fs.access(resolved);
      } catch {
        report.missingSoundFiles.push(resolved);
      }
    }
  }, "Sound file check complete");

  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  process.stdout.write(`Config path: ${report.configPath}\n`);
  process.stdout.write(`Config readable: ${report.configFound ? "yes" : "no"}\n`);
  process.stdout.write(`Configured race: ${report.configuredRace ?? "(none)"}\n`);
  process.stdout.write(`Sounds dir: ${report.soundsDir ?? "(manifest default)"}\n`);
  process.stdout.write(`Tool cooldown: ${report.toolCooldownSec ?? 2}s\n`);
  process.stdout.write(`Failure cooldown: ${report.failureCooldownSec ?? 15}s\n`);
  process.stdout.write(`Failure filter: ${(report.failureFilter ?? true) ? "on" : "off"}\n`);
  process.stdout.write(
    `Installed events: ${
      report.installedEvents.length ? report.installedEvents.join(", ") : "(none)"
    }\n`
  );
  process.stdout.write(
    `Playback support: ${report.playbackSupport.supported ? "yes" : "no"} (${
      report.playbackSupport.detail
    })\n`
  );
  process.stdout.write(
    report.missingSoundFiles.length
      ? `Missing sound files:\n- ${report.missingSoundFiles.join("\n- ")}\n`
      : "Sound files: all present\n"
  );
  process.stdout.write(
    report.missingMappings.length
      ? `Missing mappings:\n- ${report.missingMappings.join("\n- ")}\n`
      : "Mappings: all present\n"
  );
  showOutro("Doctor complete");
}

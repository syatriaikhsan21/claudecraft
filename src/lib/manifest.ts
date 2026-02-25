import fs from "node:fs/promises";
import path from "node:path";
import {
  ALL_EVENTS,
  FIXED_RACES,
  type FixedRace,
  type HookEventName,
  type SoundManifest,
  type SoundSelection
} from "./types.js";

export async function readManifest(manifestPath: string): Promise<SoundManifest> {
  const raw = await fs.readFile(manifestPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!isSoundManifest(parsed)) {
    throw new Error(`Invalid manifest format: ${manifestPath}`);
  }
  return parsed;
}

export function resolveSelection(
  manifest: SoundManifest,
  race: FixedRace,
  event: HookEventName
): SoundSelection {
  return manifest.races[race][event];
}

export function resolveSoundPath(
  manifestPath: string,
  manifest: SoundManifest,
  fileName: string,
  soundsRootOverride?: string
): string {
  if (soundsRootOverride && soundsRootOverride.length > 0) {
    return path.resolve(soundsRootOverride, fileName);
  }
  return path.resolve(path.dirname(manifestPath), manifest.sourceRoot, fileName);
}

export function listAllManifestFiles(manifest: SoundManifest): string[] {
  const files = new Set<string>();
  for (const race of FIXED_RACES) {
    for (const event of ALL_EVENTS) {
      const selection = manifest.races[race][event];
      if (selection.type === "single") {
        files.add(selection.file);
      } else {
        for (const file of selection.files) {
          files.add(file);
        }
      }
    }
  }
  return [...files];
}

function isSoundManifest(value: unknown): value is SoundManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const asManifest = value as Partial<SoundManifest>;
  if (typeof asManifest.version !== "number") {
    return false;
  }
  if (typeof asManifest.sourceRoot !== "string" || asManifest.sourceRoot.length === 0) {
    return false;
  }
  if (
    !asManifest.random ||
    typeof asManifest.random !== "object" ||
    asManifest.random.strategy !== "session-sticky"
  ) {
    return false;
  }
  if (!asManifest.races || typeof asManifest.races !== "object" || Array.isArray(asManifest.races)) {
    return false;
  }

  for (const race of FIXED_RACES) {
    const raceMap = (asManifest.races as Record<string, unknown>)[race];
    if (!isValidRaceMap(raceMap)) {
      return false;
    }
  }

  return true;
}

function isValidRaceMap(value: unknown): value is Record<HookEventName, SoundSelection> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  for (const event of ALL_EVENTS) {
    const selection = (value as Record<string, unknown>)[event];
    if (!isSoundSelection(selection)) {
      return false;
    }
  }

  return true;
}

function isSoundSelection(value: unknown): value is SoundSelection {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const asSelection = value as Partial<SoundSelection>;
  if (asSelection.type === "single") {
    return typeof asSelection.file === "string" && asSelection.file.length > 0;
  }
  if (asSelection.type === "pool") {
    if (!Array.isArray(asSelection.files) || asSelection.files.length === 0) {
      return false;
    }
    return asSelection.files.every((item) => typeof item === "string" && item.length > 0);
  }
  return false;
}

import path from "node:path";
import {
  readSettings,
  resolveConfigPath,
  writeSettings
} from "../lib/claude-config.js";
import { installManagedHook } from "../lib/hooks-merge.js";
import { readManifest } from "../lib/manifest.js";
import { buildHookCommand } from "../lib/playback-command.js";
import { confirmPrompt, selectPrompt } from "../lib/prompt.js";
import { ensureSoundsAvailable } from "../lib/sounds.js";
import {
  PRESET_EVENTS,
  RACES,
  type HookPreset,
  type InstallOptions,
  type InstallScope,
  type RaceOption
} from "../lib/types.js";

export async function runInstall(
  options: InstallOptions,
  runtime: { packageRoot: string }
): Promise<void> {
  const scope =
    options.scope ??
    (await selectPrompt<InstallScope>("Install scope:", [
      { label: "Project local (.claude/settings.local.json)", value: "project" },
      { label: "Global (~/.claude/settings.json)", value: "global" }
    ]));

  const preset =
    options.preset ??
    (await selectPrompt<HookPreset>("Hook preset:", [
      { label: "Core (SessionStart, Stop, Notification)", value: "core" },
      {
        label: "Expanded (+PreToolUse, PostToolUse, UserPromptSubmit)",
        value: "expanded"
      }
    ]));

  const race =
    options.race ??
    (await selectPrompt<RaceOption>("Race:", [
      { label: "Protoss", value: "protoss" },
      { label: "Terran", value: "terran" },
      { label: "Zerg", value: "zerg" },
      { label: "Random", value: "random" }
    ]));

  const configPath = resolveConfigPath({
    scope,
    projectDir: options.projectDir,
    configPath: options.configPath
  });
  const manifestPath = path.join(runtime.packageRoot, "assets", "manifest.json");
  const playerScriptPath = path.join(runtime.packageRoot, "dist", "player", "play-sound.js");
  const stateFilePath = path.join(path.dirname(configPath), "claudecraft-session.json");

  if (!RACES.includes(race)) {
    throw new Error(`Invalid race: ${race}`);
  }

  await readManifest(manifestPath);
  const sounds = await ensureSoundsAvailable({
    packageRoot: runtime.packageRoot,
    manifestPath,
    explicitSoundsDir: options.soundsDir,
    verbose: options.verbose
  });

  if (!options.yes) {
    const shouldContinue = await confirmPrompt(
      `Install ${preset} preset (${race}) hooks into ${configPath}?`
    );
    if (!shouldContinue) {
      process.stdout.write("Cancelled.\n");
      return;
    }
  }

  const settings = await readSettings(configPath);
  let added = 0;
  let updated = 0;
  for (const event of PRESET_EVENTS[preset]) {
    const command = buildHookCommand({
      playerScriptPath,
      manifestPath,
      event,
      race,
      stateFilePath,
      soundsDir: sounds.soundsDir
    });
    const result = installManagedHook(settings, event, command);
    if (result.added) {
      added += 1;
    }
    if (result.updated) {
      updated += 1;
    }
  }

  settings.claudecraft = {
    race,
    source: "curated-sounds",
    manifestVersion: 2,
    stateFile: stateFilePath,
    soundsDir: sounds.soundsDir,
    installedAt: new Date().toISOString()
  };

  await writeSettings(configPath, settings);

  process.stdout.write(`Config: ${configPath}\n`);
  process.stdout.write(`Preset: ${preset}\n`);
  process.stdout.write(`Race: ${race}\n`);
  process.stdout.write(`Sounds dir: ${sounds.soundsDir}\n`);
  process.stdout.write(`Downloaded sounds: ${sounds.downloaded}\n`);
  process.stdout.write(`Added hooks: ${added}\n`);
  process.stdout.write(`Updated hooks: ${updated}\n`);
  process.stdout.write(
    added === 0 && updated === 0
      ? "No changes (already installed with same settings).\n"
      : "Install complete. Restart Claude Code session if needed.\n"
  );
}

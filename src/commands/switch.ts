import path from "node:path";
import { readSettings, resolveConfigPath, writeSettings } from "../lib/claude-config.js";
import { installManagedHook, listInstalledManagedEvents } from "../lib/hooks-merge.js";
import { buildHookCommand } from "../lib/playback-command.js";
import { confirmPrompt, selectPrompt } from "../lib/prompt.js";
import { ensureSoundsAvailable } from "../lib/sounds.js";
import { normalizeFailureCooldown, normalizeToolCooldown } from "../lib/failure-logic.js";
import { showOutro, withSpinner } from "../lib/ui.js";
import { type InstallScope, type RaceOption, type SwitchOptions } from "../lib/types.js";

export async function runSwitch(
  options: SwitchOptions,
  runtime: { packageRoot: string }
): Promise<void> {
  const race =
    options.race ??
    (await selectPrompt<RaceOption>("Switch to race:", [
      { label: "Protoss", value: "protoss" },
      { label: "Terran", value: "terran" },
      { label: "Zerg", value: "zerg" },
      { label: "Random", value: "random" }
    ]));

  const scope =
    options.scope ??
    (await selectPrompt<InstallScope>("Switch scope:", [
      { label: "Project local (.claude/settings.local.json)", value: "project" },
      { label: "Global (~/.claude/settings.json)", value: "global" }
    ]));

  const configPath = resolveConfigPath({
    scope,
    projectDir: options.projectDir,
    configPath: options.configPath
  });
  const manifestPath = path.join(runtime.packageRoot, "assets", "manifest.json");
  const playerScriptPath = path.join(runtime.packageRoot, "dist", "player", "play-sound.js");

  const settings = await readSettings(configPath);
  const installedEvents = listInstalledManagedEvents(settings);
  if (installedEvents.length === 0) {
    throw new Error("No managed hooks found. Run install first.");
  }

  const stateFilePath =
    settings.claudecraft?.stateFile ??
    path.join(path.dirname(configPath), "claudecraft-session.json");
  const toolCooldownSec = normalizeToolCooldown(
    options.toolCooldownSec ?? settings.claudecraft?.toolCooldownSec
  );
  const failureCooldownSec = normalizeFailureCooldown(
    options.failureCooldownSec ?? settings.claudecraft?.failureCooldownSec
  );
  const failureFilter = options.failureFilter ?? settings.claudecraft?.failureFilter ?? true;
  const sounds = await withSpinner(
    "Preparing race sound pack",
    async () =>
      ensureSoundsAvailable({
        packageRoot: runtime.packageRoot,
        manifestPath,
        explicitSoundsDir: options.soundsDir ?? settings.claudecraft?.soundsDir,
        verbose: options.verbose
      }),
    (value) => `Sounds ready (${value.downloaded} downloaded)`
  );

  if (!options.yes) {
    const shouldContinue = await confirmPrompt(
      `Switch race to ${race} in ${configPath} for ${installedEvents.length} hooks?`
    );
    if (!shouldContinue) {
      process.stdout.write("Cancelled.\n");
      return;
    }
  }

  const updated = await withSpinner(
    "Updating managed hooks",
    async () => {
      let updated = 0;
      for (const event of installedEvents) {
        const command = buildHookCommand({
          playerScriptPath,
          manifestPath,
          event,
          race,
          stateFilePath,
          soundsDir: sounds.soundsDir,
          toolCooldownSec,
          failureCooldownSec,
          failureFilter
        });

        const result = installManagedHook(settings, event, command);
        if (result.updated || result.added) {
          updated += 1;
        }
      }
      return updated;
    },
    (value) => `Updated ${value} hook${value === 1 ? "" : "s"}`
  );

  settings.claudecraft = {
    race,
    source: "curated-sounds",
    manifestVersion: 2,
    stateFile: stateFilePath,
    soundsDir: sounds.soundsDir,
    toolCooldownSec,
    failureCooldownSec,
    failureFilter,
    installedAt: settings.claudecraft?.installedAt ?? new Date().toISOString()
  };

  await withSpinner("Writing Claude settings", async () => {
    await writeSettings(configPath, settings);
  }, "Settings saved");

  process.stdout.write(`Config: ${configPath}\n`);
  process.stdout.write(`Race: ${race}\n`);
  process.stdout.write(`Updated hooks: ${updated}\n`);
  process.stdout.write(`Tool cooldown: ${toolCooldownSec}s\n`);
  process.stdout.write(`Failure cooldown: ${failureCooldownSec}s\n`);
  process.stdout.write(`Failure filter: ${failureFilter ? "on" : "off"}\n`);
  process.stdout.write("Switch complete.\n");
  showOutro("Switch complete");
}

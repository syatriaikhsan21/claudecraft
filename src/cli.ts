#!/usr/bin/env node
import { runDoctor } from "./commands/doctor.js";
import { runInstall } from "./commands/install.js";
import { runUninstall } from "./commands/uninstall.js";
import { asBoolean, asString, parseArgs } from "./lib/args.js";
import { selectPrompt } from "./lib/prompt.js";
import { packageRootFromMeta } from "./lib/runtime-paths.js";
import type { HookPreset, InstallScope, RaceOption } from "./lib/types.js";

function printHelp(): void {
  process.stdout.write(`claudecraft

Usage:
  claudecraft install [--scope project|global] [--preset core|expanded] [--race protoss|terran|zerg|random] [--sounds-dir PATH] [--project-dir PATH] [--config-path PATH] [--yes]
  claudecraft uninstall [--scope project|global] [--project-dir PATH] [--config-path PATH] [--yes]
  claudecraft doctor [--scope project|global] [--project-dir PATH] [--config-path PATH] [--json]

Examples:
  claudecraft install
  claudecraft install --scope project --preset core --race protoss
  claudecraft uninstall --scope global --yes
  claudecraft doctor --json
`);
}

function parseScope(value?: string): InstallScope | undefined {
  if (value === "project" || value === "global") {
    return value;
  }
  return undefined;
}

function parsePreset(value?: string): HookPreset | undefined {
  if (value === "core" || value === "expanded") {
    return value;
  }
  return undefined;
}

function parseRace(value?: string): RaceOption | undefined {
  if (value === "protoss" || value === "terran" || value === "zerg" || value === "random") {
    return value;
  }
  return undefined;
}

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));
  let command = parsed.command;
  const runtime = { packageRoot: packageRootFromMeta(import.meta.url) };

  if (command === "help" || asBoolean(parsed.flags, "help")) {
    printHelp();
    return;
  }

  if (!command) {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      printHelp();
      return;
    }

    command = await selectPrompt<"install" | "uninstall" | "doctor" | "help">(
      "What do you want to do?",
      [
        { label: "Install hooks", value: "install" },
        { label: "Uninstall hooks", value: "uninstall" },
        { label: "Run doctor", value: "doctor" },
        { label: "Show help", value: "help" }
      ]
    );

    if (command === "help") {
      printHelp();
      return;
    }
  }

  switch (command) {
    case "install":
      await runInstall(
        {
          scope: parseScope(asString(parsed.flags, "scope")),
          preset: parsePreset(asString(parsed.flags, "preset")),
          race: parseRace(asString(parsed.flags, "race")),
          soundsDir: asString(parsed.flags, "sounds-dir"),
          projectDir: asString(parsed.flags, "project-dir"),
          configPath: asString(parsed.flags, "config-path"),
          yes: asBoolean(parsed.flags, "yes"),
          verbose: asBoolean(parsed.flags, "verbose")
        },
        runtime
      );
      return;
    case "uninstall":
      await runUninstall({
        scope: parseScope(asString(parsed.flags, "scope")),
        projectDir: asString(parsed.flags, "project-dir"),
        configPath: asString(parsed.flags, "config-path"),
        yes: asBoolean(parsed.flags, "yes"),
        verbose: asBoolean(parsed.flags, "verbose")
      });
      return;
    case "doctor":
      await runDoctor(
        {
          scope: parseScope(asString(parsed.flags, "scope")),
          projectDir: asString(parsed.flags, "project-dir"),
          configPath: asString(parsed.flags, "config-path"),
          json: asBoolean(parsed.flags, "json"),
          verbose: asBoolean(parsed.flags, "verbose")
        },
        runtime
      );
      return;
    default:
      process.stderr.write(`Unknown command: ${command}\n\n`);
      printHelp();
      process.exitCode = 1;
      return;
  }
}

main().catch((error) => {
  process.stderr.write(`${(error as Error).message}\n`);
  process.exitCode = 1;
});

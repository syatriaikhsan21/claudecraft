export const MANAGED_BY = "claudecraft";

export const ALL_EVENTS = [
  "SessionStart",
  "Stop",
  "Notification",
  "PreToolUse",
  "PostToolUse",
  "PostToolUseFailure",
  "UserPromptSubmit"
] as const;

export const PRESET_EVENTS = {
  core: ["SessionStart", "Stop", "Notification"],
  expanded: [
    "SessionStart",
    "Stop",
    "Notification",
    "PreToolUse",
    "PostToolUse",
    "PostToolUseFailure",
    "UserPromptSubmit"
  ]
} as const;

export const RACES = ["protoss", "terran", "zerg", "random"] as const;
export const FIXED_RACES = ["protoss", "terran", "zerg"] as const;

export const EVENT_MATCHERS: Partial<Record<HookEventName, string>> = {
  PreToolUse: "Edit|Write|MultiEdit|Bash|Explore",
  PostToolUse: "Edit|Write|MultiEdit|Bash|Explore",
  PostToolUseFailure: "Bash"
};

export type HookEventName = (typeof ALL_EVENTS)[number];
export type HookPreset = keyof typeof PRESET_EVENTS;
export type InstallScope = "project" | "global";
export type RaceOption = (typeof RACES)[number];
export type FixedRace = (typeof FIXED_RACES)[number];

export interface CommandHook {
  type: "command";
  command: string;
  timeout?: number;
}

export interface HookEntry {
  matcher?: string;
  hooks: CommandHook[];
}

export type HooksMap = Partial<Record<HookEventName, HookEntry[]>>;

export interface ClaudeSettings {
  hooks?: HooksMap;
  claudecraft?: ClaudecraftSettingsMetadata;
  [key: string]: unknown;
}

export interface SoundSelectionSingle {
  type: "single";
  file: string;
}

export interface SoundSelectionPool {
  type: "pool";
  files: string[];
}

export type SoundSelection = SoundSelectionSingle | SoundSelectionPool;

export interface SoundManifest {
  version: number;
  sourceRoot: string;
  random: {
    strategy: "session-sticky";
  };
  races: Record<FixedRace, Record<HookEventName, SoundSelection>>;
}

export interface ClaudecraftSettingsMetadata {
  race: RaceOption;
  source: string;
  manifestVersion: number;
  stateFile: string;
  soundsDir: string;
  toolCooldownSec: number;
  failureCooldownSec: number;
  failureFilter: boolean;
  installedAt: string;
}

export interface InstallOptions {
  scope?: InstallScope;
  preset?: HookPreset;
  race?: RaceOption;
  soundsDir?: string;
  configPath?: string;
  projectDir?: string;
  yes?: boolean;
  verbose?: boolean;
  toolCooldownSec?: number;
  failureCooldownSec?: number;
  failureFilter?: boolean;
}

export interface SwitchOptions {
  scope?: InstallScope;
  race?: RaceOption;
  soundsDir?: string;
  configPath?: string;
  projectDir?: string;
  yes?: boolean;
  verbose?: boolean;
  toolCooldownSec?: number;
  failureCooldownSec?: number;
  failureFilter?: boolean;
}

export interface UninstallOptions {
  scope?: InstallScope;
  configPath?: string;
  projectDir?: string;
  yes?: boolean;
  verbose?: boolean;
}

export interface DoctorOptions {
  scope?: InstallScope;
  configPath?: string;
  projectDir?: string;
  json?: boolean;
  verbose?: boolean;
}

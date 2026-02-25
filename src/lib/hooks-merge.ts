import {
  EVENT_MATCHERS,
  MANAGED_BY,
  type ClaudeSettings,
  type HookEntry,
  type HookEventName
} from "./types.js";

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ensureEventEntries(settings: ClaudeSettings, event: HookEventName): HookEntry[] {
  if (!settings.hooks) {
    settings.hooks = {};
  }

  const existing = settings.hooks[event];
  if (!existing) {
    const created: HookEntry[] = [];
    settings.hooks[event] = created;
    return created;
  }

  if (!Array.isArray(existing)) {
    throw new Error(`Invalid hook format for event "${event}". Expected an array.`);
  }

  return existing as HookEntry[];
}

function hookContainsMarker(entry: unknown, event: HookEventName): boolean {
  if (!isObject(entry)) {
    return false;
  }

  const hooks = entry.hooks;
  if (!Array.isArray(hooks)) {
    return false;
  }

  for (const hook of hooks) {
    if (!isObject(hook)) {
      continue;
    }
    if (hook.type !== "command" || typeof hook.command !== "string") {
      continue;
    }
    if (
      hook.command.includes(`--managed-by "${MANAGED_BY}"`) &&
      hook.command.includes(`--event "${event}"`)
    ) {
      return true;
    }
  }

  return false;
}

export function installManagedHook(
  settings: ClaudeSettings,
  event: HookEventName,
  command: string
): { added: boolean; updated: boolean } {
  const entries = ensureEventEntries(settings, event);
  const existingIndex = entries.findIndex((entry) => hookContainsMarker(entry, event));
  if (existingIndex >= 0) {
    const existingEntry = entries[existingIndex];
    const existingCommand =
      existingEntry.hooks.find((hook) => hook.type === "command")?.command ?? "";
    const matcher = EVENT_MATCHERS[event];
    const commandChanged = existingCommand !== command;
    const matcherChanged = existingEntry.matcher !== matcher;
    if (!commandChanged && !matcherChanged) {
      return { added: false, updated: false };
    }

    existingEntry.hooks = [
      {
        type: "command",
        command,
        timeout: 10
      }
    ];

    if (matcher) {
      existingEntry.matcher = matcher;
    } else {
      delete existingEntry.matcher;
    }

    return { added: false, updated: true };
  }

  const entry: HookEntry = {
    hooks: [
      {
        type: "command",
        command,
        timeout: 10
      }
    ]
  };

  const matcher = EVENT_MATCHERS[event];
  if (matcher) {
    entry.matcher = matcher;
  }

  entries.push(entry);
  return { added: true, updated: false };
}

export function uninstallManagedHooks(settings: ClaudeSettings): { removed: number } {
  if (!settings.hooks || !isObject(settings.hooks)) {
    return { removed: 0 };
  }

  let removed = 0;
  for (const [event, entries] of Object.entries(settings.hooks)) {
    if (!Array.isArray(entries)) {
      continue;
    }

    const kept = entries.filter((entry) => !hookContainsMarker(entry, event as HookEventName));
    removed += entries.length - kept.length;

    if (kept.length) {
      settings.hooks[event as HookEventName] = kept;
    } else {
      delete settings.hooks[event as HookEventName];
    }
  }

  if (Object.keys(settings.hooks).length === 0) {
    delete settings.hooks;
  }

  return { removed };
}

export function listInstalledManagedEvents(settings: ClaudeSettings): HookEventName[] {
  if (!settings.hooks || !isObject(settings.hooks)) {
    return [];
  }

  const installed: HookEventName[] = [];
  for (const [event, entries] of Object.entries(settings.hooks)) {
    if (!Array.isArray(entries)) {
      continue;
    }
    if (entries.some((entry) => hookContainsMarker(entry, event as HookEventName))) {
      installed.push(event as HookEventName);
    }
  }

  return installed;
}

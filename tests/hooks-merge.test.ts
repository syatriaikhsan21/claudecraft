import { describe, expect, test } from "bun:test";
import {
  installManagedHook,
  listInstalledManagedEvents,
  uninstallManagedHooks
} from "../src/lib/hooks-merge.js";
import type { ClaudeSettings } from "../src/lib/types.js";

describe("hooks-merge", () => {
  test("install is idempotent and updates command when changed", () => {
    const settings: ClaudeSettings = {};
    const initial = installManagedHook(
      settings,
      "SessionStart",
      "node player.js --event \"SessionStart\" --managed-by \"claudecraft\""
    );
    expect(initial.added).toBe(true);
    expect(initial.updated).toBe(false);

    const duplicate = installManagedHook(
      settings,
      "SessionStart",
      "node player.js --event \"SessionStart\" --managed-by \"claudecraft\""
    );
    expect(duplicate.added).toBe(false);
    expect(duplicate.updated).toBe(false);

    const changed = installManagedHook(
      settings,
      "SessionStart",
      "node player.js --event \"SessionStart\" --race \"zerg\" --managed-by \"claudecraft\""
    );
    expect(changed.added).toBe(false);
    expect(changed.updated).toBe(true);

    const command = settings.hooks?.SessionStart?.[0]?.hooks?.[0]?.command;
    expect(command).toContain("--race \"zerg\"");
  });

  test("list and uninstall only managed hooks", () => {
    const settings: ClaudeSettings = {
      hooks: {
        SessionStart: [
          {
            hooks: [
              {
                type: "command",
                command: "node managed.js --event \"SessionStart\" --managed-by \"claudecraft\""
              }
            ]
          }
        ],
        Stop: [
          {
            hooks: [{ type: "command", command: "echo external-hook" }]
          }
        ]
      }
    };

    expect(listInstalledManagedEvents(settings)).toEqual(["SessionStart"]);
    const removed = uninstallManagedHooks(settings);
    expect(removed.removed).toBe(1);
    expect(settings.hooks?.Stop?.length).toBe(1);
    expect(settings.hooks?.SessionStart).toBeUndefined();
  });
});

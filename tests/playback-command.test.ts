import { describe, expect, test } from "bun:test";
import { buildHookCommand } from "../src/lib/playback-command.js";

describe("playback-command", () => {
  test("includes failure cooldown and managed marker", () => {
    const command = buildHookCommand({
      playerScriptPath: "/tmp/play-sound.js",
      manifestPath: "/tmp/manifest.json",
      event: "PostToolUseFailure",
      race: "zerg",
      stateFilePath: "/tmp/state.json",
      soundsDir: "/tmp/sounds",
      toolCooldownSec: 2,
      failureCooldownSec: 15,
      failureFilter: true
    });
    expect(command).toContain("--tool-cooldown \"2\"");
    expect(command).toContain("--failure-cooldown \"15\"");
    expect(command).toContain("--managed-by \"claudecraft\"");
    expect(command).not.toContain("--no-failure-filter");
  });

  test("adds no-failure-filter flag when disabled", () => {
    const command = buildHookCommand({
      playerScriptPath: "/tmp/play-sound.js",
      manifestPath: "/tmp/manifest.json",
      event: "PostToolUseFailure",
      race: "terran",
      stateFilePath: "/tmp/state.json",
      soundsDir: "/tmp/sounds",
      toolCooldownSec: 1,
      failureCooldownSec: 7,
      failureFilter: false
    });
    expect(command).toContain("--no-failure-filter");
  });
});

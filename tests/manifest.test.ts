import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "bun:test";
import {
  listAllManifestFiles,
  readManifest,
  resolveSelection,
  resolveSoundPath
} from "../src/lib/manifest.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(testDir, "..", "assets", "manifest.json");

describe("manifest", () => {
  test("reads v2 manifest and resolves key mappings", async () => {
    const manifest = await readManifest(manifestPath);
    expect(manifest.version).toBe(2);
    expect(manifest.sourceRoot).toBe("../curated-sounds");
    expect(manifest.random.strategy).toBe("session-sticky");

    const sessionStart = resolveSelection(manifest, "terran", "SessionStart");
    expect(sessionStart.type).toBe("single");
    if (sessionStart.type === "single") {
      expect(sessionStart.file).toBe("TSCRdy00.wav");
    }

    const userPrompt = resolveSelection(manifest, "protoss", "UserPromptSubmit");
    expect(userPrompt.type).toBe("pool");
    if (userPrompt.type === "pool") {
      expect(userPrompt.files.length).toBeGreaterThan(1);
    }

    for (const race of ["protoss", "terran", "zerg"] as const) {
      const preToolUse = resolveSelection(manifest, race, "PreToolUse");
      expect(preToolUse.type).toBe("pool");
      if (preToolUse.type === "pool") {
        expect(preToolUse.files.length).toBeGreaterThanOrEqual(4);
        expect(preToolUse.files.length).toBeLessThanOrEqual(6);
      }

      const postToolUse = resolveSelection(manifest, race, "PostToolUse");
      expect(postToolUse.type).toBe("pool");
      if (postToolUse.type === "pool") {
        expect(postToolUse.files.length).toBeGreaterThanOrEqual(4);
        expect(postToolUse.files.length).toBeLessThanOrEqual(6);
      }
    }

    const failure = resolveSelection(manifest, "terran", "PostToolUseFailure");
    expect(failure.type).toBe("single");
    if (failure.type === "single") {
      expect(failure.file).toBe("tadErr02.wav");
    }
  });

  test("all referenced files exist in curated-sounds", async () => {
    const manifest = await readManifest(manifestPath);
    for (const fileName of listAllManifestFiles(manifest)) {
      const resolved = resolveSoundPath(manifestPath, manifest, fileName);
      expect(fs.existsSync(resolved)).toBe(true);
    }
  });
});

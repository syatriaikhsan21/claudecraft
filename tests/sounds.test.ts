import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "bun:test";
import { ensureSoundsAvailable } from "../src/lib/sounds.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(testDir, "..");
const manifestPath = path.join(packageRoot, "assets", "manifest.json");

describe("sounds", () => {
  test("uses explicit sounds directory when complete", async () => {
    const result = await ensureSoundsAvailable({
      packageRoot,
      manifestPath,
      explicitSoundsDir: path.join(packageRoot, "curated-sounds")
    });
    expect(result.soundsDir).toContain("curated-sounds");
    expect(result.downloaded).toBe(0);
  });

  test("throws when explicit sounds directory is missing required files", async () => {
    await expect(
      ensureSoundsAvailable({
        packageRoot,
        manifestPath,
        explicitSoundsDir: path.join(packageRoot, "src")
      })
    ).rejects.toThrow("Provided --sounds-dir is missing files");
  });
});

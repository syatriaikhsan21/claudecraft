import fs from "node:fs/promises";

export interface SoundSourceConfig {
  version: number;
  provider: "github-raw";
  owner: string;
  repo: string;
  ref: string;
  subdir: string;
}

export async function readSoundSourceConfig(configPath: string): Promise<SoundSourceConfig> {
  const raw = await fs.readFile(configPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  if (!isSoundSourceConfig(parsed)) {
    throw new Error(`Invalid sound source config: ${configPath}`);
  }
  return parsed;
}

function isSoundSourceConfig(value: unknown): value is SoundSourceConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const config = value as Partial<SoundSourceConfig>;
  return (
    typeof config.version === "number" &&
    config.provider === "github-raw" &&
    typeof config.owner === "string" &&
    config.owner.length > 0 &&
    typeof config.repo === "string" &&
    config.repo.length > 0 &&
    typeof config.ref === "string" &&
    config.ref.length > 0 &&
    typeof config.subdir === "string" &&
    config.subdir.length > 0
  );
}

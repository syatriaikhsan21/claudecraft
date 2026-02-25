import fs from "node:fs/promises";
import path from "node:path";

type Race = "protoss" | "terran" | "zerg";
type ToolEvent = "PreToolUse" | "PostToolUse";

interface Candidate {
  sourceAbsPath: string;
  sourceRelPath: string;
  unit: string;
  baseName: string;
  score: number;
}

interface EventConfig {
  event: ToolEvent;
  destinationDir: string;
  targetCount: number;
}

const RACE_DIRS: Record<Race, string> = {
  protoss: "Protoss",
  terran: "Terran",
  zerg: "Zerg"
};

const EVENT_CONFIGS: EventConfig[] = [
  { event: "PreToolUse", destinationDir: "pretool", targetCount: 6 },
  { event: "PostToolUse", destinationDir: "posttool", targetCount: 6 }
];

const UNIT_PRIORITY: Record<Race, string[]> = {
  protoss: [
    "probe",
    "zealot",
    "dragoon",
    "darktemplar",
    "templar",
    "shuttle",
    "scout",
    "carrier"
  ],
  terran: ["scv", "marine", "goliath", "tank", "vulture", "ghost", "battle", "dropship"],
  zerg: ["drone", "zergling", "hydra", "mutalid", "overlord", "queen", "ultra", "guardian"]
};

const PRETOOL_EXCLUDED_UNITS = new Set(["probe", "scv", "drone"]);

const MIN_POOL_SIZE = 4;
const MANIFEST_REL_PATH = path.join("assets", "manifest.json");
const ALL_SOUNDS_DIR = "all-sounds";
const CURATED_DIR = "curated-sounds";

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const writeMode = process.argv.includes("--write");
  const manifestPath = path.join(repoRoot, MANIFEST_REL_PATH);
  const allSoundsRoot = path.join(repoRoot, ALL_SOUNDS_DIR);
  const curatedRoot = path.join(repoRoot, CURATED_DIR);

  const manifestRaw = await fs.readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestRaw) as {
    races: Record<Race, Record<ToolEvent, { type: "single" | "pool"; file?: string; files?: string[] }>>;
  };

  const summary: Array<{ race: Race; event: ToolEvent; files: string[] }> = [];

  for (const race of Object.keys(RACE_DIRS) as Race[]) {
    const raceSourceDir = path.join(allSoundsRoot, RACE_DIRS[race]);
    const raceFiles = await collectWaveFiles(raceSourceDir);

    for (const config of EVENT_CONFIGS) {
      const selected = selectCandidates(race, config.event, raceFiles, config.targetCount);
      if (selected.length < MIN_POOL_SIZE) {
        throw new Error(
          `Not enough candidates for ${race}.${config.event}. Expected >= ${MIN_POOL_SIZE}, got ${selected.length}.`
        );
      }

      const destinationDir = path.join(curatedRoot, race, config.destinationDir);
      if (writeMode) {
        await fs.rm(destinationDir, { recursive: true, force: true });
        await fs.mkdir(destinationDir, { recursive: true });
      }

      const filesForManifest: string[] = [];
      const usedNames = new Set<string>();

      for (const candidate of selected) {
        const destinationName = allocateDestinationName(
          `${candidate.unit}-${candidate.baseName}`,
          usedNames
        );
        const manifestRelative = path.posix.join(race, config.destinationDir, destinationName);
        filesForManifest.push(manifestRelative);

        if (writeMode) {
          await fs.copyFile(candidate.sourceAbsPath, path.join(destinationDir, destinationName));
        }
      }

      manifest.races[race][config.event] = {
        type: "pool",
        files: filesForManifest
      };

      summary.push({ race, event: config.event, files: filesForManifest });
    }
  }

  if (writeMode) {
    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  }

  process.stdout.write(
    `${writeMode ? "Applied" : "Dry run"} tool pool curation for ${summary.length} race/event pairs.\n`
  );
  for (const item of summary) {
    process.stdout.write(
      `${item.race}.${item.event}: ${item.files.length} file(s)\n- ${item.files.join("\n- ")}\n`
    );
  }
}

function scoreCandidate(race: Race, event: ToolEvent, sourceRelPath: string, baseName: string): number {
  const lowerBase = baseName.toLowerCase();
  const unit = sourceRelPath.split(path.sep)[0]?.toLowerCase() ?? "misc";
  let score = 0;

  if (event === "PreToolUse") {
    if (lowerBase.includes("rdy")) {
      score += 40;
    } else if (lowerBase.includes("pss")) {
      score += 28;
    } else if (lowerBase.includes("wht")) {
      score += 16;
    }
  } else {
    if (lowerBase.includes("yes")) {
      score += 40;
    } else if (lowerBase.includes("upd")) {
      score += 24;
    }
  }

  const unitPriority = UNIT_PRIORITY[race];
  const priorityIndex = unitPriority.indexOf(unit);
  if (priorityIndex >= 0) {
    score += 30 - priorityIndex * 2;
  }

  if (unit.includes("advisor") || unit.includes("bldg")) {
    score -= 40;
  }

  return score;
}

function selectCandidates(
  race: Race,
  event: ToolEvent,
  raceFiles: string[],
  targetCount: number
): Candidate[] {
  const eventPattern =
    event === "PreToolUse" ? /(rdy|pss|wht)/i : /(yes|upd)/i;
  const candidates: Candidate[] = raceFiles
    .map((sourceAbsPath) => {
      const raceRoot = path.join(process.cwd(), ALL_SOUNDS_DIR, RACE_DIRS[race]);
      const sourceRelPath = path.relative(raceRoot, sourceAbsPath);
      const baseName = path.basename(sourceAbsPath);
      return {
        sourceAbsPath,
        sourceRelPath,
        baseName,
        unit: sourceRelPath.split(path.sep)[0]?.toLowerCase() ?? "misc",
        score: scoreCandidate(race, event, sourceRelPath, baseName)
      };
    })
    .filter((candidate) => eventPattern.test(candidate.baseName))
    .filter((candidate) =>
      event === "PreToolUse" ? !PRETOOL_EXCLUDED_UNITS.has(candidate.unit) : true
    )
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.sourceRelPath.localeCompare(b.sourceRelPath);
    });

  const selected: Candidate[] = [];
  const selectedPathSet = new Set<string>();
  const unitCounts = new Map<string, number>();

  for (const candidate of candidates) {
    if (selected.length >= targetCount) {
      break;
    }
    if (unitCounts.has(candidate.unit)) {
      continue;
    }
    selected.push(candidate);
    selectedPathSet.add(candidate.sourceAbsPath);
    unitCounts.set(candidate.unit, 1);
  }

  for (const candidate of candidates) {
    if (selected.length >= targetCount) {
      break;
    }
    if (selectedPathSet.has(candidate.sourceAbsPath)) {
      continue;
    }
    const count = unitCounts.get(candidate.unit) ?? 0;
    if (count >= 2) {
      continue;
    }
    selected.push(candidate);
    selectedPathSet.add(candidate.sourceAbsPath);
    unitCounts.set(candidate.unit, count + 1);
  }

  return selected;
}

async function collectWaveFiles(rootDir: string): Promise<string[]> {
  const output: string[] = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".DS_Store") {
        continue;
      }
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (/\.wav$/i.test(entry.name)) {
        output.push(fullPath);
      }
    }
  }
  return output.sort((a, b) => a.localeCompare(b));
}

function allocateDestinationName(candidateName: string, usedNames: Set<string>): string {
  const extension = path.extname(candidateName);
  const namePart = path.basename(candidateName, extension);
  let index = 0;
  while (true) {
    const resolved = index === 0 ? candidateName : `${namePart}-${index}${extension}`;
    if (!usedNames.has(resolved)) {
      usedNames.add(resolved);
      return resolved;
    }
    index += 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${(error as Error).message}\n`);
  process.exitCode = 1;
});

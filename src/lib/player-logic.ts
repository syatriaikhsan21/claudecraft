import { FIXED_RACES, type FixedRace, type HookEventName, type RaceOption } from "./types.js";

export interface PlayerState {
  selectedRace?: FixedRace;
  lastPoolByKey?: Record<string, string>;
  lastFailureAt?: number;
  lastToolSoundAt?: number;
}

export function isFixedRace(value: string | undefined): value is FixedRace {
  return value === "protoss" || value === "terran" || value === "zerg";
}

export function isRaceOption(value: string | undefined): value is RaceOption {
  return value === "protoss" || value === "terran" || value === "zerg" || value === "random";
}

export function pickRandomRace(random: () => number = Math.random): FixedRace {
  const index = Math.floor(random() * FIXED_RACES.length);
  return FIXED_RACES[index];
}

export function resolveRaceForEvent(input: {
  requestedRace: RaceOption;
  event: HookEventName;
  state: PlayerState;
  random?: () => number;
}): { race: FixedRace; stateChanged: boolean } {
  if (isFixedRace(input.requestedRace)) {
    return { race: input.requestedRace, stateChanged: false };
  }

  if (input.event === "SessionStart" || !input.state.selectedRace) {
    input.state.selectedRace = pickRandomRace(input.random);
    return { race: input.state.selectedRace, stateChanged: true };
  }

  return { race: input.state.selectedRace, stateChanged: false };
}

export function pickPoolFile(
  files: string[],
  lastPlayed?: string,
  random: () => number = Math.random
): string {
  if (files.length <= 1) {
    return files[0];
  }

  const filtered = lastPlayed ? files.filter((item) => item !== lastPlayed) : files;
  const candidates = filtered.length > 0 ? filtered : files;
  const index = Math.floor(random() * candidates.length);
  return candidates[index];
}

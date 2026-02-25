import { describe, expect, test } from "bun:test";
import { pickPoolFile, resolveRaceForEvent } from "../src/lib/player-logic.js";

describe("player-logic", () => {
  test("random race is selected on SessionStart and then reused", () => {
    const state: { selectedRace?: "protoss" | "terran" | "zerg" } = {};

    const first = resolveRaceForEvent({
      requestedRace: "random",
      event: "SessionStart",
      state,
      random: () => 0.8
    });
    expect(first.race).toBe("zerg");
    expect(first.stateChanged).toBe(true);

    const second = resolveRaceForEvent({
      requestedRace: "random",
      event: "PreToolUse",
      state,
      random: () => 0.0
    });
    expect(second.race).toBe("zerg");
    expect(second.stateChanged).toBe(false);
  });

  test("fixed race ignores random state", () => {
    const state = { selectedRace: "zerg" as const };
    const result = resolveRaceForEvent({
      requestedRace: "protoss",
      event: "SessionStart",
      state
    });
    expect(result.race).toBe("protoss");
    expect(result.stateChanged).toBe(false);
    expect(state.selectedRace).toBe("zerg");
  });

  test("pool random avoids immediate duplicate when possible", () => {
    const picked = pickPoolFile(["a.wav", "b.wav", "c.wav"], "a.wav", () => 0);
    expect(picked).toBe("b.wav");
  });

  test("pool with one entry always returns that entry", () => {
    const picked = pickPoolFile(["only.wav"], "only.wav", () => 0.5);
    expect(picked).toBe("only.wav");
  });
});

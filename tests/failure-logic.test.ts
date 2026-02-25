import { describe, expect, test } from "bun:test";
import {
  isFailureInCooldown,
  isToolInCooldown,
  normalizeFailureCooldown,
  normalizeToolCooldown,
  shouldSuppressFailureByFilter
} from "../src/lib/failure-logic.js";

describe("failure-logic", () => {
  test("normalizes cooldown with default and minimum", () => {
    expect(normalizeFailureCooldown(undefined)).toBe(15);
    expect(normalizeFailureCooldown(0)).toBe(1);
    expect(normalizeFailureCooldown(5.7)).toBe(5);
    expect(normalizeToolCooldown(undefined)).toBe(2);
    expect(normalizeToolCooldown(0)).toBe(0);
    expect(normalizeToolCooldown(2.9)).toBe(2);
  });

  test("cooldown blocks failures inside cooldown window", () => {
    expect(
      isFailureInCooldown({
        lastFailureAt: 1000,
        nowMs: 14000,
        cooldownSec: 15
      })
    ).toBe(true);
    expect(
      isFailureInCooldown({
        lastFailureAt: 1000,
        nowMs: 17000,
        cooldownSec: 15
      })
    ).toBe(false);
  });

  test("tool cooldown blocks rapid consecutive tool sounds", () => {
    expect(
      isToolInCooldown({
        lastToolSoundAt: 1000,
        nowMs: 2200,
        cooldownSec: 2
      })
    ).toBe(true);
    expect(
      isToolInCooldown({
        lastToolSoundAt: 1000,
        nowMs: 3200,
        cooldownSec: 2
      })
    ).toBe(false);
    expect(
      isToolInCooldown({
        lastToolSoundAt: 1000,
        nowMs: 1300,
        cooldownSec: 0
      })
    ).toBe(false);
  });

  test("suppresses low-signal which/grep failures", () => {
    expect(
      shouldSuppressFailureByFilter({
        tool_input: { command: "which foo-binary" },
        exit_code: 1,
        stderr: "not found"
      })
    ).toBe(true);

    expect(
      shouldSuppressFailureByFilter({
        tool_input: { command: "rg TODO src" },
        exit_code: 1,
        stderr: "no matches"
      })
    ).toBe(true);
  });

  test("does not suppress generic actionable failures", () => {
    expect(
      shouldSuppressFailureByFilter({
        tool_input: { command: "npm run build" },
        exit_code: 2,
        stderr: "TypeScript compilation failed"
      })
    ).toBe(false);
  });
});

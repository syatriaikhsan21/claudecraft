export function normalizeFailureCooldown(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    return 15;
  }
  return Math.max(1, Math.floor(value));
}

export function normalizeToolCooldown(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    return 2;
  }
  return Math.max(0, Math.floor(value));
}

export function isFailureInCooldown(input: {
  lastFailureAt?: number;
  nowMs: number;
  cooldownSec: number;
}): boolean {
  if (typeof input.lastFailureAt !== "number") {
    return false;
  }
  const elapsedMs = input.nowMs - input.lastFailureAt;
  return elapsedMs < input.cooldownSec * 1000;
}

export function isToolInCooldown(input: {
  lastToolSoundAt?: number;
  nowMs: number;
  cooldownSec: number;
}): boolean {
  if (input.cooldownSec <= 0) {
    return false;
  }
  if (typeof input.lastToolSoundAt !== "number") {
    return false;
  }
  const elapsedMs = input.nowMs - input.lastToolSoundAt;
  return elapsedMs < input.cooldownSec * 1000;
}

export function shouldSuppressFailureByFilter(payload: unknown): boolean {
  const command = extractCommand(payload)?.trim().toLowerCase();
  const exitCode = extractExitCode(payload);
  const text = stringifyPayload(payload).toLowerCase();

  if (!command || exitCode !== 1) {
    return false;
  }

  if (/^(which|command\s+-v|type)\b/.test(command)) {
    return true;
  }
  if (/^(grep|rg)\b/.test(command) && /(no matches|no match|exit code 1|status 1)/.test(text)) {
    return true;
  }
  if (/^test\b/.test(command)) {
    return true;
  }

  return false;
}

function extractCommand(payload: unknown): string | undefined {
  if (!isObject(payload)) {
    return undefined;
  }
  if (typeof payload.command === "string") {
    return payload.command;
  }
  if (isObject(payload.tool_input) && typeof payload.tool_input.command === "string") {
    return payload.tool_input.command;
  }
  return undefined;
}

function extractExitCode(payload: unknown): number | undefined {
  if (!isObject(payload)) {
    return undefined;
  }
  if (typeof payload.exit_code === "number") {
    return payload.exit_code;
  }
  if (typeof payload.exitCode === "number") {
    return payload.exitCode;
  }

  const text = stringifyPayload(payload).toLowerCase();
  const match = text.match(/exit code\s+(\d+)/);
  if (!match) {
    return undefined;
  }
  const parsed = Number.parseInt(match[1], 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function stringifyPayload(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }
  try {
    return JSON.stringify(payload);
  } catch {
    return "";
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains all TypeScript sources.
  - `src/cli.ts`: entrypoint and command routing.
  - `src/commands/`: `install`, `uninstall`, `doctor`.
  - `src/lib/`: shared logic (manifest parsing, hook merge, prompts, sound download, race logic).
  - `src/player/play-sound.ts`: hook runtime player.
- `tests/` contains `bun:test` suites (`*.test.ts`).
- `assets/` holds configuration files (`manifest.json`, `sound-source.json`).
- `curated-sounds/` contains curated WAV assets used by the manifest.
- `dist/` is build output (generated).

## Build, Test, and Development Commands
- `bun install`: install dependencies.
- `bun run typecheck`: run strict TypeScript checks (`tsc --noEmit`).
- `bun run build`: compile to `dist/`.
- `bun test`: run all tests (`bun:test`).
- `node dist/cli.js`: run interactive CLI.
- `node dist/cli.js install --scope project --preset expanded --race random --yes`: non-interactive install example.

## Coding Style & Naming Conventions
- Language: TypeScript (ESM, NodeNext, strict mode).
- Indentation: 2 spaces; keep code ASCII unless file already requires otherwise.
- File names: kebab-case for modules (for example `playback-command.ts`).
- Types/interfaces: PascalCase; variables/functions: camelCase.
- Prefer small, focused functions in `src/lib/` for reusable logic.
- No lint script is configured yet; keep `bun run typecheck` clean.

## Testing Guidelines
- Framework: `bun:test`.
- Place tests under `tests/` with suffix `.test.ts`.
- Add/extend tests when touching:
  - hook merge behavior,
  - manifest schema/resolution,
  - race/random selection logic,
  - sound source resolution/downloading.
- Run `bun test` and `bun run typecheck` before submitting changes.

## Commit & Pull Request Guidelines
- Use conventional-style commit subjects seen in repo history, e.g.:
  - `feat: add race-based hooks and GitHub sound download support`
- Keep commits scoped and descriptive (`feat`, `fix`, `test`, `docs`, `refactor`).
- PRs should include:
  - summary of behavior changes,
  - testing evidence (commands + results),
  - config/asset changes (`assets/*`, `curated-sounds/*`) called out explicitly.

## Security & Configuration Tips
- Do not commit secrets or tokens.
- Sound download source is controlled by `assets/sound-source.json`; review owner/repo/ref changes carefully.
- Prefer HTTPS/raw GitHub URLs and explicit file lists from manifest-driven downloads.

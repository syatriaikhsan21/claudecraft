# claudecraft

CLI to install StarCraft sound effects into Claude Code hooks.
Interactive prompts are powered by Clack (`@clack/prompts`).

## Run with npx

```bash
npx @wyverselabs/claudecraft
```

Examples:

```bash
npx @wyverselabs/claudecraft install --scope project --preset expanded --race random
npx @wyverselabs/claudecraft doctor --scope project
```

## Local development

```bash
bun install
bun run build
node dist/cli.js install --scope project --preset expanded --race random
```

## Commands

### Install StarCraft sounds

```bash
npx @wyverselabs/claudecraft install
npx @wyverselabs/claudecraft install --scope project --preset expanded --race protoss --tool-cooldown 2 --yes
```

### Fully interactive mode

```bash
npx @wyverselabs/claudecraft
```

Interactive menu labels are outcome-focused (for example, `Install StarCraft sounds`).

### Switch race/settings (no reinstall)

```bash
npx @wyverselabs/claudecraft switch --race zerg
npx @wyverselabs/claudecraft switch --race random --tool-cooldown 2 --failure-cooldown 20
```

### Uninstall hooks

```bash
npx @wyverselabs/claudecraft uninstall
npx @wyverselabs/claudecraft uninstall --scope global --yes
```

### Doctor

```bash
npx @wyverselabs/claudecraft doctor
npx @wyverselabs/claudecraft doctor --json
```

### Run tests

```bash
bun test
```

### Rebuild tool sound pools (maintainers)

```bash
bun run curate:tool-sounds
```

## Notes

- Project scope writes `.claude/settings.local.json` in the selected project.
- Global scope writes `~/.claude/settings.json`.
- `--race` supports `protoss`, `terran`, `zerg`, `random`.
- `PostToolUseFailure` hook is installed in expanded mode (`Bash` matcher).
- Tool sounds (`PreToolUse`, `PostToolUse`) use a 2s cooldown by default (override with `--tool-cooldown`).
- Failure alerts use a 15s cooldown by default (override with `--failure-cooldown`).
- Failure noise filtering is on by default (disable with `--no-failure-filter`).
- `PreToolUse` and `PostToolUse` use race-specific sound pools for variety.
- `all-sounds/` is source/reference; active packaged sounds are copied into `curated-sounds/`.
- Sounds are auto-downloaded from GitHub on install when not present locally.
- You can override with `--sounds-dir /absolute/path/to/curated-sounds`.
- Existing non-Claudecraft hooks are preserved.
- Managed entries are tagged for safe uninstall.

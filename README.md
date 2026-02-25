# claudecraft

CLI to install StarCraft sound effects into Claude Code hooks.

## Quick start

```bash
bun install
bun run build
node dist/cli.js install --scope project --preset expanded --race random
```

## Commands

### Install hooks

```bash
node dist/cli.js install
node dist/cli.js install --scope project --preset expanded --race protoss --yes
```

### Uninstall hooks

```bash
node dist/cli.js uninstall
node dist/cli.js uninstall --scope global --yes
```

### Doctor

```bash
node dist/cli.js doctor
node dist/cli.js doctor --json
```

### Run tests

```bash
bun test
```

## Notes

- Project scope writes `.claude/settings.local.json` in the selected project.
- Global scope writes `~/.claude/settings.json`.
- `--race` supports `protoss`, `terran`, `zerg`, `random`.
- Sounds are auto-downloaded from GitHub on install when not present locally.
- You can override with `--sounds-dir /absolute/path/to/curated-sounds`.
- Existing non-Claudecraft hooks are preserved.
- Managed entries are tagged for safe uninstall.

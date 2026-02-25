# claudecraft

CLI to install StarCraft sound effects into Claude Code hooks.
Interactive prompts are powered by Inquirer (`@inquirer/prompts`).

## Run with npx

```bash
npx @w00ing/claudecraft
```

Examples:

```bash
npx @w00ing/claudecraft install --scope project --preset expanded --race random
npx @w00ing/claudecraft doctor --scope project
```

## Local development

```bash
bun install
bun run build
node dist/cli.js install --scope project --preset expanded --race random
```

## Commands

### Install hooks

```bash
npx @w00ing/claudecraft install
npx @w00ing/claudecraft install --scope project --preset expanded --race protoss --yes
```

### Fully interactive mode

```bash
npx @w00ing/claudecraft
```

### Uninstall hooks

```bash
npx @w00ing/claudecraft uninstall
npx @w00ing/claudecraft uninstall --scope global --yes
```

### Doctor

```bash
npx @w00ing/claudecraft doctor
npx @w00ing/claudecraft doctor --json
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

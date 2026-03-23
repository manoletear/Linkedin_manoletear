# Claude Code IDE Integrations

> Sources:
> - VS Code: https://code.claude.com/docs/en/vs-code
> - JetBrains: https://code.claude.com/docs/en/jetbrains

Claude Code integrates directly into your IDE for a native graphical experience.

## Visual Studio Code

### Installation

**Requirements:** VS Code 1.98.0 or higher

```
1. Press Cmd+Shift+X (Mac) or Ctrl+Shift+X (Windows/Linux) to open Extensions
2. Search for "Claude Code"
3. Click Install
```

Or install directly:
- **VS Code:** https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code
- **Cursor:** Search for Claude Code in Cursor Extensions

### Getting Started

1. **Open the Claude Code panel** — Click the Spark icon in the Editor Toolbar (top-right)
2. **Send a prompt** — Ask Claude to help with code, debugging, or making changes
3. **Review changes** — Side-by-side comparison with accept/reject options

### Permission Modes

| Mode | Behavior |
|------|---------|
| `default` | Claude asks permission before each action |
| `plan` | Claude describes what it will do, waits for approval |
| `acceptEdits` | Claude makes edits without asking |
| `bypassPermissions` | Bypass permission prompts (use with caution) |

### Key Features

- **@-mentions** — Reference files and folders (`@auth.ts`, `@src/components/`)
- **Conversation history** — Resume past conversations from the dropdown
- **Remote sessions** — Resume claude.ai/code sessions locally
- **Multiple conversations** — Open separate tabs or windows (Cmd+Shift+Esc)
- **Checkpoints** — Hover over any message to rewind code/conversation
- **Chrome integration** — `@browser` to test web apps from VS Code

### VS Code Keyboard Shortcuts

| Command | Shortcut | Description |
|---------|----------|-------------|
| Focus Input | `Cmd+Esc` / `Ctrl+Esc` | Toggle focus between editor and Claude |
| Open in New Tab | `Cmd+Shift+Esc` / `Ctrl+Shift+Esc` | New conversation as editor tab |
| New Conversation | `Cmd+N` / `Ctrl+N` | Start new conversation (Claude focused) |
| Insert @-Mention | `Option+K` / `Alt+K` | Insert file/line reference |

### Extension Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `selectedModel` | default | Model for new conversations |
| `useTerminal` | false | Launch in terminal mode instead of graphical panel |
| `initialPermissionMode` | default | Approval prompts: default, plan, acceptEdits, bypassPermissions |
| `preferredLocation` | panel | Where Claude opens: sidebar or panel |
| `autosave` | true | Auto-save files before Claude reads or writes them |

### Add JSON Schema for Settings Autocomplete
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json"
}
```

### Run CLI in VS Code
```bash
# Open integrated terminal (Ctrl+` or Cmd+`)
claude

# Connect external terminal to VS Code
/ide

# Continue extension conversation in CLI
claude --resume
```

### Use Third-Party Providers in VS Code

1. Enable **Disable Login Prompt** in VS Code settings
2. Configure your provider (`~/.claude/settings.json`):

```bash
# Amazon Bedrock
export CLAUDE_CODE_USE_BEDROCK=1

# Google Vertex AI
export CLAUDE_CODE_USE_VERTEX=1

# Microsoft Foundry
export CLAUDE_CODE_USE_FOUNDRY=1
```

### CLI vs Extension Feature Comparison

| Feature | CLI | VS Code Extension |
|---------|-----|------------------|
| Commands and skills | All | Subset (type `/` to see) |
| MCP server config | Yes | Partial |
| Checkpoints | Yes | Yes |
| `!` bash shortcut | Yes | No |
| Tab completion | Yes | No |

## JetBrains IDEs

### Installation

```
1. Open Settings → Plugins
2. Search for "Claude Code"
3. Install and restart the IDE
```

Supported IDEs: IntelliJ IDEA, PyCharm, WebStorm, GoLand, CLion, Rider, PhpStorm, RubyMine, DataGrip, and others.

### Features in JetBrains

- Native graphical interface integrated into the IDE
- Review and edit Claude's plans before accepting
- @-mention files and code selections
- Conversation history and session management
- Shared settings with CLI (`~/.claude/settings.json`)

### Use Third-Party Providers in JetBrains

Configure your provider in `~/.claude/settings.json` (same as VS Code).

## Related Documentation

- [How Claude Code Works](./how-it-works.md)
- [Common Workflows](./common-workflows.md)
- [Settings](./settings.md)
- [Remote Control](./remote-control.md)
- [GitHub Actions](./github-actions.md)

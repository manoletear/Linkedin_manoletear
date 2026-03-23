# Claude Code Settings

> Source: https://code.claude.com/docs/en/settings

Configure Claude Code using `/config` (opens interactive settings) or by editing JSON settings files.

## Configuration Scopes

| Scope | Location | Who it affects | Shared with team? |
|-------|----------|----------------|-------------------|
| Managed | System-level or MDM | All users on machine | Yes (deployed by IT) |
| User | `~/.claude/` | You, across all projects | No |
| Project | `.claude/settings.json` | All collaborators on this repo | Yes (committed to git) |
| Local | `.claude/settings.local.json` | You, in this repository only | No (gitignored) |

**Precedence order (highest to lowest):**
1. Managed settings
2. Command line arguments
3. Local settings
4. Project settings
5. User settings

## Settings Files

- **User**: `~/.claude/settings.json`
- **Project**: `.claude/settings.json` (committed to git)
- **Local**: `.claude/settings.local.json` (gitignored)
- **Managed**: `/Library/Application Support/ClaudeCode/managed-settings.json` (macOS) or `/etc/claude-code/managed-settings.json` (Linux)

## Example settings.json

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test *)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  },
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1"
  }
}
```

Add `$schema` for JSON autocomplete and validation in VS Code and other editors.

## Key Settings

| Key | Description | Example |
|-----|-------------|---------|
| `model` | Override default model | `"claude-sonnet-4-6"` |
| `effortLevel` | Persist effort level (`low`/`medium`/`high`) | `"medium"` |
| `env` | Environment variables for all sessions | `{"FOO": "bar"}` |
| `permissions` | Allow/deny permission rules | See below |
| `hooks` | Lifecycle event commands | See hooks docs |
| `autoMemoryDirectory` | Custom auto memory storage path | `"~/my-memory-dir"` |
| `cleanupPeriodDays` | Days to keep inactive sessions (default: 30) | `20` |
| `language` | Claude's preferred response language | `"japanese"` |
| `alwaysThinkingEnabled` | Enable extended thinking by default | `true` |
| `disableAllHooks` | Disable all hooks | `true` |
| `forceLoginMethod` | Restrict login to `claudeai` or `console` | `"claudeai"` |
| `attribution.commit` | Custom git commit attribution | `""` (empty to hide) |
| `attribution.pr` | Custom PR attribution | `""` (empty to hide) |
| `companyAnnouncements` | Startup messages for users | `["Welcome..."]` |
| `spinnerVerbs` | Customize spinner action verbs | `{"mode": "append", "verbs": ["Pondering"]}` |
| `prefersReducedMotion` | Reduce UI animations | `true` |

## Permission Settings

```json
{
  "permissions": {
    "allow": ["Bash(git *)", "Read(./src/**)"],
    "ask": ["Bash(git push *)"],
    "deny": ["Bash(curl *)", "Read(./.env)", "Read(./secrets/**)"],
    "defaultMode": "plan",
    "additionalDirectories": ["../docs/"]
  }
}
```

**Permission rule syntax:**

| Rule | Effect |
|------|--------|
| `Bash` | Matches all Bash commands |
| `Bash(npm run *)` | Matches commands starting with `npm run` |
| `Read(./.env)` | Matches reading the `.env` file |
| `WebFetch(domain:example.com)` | Matches fetch requests to example.com |

Rules are evaluated: deny first, then ask, then allow. First match wins.

## Protecting Sensitive Files

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./config/credentials.json)"
    ]
  }
}
```

## Sandbox Settings

```json
{
  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "excludedCommands": ["docker"],
    "filesystem": {
      "allowWrite": ["/tmp/build", "~/.kube"],
      "denyRead": ["~/.aws/credentials"]
    },
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org"],
      "allowLocalBinding": true
    }
  }
}
```

## Subagent Configuration

Custom AI subagents are stored as Markdown files with YAML frontmatter:

```
~/.claude/agents/          # User-level (all projects)
.claude/agents/            # Project-level (team-shared)
```

**Example subagent file (`.claude/agents/code-reviewer.md`):**
```markdown
---
name: code-reviewer
description: Reviews code for security and quality
tools: [Read, Bash]
---

You are an expert code reviewer. Focus on security vulnerabilities,
performance issues, and code quality. Be concise and actionable.
```

## Plugin Configuration

```json
{
  "enabledPlugins": {
    "formatter@acme-tools": true,
    "deployer@acme-tools": true
  },
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": {
        "source": "github",
        "repo": "acme-corp/claude-plugins"
      }
    }
  }
}
```

## Worktree Settings

```json
{
  "worktree": {
    "symlinkDirectories": ["node_modules", ".cache"],
    "sparsePaths": ["packages/my-app", "shared/utils"]
  }
}
```

## Attribution Settings

```json
{
  "attribution": {
    "commit": "Generated with AI\n\nCo-Authored-By: AI <ai@example.com>",
    "pr": ""
  }
}
```

Set to empty strings to hide attribution entirely.

## Verify Active Settings

Run `/status` inside Claude Code to see which settings sources are active and where they come from.

## Environment Variables

Any env var can also be configured in `settings.json` under the `env` key:

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "CLAUDE_CODE_EFFORT_LEVEL": "medium",
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_CODE_DISABLE_AUTO_MEMORY": "0"
  }
}
```

## Related Documentation

- [Overview](overview.md)
- [Memory and CLAUDE.md](memory.md)
- [Common Workflows](common-workflows.md)
- [CLI Reference](cli-reference.md)

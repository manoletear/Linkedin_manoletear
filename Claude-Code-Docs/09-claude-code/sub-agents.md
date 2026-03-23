# Claude Code Sub-Agents

> Source: https://code.claude.com/docs/en/sub-agents

Subagents are specialized AI assistants that handle specific types of tasks. Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions.

**Key benefits:**
- Preserve context by keeping exploration/implementation out of your main conversation
- Enforce constraints by limiting which tools a subagent can use
- Reuse configurations across projects with user-level subagents
- Specialize behavior with focused system prompts
- Control costs by routing tasks to faster, cheaper models like Haiku

## Built-in Subagents

| Subagent | Model | Purpose |
|----------|-------|---------|
| **Explore** | Haiku (fast) | Read-only searching and analyzing codebases |
| **Plan** | Inherits | Research agent during plan mode |
| **General-purpose** | Inherits | Complex multi-step tasks requiring both exploration and action |
| **Bash** | Inherits | Running terminal commands in a separate context |
| **Claude Code Guide** | Haiku | When you ask questions about Claude Code features |

## Quickstart: Create Your First Subagent

1. Run `/agents` in Claude Code
2. Select **Create new agent**
3. Choose scope: **Personal** (~/.claude/agents/) or **Project** (.claude/agents/)
4. Select **Generate with Claude** and describe the subagent
5. Select tools (deselect everything except Read-only for reviewers)
6. Select model, color, and optional memory
7. Save and try: `Use the code-improver agent to suggest improvements in this project`

## Subagent File Format

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---
You are a code reviewer. When invoked, analyze the code and provide specific,
actionable feedback on quality, security, and best practices.
```

## Scope and Location

| Location | Scope | Priority |
|----------|-------|----------|
| `--agents` CLI flag | Current session | 1 (highest) |
| `.claude/agents/` | Current project | 2 |
| `~/.claude/agents/` | All your projects | 3 |
| Plugin `agents/` directory | Where plugin is enabled | 4 (lowest) |

## Supported Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier using lowercase letters and hyphens |
| `description` | Yes | When Claude should delegate to this subagent |
| `tools` | No | Tools the subagent can use (inherits all if omitted) |
| `disallowedTools` | No | Tools to deny |
| `model` | No | `sonnet`, `opus`, `haiku`, full model ID, or `inherit` (default) |
| `permissionMode` | No | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `maxTurns` | No | Maximum number of agentic turns |
| `skills` | No | Skills to preload into subagent context at startup |
| `mcpServers` | No | MCP servers available to this subagent |
| `hooks` | No | Lifecycle hooks scoped to this subagent |
| `memory` | No | Persistent memory scope: `user`, `project`, or `local` |
| `background` | No | Set to `true` to always run as background task |
| `isolation` | No | Set to `worktree` for isolated git worktree |

## Tool Control

```markdown
---
name: safe-researcher
description: Research agent with restricted capabilities
tools: Read, Grep, Glob, Bash
disallowedTools: Write, Edit
---
```

## Scoping MCP Servers to a Subagent

```markdown
---
name: browser-tester
description: Tests features in a real browser using Playwright
mcpServers:
  - playwright:
      type: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
  - github  # reuses already-configured server
---
```

## Persistent Memory

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: user
---
You are a code reviewer. As you review code, update your agent memory
with patterns, conventions, and recurring issues you discover.
```

| Scope | Location | Use when |
|-------|----------|----------|
| `user` | `~/.claude/agent-memory/<name>/` | knowledge applies across all projects |
| `project` | `.claude/agent-memory/<name>/` | project-specific, shareable via git |
| `local` | `.claude/agent-memory-local/<name>/` | project-specific, NOT checked into git |

## Invoke Subagents Explicitly

```bash
# Natural language
Use the test-runner subagent to fix failing tests

# @-mention (guarantees the subagent runs)
@"code-reviewer (agent)" look at the auth changes

# Run whole session as subagent
claude --agent code-reviewer

# Set default in project settings
# .claude/settings.json
{ "agent": "code-reviewer" }
```

## Run in Foreground or Background

- **Foreground** — blocks main conversation until complete; permission prompts pass through
- **Background** — runs concurrently; permissions are pre-approved; press `Ctrl+B` to background a running task

To disable all background tasks:
```bash
CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1
```

## Common Patterns

### Isolate High-Volume Operations
```
Use a subagent to run the test suite and report only the failing tests with their error messages
```

### Run Parallel Research
```
Research the authentication, database, and API modules in parallel using separate subagents
```

### Chain Subagents
```
Use the code-reviewer subagent to find performance issues, then use the optimizer subagent to fix them
```

## Example Subagents

### Code Reviewer
```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code for quality,
  security, and maintainability. Use immediately after writing or modifying code.
tools: Read, Grep, Glob, Bash
model: inherit
---
You are a senior code reviewer ensuring high standards of code quality and security.
When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Begin review immediately

Review checklist:
- Code is clear and readable
- No duplicated code
- Proper error handling
- No exposed secrets or API keys
- Input validation implemented
- Good test coverage
```

### Debugger
```markdown
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior.
tools: Read, Edit, Bash, Grep, Glob
---
You are an expert debugger specializing in root cause analysis.
When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify solution works
```

### CLI-Defined Subagents (Temporary)
```bash
claude --agents '{ "code-reviewer": {
  "description": "Expert code reviewer. Use proactively after code changes.",
  "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
  "tools": ["Read", "Grep", "Glob", "Bash"],
  "model": "sonnet"
} }'
```

## Related Documentation

- [How Claude Code Works](./how-it-works.md)
- [Best Practices](./best-practices.md)
- [Common Workflows](./common-workflows.md)
- [Settings](./settings.md)

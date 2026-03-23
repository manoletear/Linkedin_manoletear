# Claude Code Changelog

> Source: https://code.claude.com/docs/en/changelog

This is a summary of the Claude Code changelog. For the full changelog with all versions, see the official docs.

## Recent Version Highlights

### v2.1.79 (Latest)
- Latest stable release of Claude Code

### v2.1.63
- The `Task` tool was renamed to `Agent` (existing `Task(...)` references still work as aliases)

### v2.1.51
- Remote Control feature introduced (minimum version required for Remote Control)

### v2.1.50
- New session management features

### Key Recent Features (Cumulative)

**Subagents and Agent Teams:**
- Custom subagents with YAML frontmatter configuration
- Built-in subagents: Explore, Plan, General-purpose, Bash
- Agent teams for coordinating multiple Claude sessions
- Session memory and cross-session persistence
- `claude --agent` flag to run session as a specific subagent
- `claude agents` CLI command to list configured subagents

**Remote Control:**
- Connect claude.ai or Claude mobile app to local Claude Code sessions
- `claude remote-control` server mode
- `claude --remote-control` for interactive sessions with remote capability
- `/remote-control` command from existing sessions
- `--spawn worktree` for isolated git worktrees per remote session

**Settings and Configuration:**
- Four configuration scopes: Managed, User, Project, Local
- `settings.json` schema validation support
- Plugin system for distributing skills, hooks, subagents, and MCP servers

**Memory and Context:**
- Auto memory (`MEMORY.md`) with automatic pruning
- `@path/to/import` syntax in CLAUDE.md for importing other files
- CLAUDE.md files at multiple levels (home, project, parent, child directories)
- `/compact` with focus instructions
- `/btw` for ephemeral questions that do not enter conversation history
- `/context` to see context window usage

**IDE Integrations:**
- VS Code extension v1.0 with graphical chat panel
- JetBrains plugin support
- Cursor IDE support
- `@browser` integration with Claude in Chrome extension

**GitHub Actions:**
- `anthropics/claude-code-action@v1` (GA release)
- `@claude` mention triggers in PRs and issues
- Support for AWS Bedrock and Google Vertex AI in GitHub Actions
- OIDC authentication for secure CI/CD

**CLI Improvements:**
- `claude --continue` and `claude --resume` for session management
- `claude --fork-session` to branch conversations
- `--spawn worktree` for parallel worktree sessions
- `claude -p` for non-interactive (headless) mode
- `--output-format json` and `--output-format stream-json` for programmatic use
- `/rename` for session names
- `/rewind` and checkpointing with Esc+Esc
- `/doctor` for diagnosing installation issues
- `/agents` for interactive subagent management
- `/hooks` to browse configured hooks
- `/plugin` for marketplace plugin browsing
- `/statusline` to configure status bar
- `/mobile` to show QR code for Claude mobile app download

**Skills System:**
- SKILL.md files in `.claude/skills/`
- YAML frontmatter with `name`, `description`, `disable-model-invocation`
- `$ARGUMENTS` variable for parameterized skills
- `context: fork` for skill execution in a specific agent context

**Hooks System:**
- `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStart`, `SubagentStop` events
- Hook matchers for specific tools
- Exit code 2 to block tool execution

**MCP Improvements:**
- Per-subagent MCP server configuration
- Inline MCP server definitions in subagent frontmatter
- `/mcp` management dialog in VS Code

## Full Changelog

See the complete version history at: https://code.claude.com/docs/en/changelog

The changelog covers all versions from v2.1.79 back to initial release.

## Related Documentation

- [Overview](./overview.md)
- [CLI Reference](./cli-reference.md)
- [Settings](./settings.md)
- [How Claude Code Works](./how-it-works.md)

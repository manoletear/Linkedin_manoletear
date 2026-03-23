# CLI Reference

> Source: https://code.claude.com/docs/en/cli-reference

Complete reference for Claude Code CLI commands and flags.

## CLI Commands

| Command | Description | Example |
|---------|-------------|---------|
| `claude` | Start interactive session | `claude` |
| `claude "query"` | Start session with initial prompt | `claude "explain this project"` |
| `claude -p "query"` | Query via SDK, then exit | `claude -p "explain this function"` |
| `cat file \| claude -p "query"` | Process piped content | `cat logs.txt \| claude -p "explain"` |
| `claude -c` | Continue most recent conversation | `claude -c` |
| `claude -c -p "query"` | Continue via SDK | `claude -c -p "Check for type errors"` |
| `claude -r "<session>" "query"` | Resume session by ID or name | `claude -r "auth-refactor" "Finish this PR"` |
| `claude update` | Update to latest version | `claude update` |
| `claude auth login` | Sign in to Anthropic account | `claude auth login --console` |
| `claude auth logout` | Log out | `claude auth logout` |
| `claude auth status` | Show auth status as JSON | `claude auth status` |
| `claude agents` | List configured subagents | `claude agents` |
| `claude mcp` | Configure MCP servers | See MCP documentation |
| `claude remote-control` | Start Remote Control server | `claude remote-control --name "My Project"` |

## CLI Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--add-dir` | Add additional working directories | `claude --add-dir ../apps ../lib` |
| `--agent` | Specify an agent for the session | `claude --agent my-custom-agent` |
| `--allowedTools` | Tools that execute without permission prompts | `claude --allowedTools "Bash(git log *)" "Read"` |
| `--append-system-prompt` | Append text to default system prompt | `claude --append-system-prompt "Always use TypeScript"` |
| `--append-system-prompt-file` | Append system prompt from file | `claude --append-system-prompt-file ./extra-rules.txt` |
| `--betas` | Beta headers for API requests (API key users) | `claude --betas interleaved-thinking` |
| `--chrome` | Enable Chrome browser integration | `claude --chrome` |
| `--continue, -c` | Load most recent conversation | `claude --continue` |
| `--dangerously-skip-permissions` | Skip permission prompts | `claude --dangerously-skip-permissions` |
| `--debug` | Enable debug mode | `claude --debug "api,mcp"` |
| `--disable-slash-commands` | Disable all skills and commands | `claude --disable-slash-commands` |
| `--disallowedTools` | Remove tools from model context | `claude --disallowedTools "Bash(git log *)"` |
| `--effort` | Set effort level (low/medium/high/max) | `claude --effort high` |
| `--fallback-model` | Fallback model if overloaded | `claude -p --fallback-model sonnet "query"` |
| `--fork-session` | Create new session ID on resume | `claude --resume abc123 --fork-session` |
| `--from-pr` | Resume sessions linked to GitHub PR | `claude --from-pr 123` |
| `--ide` | Connect to IDE on startup | `claude --ide` |
| `--init` | Run init hooks and start interactive mode | `claude --init` |
| `--init-only` | Run init hooks and exit | `claude --init-only` |
| `--json-schema` | Get validated JSON output | `claude -p --json-schema '{...}' "query"` |
| `--max-budget-usd` | Max spend on API calls | `claude -p --max-budget-usd 5.00 "query"` |
| `--max-turns` | Limit agentic turns | `claude -p --max-turns 3 "query"` |
| `--mcp-config` | Load MCP servers from JSON | `claude --mcp-config ./mcp.json` |
| `--model` | Set model for session | `claude --model claude-sonnet-4-6` |
| `--name, -n` | Set display name for session | `claude -n "my-feature-work"` |
| `--output-format` | Output format (text/json/stream-json) | `claude -p "query" --output-format json` |
| `--permission-mode` | Begin in specified permission mode | `claude --permission-mode plan` |
| `--print, -p` | Print response without interactive mode | `claude -p "query"` |
| `--remote` | Create new web session on claude.ai | `claude --remote "Fix the login bug"` |
| `--remote-control, --rc` | Start session with Remote Control | `claude --remote-control "My Project"` |
| `--resume, -r` | Resume specific session | `claude --resume auth-refactor` |
| `--session-id` | Use specific session ID (UUID) | `claude --session-id "550e8400-..."` |
| `--system-prompt` | Replace entire system prompt | `claude --system-prompt "You are a Python expert"` |
| `--system-prompt-file` | Load system prompt from file | `claude --system-prompt-file ./custom-prompt.txt` |
| `--teleport` | Resume web session in local terminal | `claude --teleport` |
| `--tools` | Restrict built-in tools | `claude --tools "Bash,Edit,Read"` |
| `--verbose` | Enable verbose logging | `claude --verbose` |
| `--version, -v` | Output version number | `claude -v` |
| `--worktree, -w` | Start in isolated git worktree | `claude -w feature-auth` |

## System Prompt Flags

| Flag | Behavior |
|------|----------|
| `--system-prompt` | Replaces the entire default prompt |
| `--system-prompt-file` | Replaces with file contents |
| `--append-system-prompt` | Appends to the default prompt |
| `--append-system-prompt-file` | Appends file contents to the default prompt |

**Notes:**
- `--system-prompt` and `--system-prompt-file` are mutually exclusive
- Append flags can be combined with either replacement flag
- For most use cases, use an append flag to preserve Claude Code's built-in capabilities

## Common Usage Patterns

### Run a one-off task
```bash
claude -p "review the code in src/auth.ts for security issues"
```

### Process piped content
```bash
tail -200 app.log | claude -p "summarize any errors"
git diff | claude -p "write a commit message for these changes"
cat error.log | claude -p "what went wrong?"
```

### Automation with JSON output
```bash
claude -p --output-format json "list all TODO comments in the codebase"

# Structured output with schema validation
claude -p --json-schema '{
  "type": "object",
  "properties": {
    "summary": {"type": "string"},
    "issues": {"type": "array", "items": {"type": "string"}}
  }
}' "review this PR for issues"
```

### Resume and continue sessions
```bash
# Continue most recent
claude -c

# Resume named session
claude -r "auth-refactor"

# Resume by PR
claude --from-pr 123
```

### Set effort level
```bash
# Low effort for quick tasks
claude --effort low "fix the typo in README.md"

# High effort for complex problems
claude --effort high "refactor the entire authentication system"
```

### Limit budget and turns
```bash
# Max $5 spend
claude -p --max-budget-usd 5.00 "implement the feature"

# Max 10 turns
claude -p --max-turns 10 "fix all the test failures"
```

### Custom model
```bash
# Use a specific model
claude --model claude-opus-4-6

# Use alias
claude --model sonnet  # Latest Sonnet
claude --model opus    # Latest Opus
```

## In-Session Commands

| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/clear` | Clear conversation history |
| `/login` | Switch accounts |
| `/resume` | Resume a previous conversation |
| `/memory` | Browse and manage CLAUDE.md and auto memory |
| `/rename` | Rename current session |
| `/compact` | Compact conversation context |
| `/init` | Generate/update CLAUDE.md |
| `?` | Show keyboard shortcuts |
| `exit` or `Ctrl+C` | Exit Claude Code |

## Related Documentation

- [Overview](overview.md)
- [Quickstart](quickstart.md)
- [Settings](settings.md)
- [Common Workflows](common-workflows.md)

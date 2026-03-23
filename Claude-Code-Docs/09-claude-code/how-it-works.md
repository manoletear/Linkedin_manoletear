# How Claude Code Works

> Source: https://code.claude.com/docs/en/how-claude-code-works

Claude Code is an agentic assistant that runs in your terminal. It can help with coding, writing docs, running builds, searching files, researching topics, and more.

## The Agentic Loop

When you give Claude a task, it works through three phases:
1. **Gather context** — read files, search codebase, understand structure
2. **Take action** — edit files, run commands, call tools
3. **Verify results** — run tests, check output, course-correct

These phases blend together. Claude decides what each step requires based on what it learned from the previous step, chaining dozens of actions together.

The agentic loop is powered by two components: **models** that reason and **tools** that act.

## Models

Claude Code uses Claude models to understand code and reason about tasks:
- **Sonnet** — handles most coding tasks well
- **Opus** — stronger reasoning for complex architectural decisions

Switch models with `/model` during a session or start with `claude --model <name>`.

## Tools

Tools are what make Claude Code agentic. The built-in tools fall into five categories:

| Category | What Claude can do |
|----------|-------------------|
| File operations | Read files, edit code, create new files, rename and reorganize |
| Search | Find files by pattern, search content with regex, explore codebases |
| Execution | Run shell commands, start servers, run tests, use git |
| Web | Search the web, fetch documentation, look up error messages |
| Code intelligence | See type errors and warnings after edits, jump to definitions (requires plugins) |

Claude also has tools for spawning subagents, asking questions, and other orchestration tasks.

## What Claude Can Access

When you run `claude` in a directory, Claude Code gains access to:
- **Your project** — Files in your directory and subdirectories
- **Your terminal** — Any command you could run: build tools, git, package managers, scripts
- **Your git state** — Current branch, uncommitted changes, recent commit history
- **Your CLAUDE.md** — Project-specific instructions, conventions, and context
- **Auto memory** — Learnings Claude saves automatically (first 200 lines of MEMORY.md loaded at session start)
- **Extensions you configure** — MCP servers, skills, subagents, Claude in Chrome

## Execution Environments

| Environment | Where code runs | Use case |
|-------------|-----------------|----------|
| Local | Your machine | Default. Full access to files, tools, and environment |
| Cloud | Anthropic-managed VMs | Offload tasks, work on repos without local checkout |
| Remote Control | Your machine, controlled from browser | Use web UI while keeping everything local |

## Interfaces

You can access Claude Code through:
- Terminal
- Desktop app
- IDE extensions (VS Code, JetBrains)
- claude.ai/code
- Remote Control
- Slack
- CI/CD pipelines

## Sessions

Claude Code saves your conversation locally. Each message, tool use, and result is stored, enabling rewinding, resuming, and forking sessions.

**Resume or fork sessions:**
```bash
# Resume last session
claude --continue

# Resume specific session
claude --resume

# Fork a session (branch off without affecting original)
claude --continue --fork-session
```

## Context Window Management

Claude's context window holds conversation history, file contents, command outputs, CLAUDE.md, loaded skills, and system instructions.

- Claude compacts automatically when context fills up
- Put persistent rules in **CLAUDE.md** rather than relying on conversation history
- Run `/context` to see what is using space
- Use `/compact focus on <topic>` to control what is preserved

**Context costs by feature:**
- Skills load on demand (descriptions visible, content loads when used)
- Subagents get their own fresh context — their work does not bloat your context
- MCP servers add tool definitions to every request

## Safety: Checkpoints and Permissions

### Undo Changes with Checkpoints
Before Claude edits any file, it snapshots the current contents. Press Esc twice to rewind to a previous state, or ask Claude to undo.

### Permission Modes (Shift+Tab to cycle)
- **Default** — Claude asks before file edits and shell commands
- **Auto-accept edits** — Claude edits files without asking, still asks for commands
- **Plan mode** — Claude uses read-only tools only, creates a plan you can approve

Allow specific commands in `.claude/settings.json`:
```json
{
  "allowedCommands": ["npm test", "git status", "npm run build"]
}
```

## Tips for Working Effectively

1. **Ask Claude for help** — `how do I set up hooks?` or `what is the best way to structure CLAUDE.md?`
2. **Iterate conversationally** — Start with what you want, then refine through dialogue
3. **Interrupt and steer** — You can interrupt Claude at any point; it will adjust its approach
4. **Be specific upfront** — Reference specific files, mention constraints, point to example patterns
5. **Give something to verify against** — Include test cases, paste screenshots, define expected output
6. **Explore before implementing** — Use plan mode to analyze the codebase before coding
7. **Delegate, do not dictate** — Give context and direction, then trust Claude to figure out details

## Related Documentation

- [Common Workflows](./common-workflows.md)
- [CLI Reference](./cli-reference.md)
- [Memory](./memory.md)
- [Settings](./settings.md)
- [Sub-Agents](./sub-agents.md)

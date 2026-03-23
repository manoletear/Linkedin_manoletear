# Claude Code Overview

> Source: https://code.claude.com/docs/en/overview

Claude Code is an AI-powered coding assistant that helps you build features, fix bugs, and automate development tasks. It understands your entire codebase and can work across multiple files and tools to get things done.

## Installation

### macOS, Linux, WSL
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### Windows PowerShell
```powershell
irm https://claude.ai/install.ps1 | iex
```

### Homebrew
```bash
brew install --cask claude-code
```

### WinGet
```bash
winget install Anthropic.ClaudeCode
```

Then start Claude Code in any project:
```bash
cd your-project
claude
```

## Requirements

- Claude subscription (Pro, Max, Teams, or Enterprise), OR
- Anthropic Console account, OR
- Supported cloud provider (Amazon Bedrock, Google Vertex AI, Microsoft Foundry)

## What You Can Do

### Automate Tedious Tasks
```bash
claude "write tests for the auth module, run them, and fix any failures"
```
- Write tests for untested code
- Fix lint errors across a project
- Resolve merge conflicts
- Update dependencies
- Write release notes

### Build Features and Fix Bugs
Describe what you want in plain language. Claude Code plans the approach, writes code across multiple files, and verifies it works.

### Create Commits and Pull Requests
```bash
claude "commit my changes with a descriptive message"
```
Claude Code works directly with git — stages changes, writes commit messages, creates branches, opens pull requests.

### Connect Tools with MCP
The Model Context Protocol (MCP) connects Claude Code to external data sources: Google Drive, Jira, Slack, custom tooling.

### Customize with Instructions, Skills, and Hooks
- **CLAUDE.md**: markdown file Claude reads at session start — coding standards, architecture, workflows
- **Auto memory**: Claude saves learnings like build commands and debugging insights automatically
- **Custom commands**: package repeatable workflows like `/review-pr` or `/deploy-staging`
- **Hooks**: run shell commands before/after Claude Code actions

### Run Agent Teams
Spawn multiple Claude Code agents that work on different parts of a task simultaneously.

### CLI Automation
```bash
# Analyze recent logs
tail -200 app.log | claude -p 'Slack me if you see any anomalies'

# Automate translations in CI
claude -p 'translate new strings into French and raise a PR for review'

# Bulk operations
git diff main --name-only | claude -p 'review these changed files for security issues'
```

## Available Interfaces

| Interface | Description |
|-----------|-------------|
| **Terminal CLI** | Full-featured CLI for working directly in your terminal |
| **VS Code** | Inline diffs, @-mentions, plan review, conversation history |
| **Desktop App** | Standalone app for visual diffs, multiple sessions, recurring tasks |
| **Web** | No local setup; kick off long-running tasks from any browser |
| **JetBrains** | Plugin for IntelliJ, PyCharm, WebStorm, etc. |
| **Slack** | Route bug reports from Slack, get PRs back |
| **GitHub Actions / GitLab CI** | Automated code review and issue triage in CI/CD |

## Cross-Surface Features

Each surface connects to the same Claude Code engine — CLAUDE.md files, settings, and MCP servers work across all of them.

- **Remote Control**: Continue a local session from your phone or another device
- **Web/iOS**: Start a task locally, continue on mobile
- **Teleport**: `/teleport` to move a terminal session to the Desktop app
- **Agent SDK**: Build custom agents for your own workflows

## Related Documentation

- [Quickstart](quickstart.md)
- [How Claude Code Works](how-it-works.md)
- [Memory and CLAUDE.md](memory.md)
- [Common Workflows](common-workflows.md)
- [CLI Reference](cli-reference.md)
- [Settings](settings.md)

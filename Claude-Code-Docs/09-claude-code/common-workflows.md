# Common Workflows

> Source: https://code.claude.com/docs/en/common-workflows

Practical workflows for everyday development with Claude Code.

## Understand New Codebases

### Get a Quick Overview
```bash
cd /path/to/project
claude

# Ask for overview
give me an overview of this codebase
explain the main architecture patterns used here
what are the key data models?
how is authentication handled?
```

### Find Relevant Code
```bash
# Find files for a feature
find the files that handle user authentication

# Understand interactions
how do these authentication files work together?

# Trace execution
trace the login process from front-end to database
```

## Fix Bugs

```bash
# Share the error
I'm seeing an error when I run npm test

# Get fix recommendations
suggest a few ways to fix the @ts-ignore in user.ts

# Apply the fix
update user.ts to add the null check you suggested
```

**Tips:**
- Tell Claude the command to reproduce the issue and get a stack trace
- Mention steps to reproduce the error
- Let Claude know if the error is intermittent or consistent

## Refactor Code

```bash
# Identify legacy code
find deprecated API usage in our codebase

# Get recommendations
suggest how to refactor utils.js to use modern JavaScript features

# Apply changes safely
refactor utils.js to use ES2024 features while maintaining the same behavior

# Verify the refactoring
run tests for the refactored code
```

## Use Plan Mode for Safe Code Analysis

Plan Mode instructs Claude to analyze with read-only operations before making any changes.

```bash
# Start a new session in Plan Mode
claude --permission-mode plan

# Ask for complex analysis
I need to refactor our authentication system to use OAuth2. Create a detailed migration plan.

# Run headless in Plan Mode
claude --permission-mode plan -p "Analyze the authentication system and suggest improvements"
```

**Toggle during session:**
- `Shift+Tab` cycles through permission modes
- `⏵⏵ accept edits on` = Auto-Accept mode
- `⏸ plan mode on` = Plan Mode

**Set Plan Mode as default:**
```json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

## Work with Tests

```bash
# Find untested code
find functions in NotificationsService.swift that are not covered by tests

# Generate test scaffolding
add tests for the notification service

# Add edge cases
add test cases for edge conditions in the notification service

# Run and verify
run the new tests and fix any failures
```

## Create Pull Requests

```bash
# Summarize changes
summarize the changes I've made to the authentication module

# Create the PR
create a pr

# Enhance description
enhance the PR description with more context about the security improvements
```

When you create a PR using `gh pr create`, the session is automatically linked. Resume with `claude --from-pr <number>`.

## Handle Documentation

```bash
# Find undocumented code
find functions without proper JSDoc comments in the auth module

# Generate documentation
add JSDoc comments to the undocumented functions in auth.js

# Improve generated docs
improve the generated documentation with more context and examples

# Verify standards
check if the documentation follows our project standards
```

## Work with Images

Add images by:
- Drag and drop into the Claude Code window
- Copy an image and paste with `Ctrl+V`
- Provide a file path: `Analyze this image: /path/to/image.png`

```bash
# Analyze UI screenshots
Describe the UI elements in this screenshot

# Debug from screenshots
Here's a screenshot of the error. What's causing it?

# Generate code from designs
Generate CSS to match this design mockup
What HTML structure would recreate this component?

# Database schema analysis
This is our current database schema. How should we modify it for the new feature?
```

## Reference Files and Directories with @

Use `@` to include files or directories in context:

```bash
# Reference a single file
Explain the logic in @src/utils/auth.js

# Reference a directory
What's the structure of @src/components?

# Reference MCP resources
Show me the data from @github:repos/owner/repo/issues

# Reference multiple files
Compare @file1.js and @file2.js for consistency
```

## Extended Thinking

Extended thinking is enabled by default. Control it with:

| Scope | How | Effect |
|-------|-----|--------|
| Effort level | `/effort` or `CLAUDE_CODE_EFFORT_LEVEL` | Control thinking depth |
| `ultrathink` keyword | Include in prompt | Sets effort to high for that turn |
| Toggle | `Option+T` (macOS) / `Alt+T` (Windows/Linux) | Toggle thinking on/off |
| Global default | `/config` | Toggle across all projects |
| Token budget | `MAX_THINKING_TOKENS=10000` | Limit thinking tokens |

**Note:** `think`, `think hard`, and `think more` are regular instructions and don't allocate thinking tokens.

## Parallel Sessions with Git Worktrees

```bash
# Start Claude in a new worktree
claude --worktree feature-auth

# Start another session in a separate worktree
claude --worktree bugfix-123

# Auto-generate name
claude --worktree

# Manual worktree management
git worktree add ../project-feature-a -b feature-a
cd ../project-feature-a && claude
```

Worktrees are created at `<repo>/.claude/worktrees/<name>`. Add `.claude/worktrees/` to `.gitignore`.

## Resume Previous Conversations

```bash
# Continue most recent conversation
claude --continue
claude -c

# Resume by name
claude --resume auth-refactor

# Resume by PR
claude --from-pr 123

# Browse and pick a session
claude --resume
```

**Name sessions for easier retrieval:**
```bash
# At startup
claude -n auth-refactor

# During session
/rename auth-refactor
```

## Get Notifications

Set up desktop notifications when Claude needs your attention:

**macOS:**
```json
{
  "hooks": {
    "Notification": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
      }]
    }]
  }
}
```

**Linux:**
```json
{
  "hooks": {
    "Notification": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "notify-send 'Claude Code' 'Claude Code needs your attention'"
      }]
    }]
  }
}
```

**Notification matchers:**
- `permission_prompt` — Claude needs to approve a tool use
- `idle_prompt` — Claude is done waiting for your next prompt
- `auth_success` — Authentication completed
- `elicitation_dialog` — Claude is asking you a question

## Use as Unix Utility

```bash
# Add to package.json as a linter
claude -p 'you are a linter. look at changes vs. main and report issues. report filename:line on first line, description on second line.'

# Pipe in build errors
cat build-error.txt | claude -p 'concisely explain the root cause of this build error' > output.txt

# CI/CD integration
cat code.py | claude -p 'analyze this code for bugs' --output-format json > analysis.json

# Real-time streaming output
cat log.txt | claude -p 'parse this log file for errors' --output-format stream-json
```

**Output formats:**
- `text` — Plain text response (default)
- `json` — JSON array of messages with metadata
- `stream-json` — Streaming JSON objects in real-time

## Use Specialized Subagents

```bash
# View available subagents
/agents

# Claude auto-delegates
review my recent code changes for security issues
run all tests and fix any failures

# Explicitly request a subagent
use the code-reviewer subagent to check the auth module
have the debugger subagent investigate why users can't log in

# Create a custom subagent
/agents
# Select 'Create New subagent'
```

## Related Documentation

- [Overview](overview.md)
- [Quickstart](quickstart.md)
- [CLI Reference](cli-reference.md)
- [Memory and CLAUDE.md](memory.md)
- [Settings](settings.md)

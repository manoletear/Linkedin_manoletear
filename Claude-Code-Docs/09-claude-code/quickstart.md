# Claude Code Quickstart

> Source: https://code.claude.com/docs/en/quickstart

This guide will have you using AI-powered coding assistance in a few minutes.

## Step 1: Install Claude Code

### macOS, Linux, WSL (Recommended)
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### Windows PowerShell
```powershell
irm https://claude.ai/install.ps1 | iex
```

### Windows CMD
```cmd
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

### Homebrew
```bash
brew install --cask claude-code
# Update periodically: brew upgrade claude-code
```

### WinGet
```bash
winget install Anthropic.ClaudeCode
# Update periodically: winget upgrade Anthropic.ClaudeCode
```

**Note:** Native installs auto-update. Homebrew and WinGet require manual updates.

## Step 2: Log In

```bash
claude
# You'll be prompted to log in on first use

# Or use /login command:
/login
```

**Account types:**
- Claude Pro, Max, Teams, or Enterprise (recommended)
- Claude Console (API access with pre-paid credits)
- Amazon Bedrock, Google Vertex AI, or Microsoft Foundry (enterprise cloud)

Once logged in, credentials are stored. Use `/login` to switch accounts.

## Step 3: Start Your First Session

```bash
cd /path/to/your/project
claude
```

You'll see the Claude Code welcome screen with session info, recent conversations, and latest updates.

- Type `/help` for available commands
- Type `/resume` to continue a previous conversation

## Step 4: Ask About Your Codebase

```bash
# Understand the project
what does this project do?
what technologies does this project use?
where is the main entry point?
explain the folder structure

# Ask about capabilities
what can Claude Code do?
how do I create custom skills in Claude Code?
can Claude Code work with Docker?
```

Claude Code reads your project files as needed — no manual context required.

## Step 5: Make Your First Code Change

```bash
add a hello world function to the main file
```

Claude Code will:
1. Find the appropriate file
2. Show you the proposed changes
3. Ask for your approval
4. Make the edit

Claude Code always asks permission before modifying files. Enable 'Accept all' mode for a session to auto-approve.

## Step 6: Use Git with Claude Code

```bash
# Check changes
what files have I changed?

# Create commits
commit my changes with a descriptive message

# Branch operations
create a new branch called feature/quickstart
show me the last 5 commits
help me resolve merge conflicts
```

## Step 7: Fix a Bug or Add a Feature

```bash
# Add a feature
add input validation to the user registration form

# Fix a bug
there's a bug where users can submit empty forms - fix it
```

Claude Code will locate the relevant code, understand the context, implement a solution, and run tests if available.

## Step 8: Common Workflows

```bash
# Refactor code
refactor the authentication module to use async/await instead of callbacks

# Write tests
write unit tests for the calculator functions

# Update documentation
update the README with installation instructions

# Code review
review my changes and suggest improvements
```

## Essential Commands

| Command | What It Does | Example |
|---------|-------------|---------|
| `claude` | Start interactive mode | `claude` |
| `claude "task"` | Run a one-time task | `claude "fix the build error"` |
| `claude -p "query"` | Run and exit | `claude -p "explain this function"` |
| `claude -c` | Continue most recent conversation | `claude -c` |
| `claude -r` | Resume a previous conversation | `claude -r` |
| `claude commit` | Create a Git commit | `claude commit` |
| `/clear` | Clear conversation history | `/clear` |
| `/help` | Show available commands | `/help` |
| `exit` or `Ctrl+C` | Exit Claude Code | `exit` |

## Pro Tips

**Be specific with your requests:**
- Instead of: `fix the bug`
- Try: `fix the login bug where users see a blank screen after entering wrong credentials`

**Use step-by-step instructions:**
```
1. create a new database table for user profiles
2. create an API endpoint to get and update user profiles
3. build a webpage that allows users to see and edit their information
```

**Let Claude explore first:**
```bash
analyze the database schema
build a dashboard showing products most frequently returned by UK customers
```

**Keyboard shortcuts:**
- `?` — See all keyboard shortcuts
- `Tab` — Command completion
- `↑` — Command history
- `/` — See all commands and skills

## Related Documentation

- [Overview](overview.md)
- [How Claude Code Works](how-it-works.md)
- [Memory and CLAUDE.md](memory.md)
- [Common Workflows](common-workflows.md)
- [CLI Reference](cli-reference.md)

# Claude Code Best Practices

> Source: https://code.claude.com/docs/en/best-practices

Claude Code is an agentic coding environment. Unlike a chatbot, Claude Code can read your files, run commands, make changes, and autonomously work through problems.

## Core Constraint: Context Window

Most best practices are based on one constraint: **Claude's context window fills up fast, and performance degrades as it fills.**

The context window holds your entire conversation, every file Claude reads, and every command output. A single debugging session might generate tens of thousands of tokens.

Track context usage with `/context` and see Reduce token usage for strategies.

## 1. Give Claude a Way to Verify Its Work

This is the single highest-leverage thing you can do. Claude performs dramatically better when it can verify its own work.

| Strategy | Before | After |
|----------|--------|-------|
| Provide verification criteria | "implement a function that validates email addresses" | "write a validateEmail function. example test cases: user@example.com is true, invalid is false, user@.com is false. run the tests after implementing" |
| Verify UI changes visually | "make the dashboard look better" | "[paste screenshot] implement this design. take a screenshot of the result and compare it to the original" |
| Address root causes | "the build is failing" | "the build fails with this error: [paste error]. fix it and verify the build succeeds. address the root cause, do not suppress the error" |

## 2. Explore First, Then Plan, Then Code

Use Plan Mode to separate exploration from execution:

1. **Explore** — Enter Plan Mode. Claude reads files and answers questions without making changes.
2. **Plan** — Ask Claude to create a detailed implementation plan. Press `Ctrl+G` to open the plan in your editor.
3. **Implement** — Switch back to Normal Mode and let Claude code, verifying against its plan.
4. **Commit** — Ask Claude to commit with a descriptive message and create a PR.

> Skip planning for small tasks where the scope is clear (typo fix, adding a log line, renaming a variable).

## 3. Provide Specific Context in Prompts

| Strategy | Before | After |
|----------|--------|-------|
| Scope the task | "add tests for foo.py" | "write a test for foo.py covering the edge case where the user is logged out. avoid mocks." |
| Point to sources | "why does ExecutionFactory have a weird api?" | "look through ExecutionFactory's git history and summarize how its api came to be" |
| Reference existing patterns | "add a calendar widget" | "look at HotDogWidget.php as a good example of the pattern. follow it to implement a new calendar widget" |
| Describe the symptom | "fix the login bug" | "users report that login fails after session timeout. check the auth flow in src/auth/, especially token refresh. write a failing test that reproduces the issue, then fix it" |

## 4. Provide Rich Content

- **Reference files with @** — Instead of describing where code lives. Claude reads the file before responding.
- **Paste images directly** — Copy/paste or drag and drop screenshots into the prompt.
- **Give URLs** — For documentation and API references.
- **Pipe in data** — Run `cat error.log | claude` to send file contents directly.
- **Let Claude fetch** — Tell Claude to pull context using Bash commands, MCP tools, or by reading files.

## 5. Configure Your Environment

### Write an Effective CLAUDE.md

Run `/init` to generate a starter CLAUDE.md, then refine over time.

```markdown
# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible

# Workflow
- Typecheck when done making a series of code changes
- Prefer running single tests, not the whole test suite
```

**Include:**
- Bash commands Claude cannot guess
- Code style rules that differ from defaults
- Testing instructions and preferred test runner
- Repository etiquette (branch naming, PR conventions)
- Architectural decisions specific to your project
- Developer environment quirks (required env vars)

**Exclude:**
- Anything Claude can figure out by reading code
- Standard language conventions Claude already knows
- Detailed API documentation (link to docs instead)
- Information that changes frequently
- Long explanations or tutorials
- Self-evident practices like "write clean code"

> Keep CLAUDE.md short. If Claude keeps doing something wrong despite a rule, the file is probably too long.

### Configure Permissions

Use `/permissions` to allowlist safe commands, or `/sandbox` for OS-level isolation.

```json
{
  "allowedTools": ["npm run lint", "git commit", "npm test"]
}
```

### Use CLI Tools

Tell Claude to use CLI tools like `gh`, `aws`, `gcloud`, `sentry-cli` when interacting with external services. They are the most context-efficient way.

### Connect MCP Servers

```bash
claude mcp add
```

Connect external tools like Notion, Figma, or your database.

### Set Up Hooks

Hooks run scripts automatically at specific points in Claude's workflow. Unlike CLAUDE.md instructions (advisory), hooks are deterministic.

```bash
# Ask Claude to write a hook
"Write a hook that runs eslint after every file edit"
"Write a hook that blocks writes to the migrations folder"
```

### Create Skills

```markdown
<!-- .claude/skills/api-conventions/SKILL.md -->
---
name: api-conventions
description: REST API design conventions for our services
---
# API Conventions
- Use kebab-case for URL paths
- Use camelCase for JSON properties
```

### Create Custom Subagents

```markdown
<!-- .claude/agents/security-reviewer.md -->
---
name: security-reviewer
description: Reviews code for security vulnerabilities
tools: Read, Grep, Glob, Bash
model: opus
---
You are a senior security engineer. Review code for injection vulnerabilities,
authentication flaws, secrets in code, and insecure data handling.
```

## 6. Communicate Effectively

### Ask Codebase Questions
Use Claude Code like a senior engineer when onboarding:
- "How does logging work?"
- "How do I make a new API endpoint?"
- "What edge cases does CustomerOnboardingFlowImpl handle?"

### Let Claude Interview You
For larger features, start minimal and ask Claude to interview you:
```
I want to build [brief description]. Interview me in detail using the AskUserQuestion tool.
Ask about technical implementation, UI/UX, edge cases, concerns, and tradeoffs.
Keep interviewing until we've covered everything, then write a complete spec to SPEC.md.
```

## 7. Manage Your Session

- **`Esc`** — Stop Claude mid-action, preserving context
- **`Esc + Esc` or `/rewind`** — Open rewind menu, restore previous state
- **`/clear`** — Reset context between unrelated tasks
- **`/compact`** — Compact conversation with control
- **`/btw`** — Quick questions that never enter conversation history

> If you've corrected Claude more than twice on the same issue, run `/clear` and start fresh with a more specific prompt.

## 8. Automate and Scale

### Non-Interactive Mode
```bash
# One-off queries
claude -p "Explain what this project does"

# Structured output for scripts
claude -p "List all API endpoints" --output-format json

# Streaming for real-time processing
claude -p "Analyze this log file" --output-format stream-json
```

### Run Multiple Claude Sessions

- **Desktop app** — Manage multiple local sessions visually
- **Claude Code on the web** — Run on Anthropic cloud in isolated VMs
- **Agent teams** — Automated coordination with shared tasks and a team lead

**Writer/Reviewer pattern:**
```
Session A: Implement a rate limiter for our API endpoints
Session B: Review the rate limiter implementation in @src/middleware/rateLimiter.ts.
           Look for edge cases, race conditions, and consistency with existing patterns.
```

### Fan Out Across Files
```bash
for file in $(cat files.txt); do
  claude -p "Migrate $file from React to Vue. Return OK or FAIL." \
    --allowedTools "Edit,Bash(git commit *)"
done
```

## Common Failure Patterns to Avoid

| Pattern | Fix |
|---------|-----|
| Kitchen sink session (mixing unrelated tasks) | `/clear` between unrelated tasks |
| Correcting the same thing repeatedly | After 2 failed corrections, `/clear` and write a better prompt |
| Over-specified CLAUDE.md (too long) | Ruthlessly prune; if Claude does it correctly without the instruction, delete it |
| Trust-then-verify gap | Always provide verification (tests, scripts, screenshots) |
| Infinite exploration | Scope investigations narrowly or use subagents |

## Related Documentation

- [How Claude Code Works](./how-it-works.md)
- [Common Workflows](./common-workflows.md)
- [Memory](./memory.md)
- [Settings](./settings.md)
- [Sub-Agents](./sub-agents.md)

# Skills, Agents & Commands Library

> **Complete Claude Code extensibility kit: 149 agents, 81 skill sets (228 files), and 22 slash commands.**
>
> Ready to install on any machine with Claude Code.

---

## Quick Install

```bash
# Clone this repo
git clone https://github.com/manoletear/Claude_docs.git

# Copy to your Claude Code config
cp -r Claude_docs/11-skills-agents-commands/agents/*.md ~/.claude/agents/
cp -r Claude_docs/11-skills-agents-commands/skills/* ~/.claude/skills/
cp -r Claude_docs/11-skills-agents-commands/commands/*.md ~/.claude/commands/

# Done — restart Claude Code to load everything
```

Or use the install script:

```bash
cd Claude_docs/11-skills-agents-commands
chmod +x install.sh && ./install.sh
```

---

## Inventory

### Agents (149)

Specialized subagents invoked via the `Agent` tool with `subagent_type`.

| Category | Agents |
|---|---|
| **Backend/API** | api-designer, api-documenter, backend-developer, fullstack-developer, graphql-architect, microservices-architect |
| **Frontend** | angular-architect, frontend-developer, nextjs-developer, react-specialist, ui-designer, vue-expert |
| **Mobile** | flutter-expert, mobile-app-developer, mobile-developer, swift-expert |
| **Cloud/Infra** | azure-infra-engineer, cloud-architect, docker-expert, kubernetes-specialist, terraform-engineer, terragrunt-expert |
| **DevOps/SRE** | build-engineer, deployment-engineer, devops-engineer, devops-incident-responder, dx-optimizer, platform-engineer, sre-engineer |
| **Data/ML/AI** | ai-engineer, data-analyst, data-engineer, data-researcher, data-scientist, llm-architect, machine-learning-engineer, ml-engineer, mlops-engineer, nlp-engineer |
| **Security** | ad-security-reviewer, compliance-auditor, incident-responder, penetration-tester, security-auditor, security-engineer |
| **Languages** | cpp-pro, csharp-developer, elixir-expert, golang-pro, java-architect, javascript-pro, kotlin-specialist, php-pro, python-pro, rust-engineer, swift-expert, typescript-pro |
| **Frameworks** | django-developer, dotnet-core-expert, dotnet-framework-4.8-expert, electron-pro, laravel-specialist, rails-expert, spring-boot-engineer |
| **Database** | database-administrator, database-optimizer, postgres-pro, sql-pro |
| **Quality** | code-reviewer, comment-analyzer, debugger, error-coordinator, error-detective, performance-engineer, qa-expert, refactoring-specialist, silent-failure-hunter, test-automator, type-design-analyzer |
| **PowerShell** | powershell-5.1-expert, powershell-7-expert, powershell-module-architect, powershell-security-hardening, powershell-ui-architect |
| **Business** | business-analyst, competitive-analyst, content-marketer, customer-success-manager, legal-advisor, market-researcher, product-manager, project-manager, risk-manager, sales-engineer, scrum-master |
| **Research** | code-architect, code-explorer, knowledge-synthesizer, research-analyst, scientific-literature-researcher, search-specialist, trend-analyst |
| **Multi-Agent** | agent-organizer, context-manager, multi-agent-coordinator, performance-monitor, task-distributor, workflow-orchestrator |
| **Specialized** | blockchain-developer, embedded-systems, fintech-engineer, game-developer, iot-engineer, m365-admin, mcp-developer, network-engineer, payment-integration, quant-analyst, seo-specialist, slack-expert, websocket-engineer, windows-infra-admin, wordpress-master |
| **Meta** | agent-creator, agent-installer, agent-sdk-verifier-py, agent-sdk-verifier-ts, code-simplifier, conversation-analyzer, plugin-validator, pr-test-analyzer, prompt-engineer, skill-reviewer, technical-writer, ux-researcher |

### Skills (81 directories, 228 files)

Knowledge and workflow skills loaded as `~/.claude/skills/*/SKILL.md`.

| Category | Skills |
|---|---|
| **Blog Suite** | blog, blog-analyze, blog-audit, blog-brief, blog-calendar, blog-chart, blog-geo, blog-image, blog-outline, blog-repurpose, blog-rewrite, blog-schema, blog-seo-check, blog-strategy, blog-write |
| **Creative/Design** | algorithmic-art, art-master, brand-guidelines, canvas-design, design-master, frontend-design, slack-gif-creator, theme-factory, video-master, web-artifacts-builder, web-design-guidelines |
| **Documents** | doc-coauthoring, docx, internal-comms, pdf, pptx, xlsx |
| **Development Workflow** | brainstorming, dispatching-parallel-agents, executing-plans, finishing-a-development-branch, planning-with-files, receiving-code-review, requesting-code-review, subagent-driven-development, systematic-debugging, test-driven-development, using-git-worktrees, using-superpowers, verification-before-completion, writing-plans |
| **Claude Code Extension** | agent-development, claude-api, claude-code-knowledge, claude-code-remote, claude-opus-4-5-migration, command-development, hook-development, mcp-builder, mcp-integration, plugin-settings, plugin-structure, session-start-hook, skill-creator, skill-development, writing-rules, writing-skills |
| **AI/Prompt** | domain-classifier, intelligent-prompt-generator, prompt-analyzer, prompt-extractor, prompt-generator, prompt-master, prompt-xray, universal-learner |
| **Product/Business** | ai-operating-system, ai-product-studio, ai-startup-studio, product-master |
| **Knowledge** | agentic-seek, claude-blog-last30days, ecc-knowledge, last30days, openrouter-api |
| **Testing** | webapp-testing |

### Commands (22)

Slash commands available as `/command-name`.

| Command | Description |
|---|---|
| `/brainstorm` | Creative exploration before building |
| `/cancel-ralph` | Cancel active Ralph Wiggum loop |
| `/clean_gone` | Clean git branches marked as [gone] |
| `/code-review` | Code review a pull request |
| `/commit` | Create a git commit |
| `/commit-push-pr` | Commit, push, and open a PR |
| `/configure` | Enable/disable hookify rules |
| `/create-plugin` | Guided plugin creation workflow |
| `/dedupe` | Find duplicate GitHub issues |
| `/execute-plan` | Execute an implementation plan |
| `/feature-dev` | Guided feature development |
| `/help` | Explain Ralph Wiggum technique |
| `/hookify` | Create hooks from conversation analysis |
| `/list` | List configured hookify rules |
| `/new-sdk-app` | Create new Claude Agent SDK app |
| `/plan` | Start file-based planning |
| `/ralph-loop` | Start Ralph Wiggum loop |
| `/review-pr` | Comprehensive PR review |
| `/start` | Session start hook |
| `/status` | Show planning status |
| `/triage-issue` | Triage GitHub issues |
| `/write-plan` | Write implementation plan |

---

## How It Works

### Agents (`~/.claude/agents/*.md`)

Each `.md` file defines a specialized subagent with frontmatter:

```markdown
---
name: python-pro
description: Use this agent when you need to build type-safe, production-ready Python code...
tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# System prompt content here...
```

Invoked automatically via the `Agent` tool when tasks match the description.

### Skills (`~/.claude/skills/*/SKILL.md`)

Each directory contains a `SKILL.md` with frontmatter:

```markdown
---
name: openrouter-api
description: Complete reference for OpenRouter API...
origin: Tooxs
---

# Knowledge content here...
```

Loaded as context when relevant to the current task.

### Commands (`~/.claude/commands/*.md`)

Markdown files that define slash commands:

```markdown
---
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
description: Create a git commit
---

# Command instructions here...
```

Invoked by typing `/command-name` in Claude Code.

---

## Updating

To pull the latest changes:

```bash
cd Claude_docs
git pull origin main
cp -r 11-skills-agents-commands/agents/*.md ~/.claude/agents/
cp -r 11-skills-agents-commands/skills/* ~/.claude/skills/
cp -r 11-skills-agents-commands/commands/*.md ~/.claude/commands/
```

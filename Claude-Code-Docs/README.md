# 🤖 Claude API Documentation Repository

> **Comprehensive knowledge base for building with Claude — organized for developers, agents, tools, and skills.**
>
> [![Anthropic](https://img.shields.io/badge/Anthropic-Claude-orange)](https://anthropic.com)
> [![API Docs](https://img.shields.io/badge/Docs-platform.claude.com-blue)](https://platform.claude.com/docs)
> [![Last Updated](https://img.shields.io/badge/Updated-March%202026-green)](https://github.com/manoletear/Claude_docs)
>
> ---
>
> ## 📁 Repository Structure
>
> ```
> Claude_docs/
> ├── README.md                          # This file — navigation hub
> ├── 01-getting-started/
> │   ├── intro-to-claude.md             # Overview of Claude
> │   ├── quickstart.md                  # First API call guide
> │   └── api-overview.md                # API structure & auth
> ├── 02-models/
> │   ├── models-overview.md             # All models comparison table
> │   ├── choosing-a-model.md            # Selection guide
> │   ├── whats-new-claude-4-6.md        # Latest model changes
> │   ├── migration-guide.md             # Migrate to Claude 4.6
> │   ├── model-deprecations.md          # Deprecated models
> │   └── pricing.md                     # Full pricing reference
> ├── 03-build-with-claude/
> │   ├── features-overview.md           # All capabilities
> │   ├── working-with-messages.md       # Messages API patterns
> │   ├── handling-stop-reasons.md       # Stop reason handling
> │   ├── extended-thinking.md           # Thinking mode guide
> │   ├── adaptive-thinking.md           # Adaptive thinking
> │   ├── effort.md                      # Effort parameter
> │   ├── fast-mode.md                   # Fast mode (Opus 4.6)
> │   ├── structured-outputs.md          # JSON schema outputs
> │   ├── vision.md                      # Image processing
> │   ├── streaming.md                   # SSE streaming
> │   ├── prompt-caching.md              # Cache optimization
> │   ├── batch-processing.md            # Async batch API
> │   └── workspaces.md                  # Workspace management
> ├── 04-agents-and-tools/
> │   ├── tool-use-overview.md           # Tool use guide
> │   ├── web-search-tool.md             # Web search tool
> │   ├── code-execution-tool.md         # Code execution tool
> │   ├── computer-use.md                # Computer use tool
> │   ├── memory-tool.md                 # Memory tool
> │   ├── mcp-connector.md               # MCP connector
> │   └── agent-skills.md                # Agent Skills API
> ├── 05-prompt-engineering/
> │   ├── overview.md                    # Prompt engineering guide
> │   ├── best-practices.md              # Prompting best practices
> │   └── extended-thinking-tips.md      # Thinking prompt tips
> ├── 06-api-reference/
> │   ├── messages-api.md                # Messages API reference
> │   ├── rate-limits.md                 # Rate limits & tiers
> │   ├── client-sdks.md                 # SDK reference
> │   ├── error-handling.md              # Error codes
> │   └── beta-headers.md                # Beta feature headers
> ├── 07-test-and-evaluate/
> │   ├── develop-tests.md               # Testing guide
> │   ├── guardrails.md                  # Safety & guardrails
> │   └── usage-cost-api.md              # Usage monitoring
> ├── 08-release-notes/
> │   └── release-notes.md               # Complete changelog
> ├── 09-claude-code/                     # Claude Code CLI docs
> ├── 10-remotion/                        # Remotion video framework
> └── 11-skills-agents-commands/          # FULL EXTENSIBILITY KIT
>     ├── README.md                       # Install guide & inventory
>     ├── install.sh                      # One-command installer
>     ├── agents/                         # 149 specialized subagents
>     ├── skills/                         # 81 skill sets (228 files)
>     └── commands/                       # 22 slash commands
> ```
>
> ---
>
> ## 🚀 Quick Navigation
>
> ### Getting Started
> | Topic | File | Description |
> |-------|------|-------------|
> | Intro to Claude | [01-getting-started/intro-to-claude.md](01-getting-started/intro-to-claude.md) | Overview & capabilities |
> | Quickstart | [01-getting-started/quickstart.md](01-getting-started/quickstart.md) | First API call in minutes |
> | API Overview | [01-getting-started/api-overview.md](01-getting-started/api-overview.md) | REST API structure |
>
> ### Models
> | Model | API ID | Input/Output |
> |-------|--------|-------------|
> | Claude Opus 4.6 | `claude-opus-4-6` | $5 / $25 per MTok |
> | Claude Sonnet 4.6 | `claude-sonnet-4-6` | $3 / $15 per MTok |
> | Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | $1 / $5 per MTok |
>
> ### Core Features
> | Feature | File | Availability |
> |---------|------|-------------|
> | Extended Thinking | [03-build-with-claude/extended-thinking.md](03-build-with-claude/extended-thinking.md) | Opus 4.6, Sonnet 4.6 |
> | Tool Use | [04-agents-and-tools/tool-use-overview.md](04-agents-and-tools/tool-use-overview.md) | All models |
> | Web Search | [04-agents-and-tools/web-search-tool.md](04-agents-and-tools/web-search-tool.md) | All current models |
> | Code Execution | [04-agents-and-tools/code-execution-tool.md](04-agents-and-tools/code-execution-tool.md) | All current models |
> | Prompt Caching | [03-build-with-claude/prompt-caching.md](03-build-with-claude/prompt-caching.md) | All current models |
> | Streaming | [03-build-with-claude/streaming.md](03-build-with-claude/streaming.md) | All models |
> | Structured Outputs | [03-build-with-claude/structured-outputs.md](03-build-with-claude/structured-outputs.md) | GA on Claude API |
>
> ---
>
> ## 📋 What's Included
>
> This repository contains curated documentation extracted from the official Claude API Docs at https://platform.claude.com/docs, covering:
>
> - **Developer Guide** — All sections from First Steps through Administration
> - - **API Reference** — Messages API, Rate Limits, SDKs, Beta Headers
>   - - **MCP Resources** — Model Context Protocol connector guide
>     - - **Release Notes** — Full changelog from 2024 to March 2026
>       - - **Agent Tools** — Web Search, Code Execution, Computer Use, Memory, MCP
>         - - **Prompt Engineering** — Best practices and extended thinking tips
>          
>           - ---
>
> ## 🔄 Keeping This Updated
>
> This repository is structured to grow. To add new content:
>
> 1. **New tool/skill**: Add file to `04-agents-and-tools/`
> 2. 2. **New model**: Update `02-models/models-overview.md` and add migration notes
>    3. 3. **New API feature**: Add to appropriate section in `03-build-with-claude/` or `06-api-reference/`
>       4. 4. **Release notes**: Append to `08-release-notes/release-notes.md`
>         
>          5. ---
>         
>          6. ## 📚 Official Sources
>         
>          7. - **API Docs**: https://platform.claude.com/docs
> - **MCP Protocol**: https://modelcontextprotocol.io
> - - **Anthropic Console**: https://platform.claude.com
>   - - **Claude Cookbook**: https://github.com/anthropics/anthropic-cookbook
>     - - **Python SDK**: https://github.com/anthropics/anthropic-sdk-python
>       - - **TypeScript SDK**: https://github.com/anthropics/anthropic-sdk-typescript
>        
>         - ---
>
> ## 🤝 Contributing
>
> PRs welcome! Please maintain the existing folder structure and use clear markdown formatting with code examples where relevant.
>
> ---
>
> *Last updated: March 2026 | Source: platform.claude.com/docs*

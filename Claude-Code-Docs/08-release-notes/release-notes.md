# Release Notes — Claude Platform

> Source: https://platform.claude.com/docs/en/release-notes/overview

Updates to the Claude Platform, including the Claude API, client SDKs, and the Claude Console.

---

## 2026

### March 18, 2026
- **Models API enhancements** — GET /v1/models now returns `max_input_tokens`, `max_tokens`, and a `capabilities` object per model.

### March 16, 2026
- **Extended thinking display control** — New `thinking.display: "omitted"` field lets you omit thinking content for faster streaming while preserving signature for multi-turn continuity.

### March 13, 2026
- **1M token context** — Now generally available for Claude Opus 4.6 and Sonnet 4.6.

### March 2026
- **Web search dynamic filtering** — `web_search_20260209` tool version with Claude-written code for post-processing query results, reducing token consumption.
- **Code execution Bash support** — `code_execution_20250825` adds Bash commands and file operations.
- **Fast mode for Opus 4.6** — Research preview via `speed: "fast"` parameter.

### February 2026
- **Automatic prompt caching** — Top-level `cache_control` field for simplified caching in multi-turn conversations.
- **Workspace cache isolation** — Caches are now isolated per workspace (was organization-level).
- **Claude Opus 4.6** — New flagship model with 1M token context and extended thinking.
- **Claude Sonnet 4.6** — New balanced model with extended thinking capabilities.

---

## 2025

### November 2025
- **Structured outputs (beta)** — Guaranteed schema conformance via `structured-outputs-2025-11-13` beta header.
- **Computer use tool v2** — `computer_20251124` with zoom action for Claude Opus 4.5.
- **Claude Haiku 4.5** — New fast, efficient model.

### October 2025
- **Agent Skills (beta)** — `skills-2025-10-02` beta header; filesystem-based capabilities for Claude.
- **Thinking block clearing** — `clear_thinking_20251015` for automatic thinking block management.
- **Claude Sonnet 3.7 deprecated** — Announced deprecation.
- **Claude Sonnet 3.5 retired** — All requests return error.

### September 2025
- **Claude Sonnet 4.5** — New Sonnet model with improved performance.
- **Code execution tool `code_execution_20250825`** — Replaces `20250522`; adds Bash + file manipulation.

### August 2025
- **Claude Opus 4.1** — New model with extended thinking and large context.

### July 2025
- **Files API GA** — File upload/download for use with code execution.
- **Text editor tool** — `text_editor_20250728` for direct file editing.

### June 2025
- **Web fetch tool** — New server-side tool for fetching web content.

### May 2025
- **Claude Sonnet 4 and Opus 4** — New Claude 4 model family launch.
- **Computer use tool updates** — `computer_20250124` with scroll, drag, right-click actions.
- **Programmatic tool calling** — Claude writes code to call your tools.

### April 2025
- **Files API (beta)** — Upload files for use across multiple API requests.
- **MCP connector** — Connect to remote MCP servers via Messages API.

### March 2025
- **Web search tool** — `web_search_20250305` server-side tool for real-time search.
- **Extended thinking GA** — Generally available with `budget_tokens` control.
- **Batch API GA** — Message Batches API generally available.

### February 2025
- **Claude Sonnet 3.7** — New model with hybrid reasoning (extended thinking).

### January 2025
- **Extended thinking (beta)** — Preview of Claude's reasoning mode.
- **Prompt caching GA** — Generally available for all supported models.

---

## 2024

### December 2024
- **Computer use GA** — Computer use tool out of beta.
- **Context window expansion** — Claude 3.5 Sonnet extended to 200K tokens.

### October 2024
- **Computer use (beta)** — `computer_20241022` tool for desktop automation.
- **Prompt caching (beta)** — Cache large context windows.

### July 2024
- **Claude 3.5 Sonnet** — Major improvement over Claude 3 Sonnet.
- **Message Batches API (beta)** — Async processing for large workloads.

### March 2024
- **Claude 3 model family** — Haiku, Sonnet, and Opus.
- **Vision support** — Image inputs for all Claude 3 models.

---

## Model Version Reference

| Model | API ID | Status |
|-------|--------|--------|
| Claude Opus 4.6 | `claude-opus-4-6` | Current |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | Current |
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | Current |
| Claude Opus 4.5 | `claude-opus-4-5-20251101` | Current |
| Claude Sonnet 4 | `claude-sonnet-4-20250514` | Current |
| Claude Opus 4 | `claude-opus-4-20250514` | Current |
| Claude Sonnet 3.7 | `claude-3-7-sonnet-20250219` | Deprecated |
| Claude Haiku 3.5 | `claude-3-5-haiku-latest` | Deprecated |

## Related Docs

- [Models Overview](../02-models/models-overview.md)
- [Pricing](../02-models/pricing.md)
- [API Overview](../06-api-reference/messages-api.md)

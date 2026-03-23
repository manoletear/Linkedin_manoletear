# Features Overview

> Source: https://platform.claude.com/docs/en/build-with-claude/overview

Five main areas of Claude's API:
1. Model capabilities
2. Tools (server-side and client-side)
3. Tool infrastructure
4. Context management
5. Files and assets

## Model Capabilities

| Feature | Description |
|---------|-------------|
| Context windows | Up to 1M tokens (Opus 4.6, Sonnet 4.6) |
| Adaptive thinking | Dynamic thinking depth via effort param (Opus 4.6) |
| Batch processing | Async requests at 50% cost |
| Citations | Source attribution for responses |
| Data residency | US-only inference via inference_geo |
| Effort | Control token usage on Opus 4.6/4.5 |
| Extended thinking | Step-by-step reasoning |
| PDF support | Process PDF text and visuals |
| Search results | Citations for RAG applications |
| Structured outputs | Guaranteed JSON schema conformance |

## Server-Side Tools (Anthropic Executes)

| Tool | Description | Cost |
|------|-------------|------|
| Code execution | Run code in sandboxed env | Free with web search/fetch |
| Web fetch | Retrieve URL content | Free (token costs only) |
| Web search | Real-time web search | $10 per 1,000 searches |

## Client-Side Tools (You Execute)

| Tool | Description |
|------|-------------|
| Bash | Execute shell commands |
| Computer use | Control computer (Beta) |
| Memory | Store/retrieve across conversations |
| Text editor | Create and edit files |

## Tool Infrastructure

| Feature | Description |
|---------|-------------|
| Agent Skills | Modular capability extensions (PowerPoint, Excel, PDF, custom) |
| Fine-grained tool streaming | Stream tool params without buffering |
| MCP connector | Connect to remote MCP servers |
| Programmatic tool calling | Call tools from within code execution |
| Tool search | Dynamic discovery from large catalogs |

## Context Management

| Feature | Description |
|---------|-------------|
| Compaction | Server-side context summarization (Opus 4.6, Sonnet 4.6) |
| Context editing | Auto-manage context with strategies |
| Automatic prompt caching | Single cache_control field |
| Prompt caching (5m) | 5-minute cache TTL |
| Prompt caching (1hr) | 1-hour cache TTL |
| Token counting | Count tokens before sending |

## Files and Assets

| Feature | Description |
|---------|-------------|
| Files API | Upload/manage files for reuse across requests (Beta) |

## Related

- [Working with Messages](working-with-messages.md)
- [Extended Thinking](extended-thinking.md)
- [Streaming](streaming.md)
- [Prompt Caching](prompt-caching.md)
- [Tool Use Overview](../04-agents-and-tools/tool-use-overview.md)

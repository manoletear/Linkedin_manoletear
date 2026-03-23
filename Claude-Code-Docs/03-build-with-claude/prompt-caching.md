# Prompt Caching

> Source: https://platform.claude.com/docs/en/build-with-claude/prompt-caching

Prompt caching optimizes API usage by allowing resuming from specific prefixes in your prompts. This significantly reduces processing time and costs for repetitive tasks or prompts with consistent elements.

Prompt caching stores KV cache representations and cryptographic hashes — it does **not** store the raw text of prompts or responses.

## Two Ways to Enable Caching

1. **Automatic caching** — Add a single `cache_control` field at the top level. Best for multi-turn conversations.
2. **Explicit cache breakpoints** — Place `cache_control` on individual content blocks for fine-grained control.

### Quickstart: Automatic Caching

```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-opus-4-6",
    "max_tokens": 1024,
    "cache_control": {"type": "ephemeral"},
    "system": "You are an AI assistant tasked with analyzing literary works.",
    "messages": [
      {"role": "user", "content": "Analyze the major themes in Pride and Prejudice."}
    ]
  }'
```

## How Prompt Caching Works

1. System checks if prompt prefix (up to cache breakpoint) is cached from a recent query
2. If found → uses cached version (reduces cost and latency)
3. If not found → processes full prompt and caches the prefix

**Default cache lifetime:** 5 minutes (refreshed for free each time cached content is used)
**Extended cache:** 1-hour duration available at additional cost

## Pricing

| Model | Base Input | 5m Cache Write | 1h Cache Write | Cache Hits | Output |
|-------|-----------|----------------|----------------|------------|--------|
| Claude Opus 4.6 | $5/MTok | $6.25/MTok | $10/MTok | $0.50/MTok | $25/MTok |
| Claude Sonnet 4.6 | $3/MTok | $3.75/MTok | $6/MTok | $0.30/MTok | $15/MTok |
| Claude Haiku 4.5 | $1/MTok | $1.25/MTok | $2/MTok | $0.10/MTok | $5/MTok |
| Claude Haiku 3.5 | $0.80/MTok | $1/MTok | $1.6/MTok | $0.08/MTok | $4/MTok |

**Pricing multipliers:**
- 5-minute cache write: 1.25× base input price
- 1-hour cache write: 2× base input price
- Cache read: 0.1× base input price

## Supported Models

Prompt caching is supported on: Claude Opus 4.6, Opus 4.5, Opus 4.1, Opus 4, Sonnet 4.6, Sonnet 4.5, Sonnet 4, Sonnet 3.7, Haiku 4.5, Haiku 3.5, Haiku 3

## Automatic Caching

The cache breakpoint moves forward automatically as conversations grow:

| Request | Content | Cache Behavior |
|---------|---------|----------------|
| Request 1 | System + User(1) + Asst(1) + User(2) ← cache | Everything written to cache |
| Request 2 | ...+ Asst(2) + User(3) ← cache | System through User(2) read from cache |
| Request 3 | ...+ Asst(3) + User(4) ← cache | System through User(3) read from cache |

### 1-hour TTL for automatic caching:
```json
{
  "cache_control": {
    "type": "ephemeral",
    "ttl": "1h"
  }
}
```

## Explicit Cache Breakpoints

For fine-grained control, add `cache_control` directly on individual content blocks:

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "You are an AI assistant analyzing documents.",
            "cache_control": {"type": "ephemeral"}
        }
    ],
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "<the entire document text here>",
                    "cache_control": {"type": "ephemeral"}
                },
                {
                    "type": "text",
                    "text": "What are the key points?"
                }
            ]
        }
    ]
)
```

## Cache Minimum Token Thresholds

| Model | Minimum Tokens |
|-------|---------------|
| Claude Opus 4.6, Opus 4.5 | 4096 tokens |
| Claude Sonnet 4.6 | 2048 tokens |
| Claude Haiku 4.5 | 4096 tokens |
| Claude Haiku 3.5, Haiku 3 | 2048 tokens |
| Other Sonnet models | 1024 tokens |

## What Can Be Cached

- Tools (tool definitions in the `tools` array)
- System messages
- Text messages (user and assistant turns)
- Images & Documents
- Tool use and tool results

**Cannot be cached:** Thinking blocks (directly), empty text blocks, sub-content blocks like citations

## Cache Invalidation

Changes at each hierarchy level invalidate that level and all below:

| What Changed | Tools Cache | System Cache | Messages Cache |
|-------------|-------------|--------------|----------------|
| Tool definitions | ✘ | ✘ | ✘ |
| Web search toggle | ✓ | ✘ | ✘ |
| Tool choice | ✓ | ✓ | ✘ |
| Images | ✓ | ✓ | ✘ |
| Thinking parameters | ✓ | ✓ | ✘ |

## Tracking Cache Performance

Monitor using response `usage` fields:
- `cache_creation_input_tokens` — tokens written to cache
- `cache_read_input_tokens` — tokens retrieved from cache
- `input_tokens` — tokens NOT from cache (after last breakpoint)

**Total input tokens** = `cache_read_input_tokens` + `cache_creation_input_tokens` + `input_tokens`

## 1-Hour Cache Duration

```json
"cache_control": {
  "type": "ephemeral",
  "ttl": "1h"
}
```

Response includes:
```json
{
  "usage": {
    "input_tokens": 2048,
    "cache_read_input_tokens": 1800,
    "cache_creation_input_tokens": 248,
    "output_tokens": 503,
    "cache_creation": {
      "ephemeral_5m_input_tokens": 456,
      "ephemeral_1h_input_tokens": 100
    }
  }
}
```

## Best Practices

- Start with automatic caching for multi-turn conversations
- Cache stable, reusable content (system instructions, large contexts, tool definitions)
- Place cached content at the prompt's beginning
- Set up to 4 cache breakpoints for different change frequencies
- Set cache breakpoints at end of conversations AND before editable content
- For >20 content blocks, add explicit breakpoints before potentially edited content

## Cache Storage and Sharing

Starting February 5, 2026: workspace-level isolation (not organization-level). Different workspaces within the same org do NOT share caches.

## Related Docs

- [Streaming](./streaming.md)
- [Extended Thinking](./extended-thinking.md)
- [Messages API Reference](../06-api-reference/messages-api.md)

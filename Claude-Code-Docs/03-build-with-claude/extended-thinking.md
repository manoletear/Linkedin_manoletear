# Extended Thinking

> Source: https://platform.claude.com/docs/en/build-with-claude/extended-thinking

Extended thinking gives Claude step-by-step reasoning for complex tasks.

> **Opus 4.6**: Use adaptive thinking (thinking: {type: "adaptive"}) with effort parameter. Manual mode deprecated.

## Supported Models

| Model | Support |
|-------|---------|
| Opus 4.6 | Adaptive only (manual deprecated) |
| Opus 4.5, Opus 4.1, Opus 4 | Full support |
| Sonnet 4.6 | Manual + adaptive |
| Sonnet 4.5, Sonnet 4, Sonnet 3.7 | Full support |
| Haiku 4.5 | Full support |

## Enable Extended Thinking

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 16000,
    "thinking": {"type": "enabled", "budget_tokens": 10000},
    "messages": [{"role": "user", "content": "Are there infinite primes where n mod 4 == 3?"}]
  }'
```

For Opus 4.6:
```json
"thinking": {"type": "adaptive"}
```

## Response Format

```json
{
  "content": [
    {"type": "thinking", "thinking": "Let me analyze...", "signature": "WaUjzky..."},
    {"type": "text", "text": "Based on my analysis..."}
  ]
}
```

## Thinking Display Options

| display | Behavior |
|---------|---------|
| "summarized" (default) | Returns summary of thinking |
| "omitted" | Empty thinking field, faster streaming |

```json
"thinking": {"type": "enabled", "budget_tokens": 10000, "display": "omitted"}
```

## Interleaved Thinking (Between Tool Calls)

| Model | How to Enable |
|-------|-------------|
| Opus 4.6 | Automatic with adaptive thinking |
| Sonnet 4.6 | Beta header: interleaved-thinking-2025-05-14 |
| Other Claude 4 | Beta header: interleaved-thinking-2025-05-14 |

## Rules and Limitations

- Tool choice: only `auto` or `none` (not `any` or specific tool)
- Cannot toggle thinking mid-turn
- Thinking blocks must be passed back unmodified in tool use
- Not compatible with: temperature, top_k, forced tool use, prefilling
- When thinking enabled, top_p must be 0.95-1

## Budget Best Practices

- Minimum: 1,024 tokens
- Start small, increase incrementally
- For > 32k tokens: use batch processing (avoids timeouts)
- budget_tokens must be < max_tokens

## Pricing

- Billed for FULL thinking tokens (not summary)
- With display: "omitted": same billing, no visible thinking
- Thinking blocks from last turn = input tokens in next request

## Differences by Model

| Feature | Sonnet 3.7 | Claude 4 pre-Opus 4.5 | Opus 4.5+ |
|---------|-----------|----------------------|---------|
| Output | Full | Summarized | Summarized |
| Interleaved | No | Beta header | Auto (4.6) |
| Block Preservation | No | No | Yes (default) |

## Related

- [Adaptive Thinking](adaptive-thinking.md)
- [Streaming](streaming.md)
- [Prompt Caching](prompt-caching.md)

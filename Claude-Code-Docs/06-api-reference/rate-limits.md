# Rate Limits

> Source: https://platform.claude.com/docs/en/api/rate-limits

The Claude API enforces limits to prevent misuse and manage capacity. Limits apply at the organization level.

## Two Types of Limits

1. **Spend limits** — Maximum monthly cost per organization
2. **Rate limits** — Maximum requests/tokens per defined time period

## Usage Tiers & Spend Limits

| Tier | Credit Purchase Req. | Max Credit Purchase | Monthly Spend Limit |
|------|---------------------|--------------------|--------------------|
| Tier 1 | $5 | $100 | $100 |
| Tier 2 | $40 | $500 | $500 |
| Tier 3 | $200 | $1,000 | $1,000 |
| Tier 4 | $400 | $200,000 | $200,000 |
| Monthly Invoicing | N/A | N/A | No limit |

Tiers advance automatically when cumulative credit purchase thresholds are met.

## Rate Limits — Tier 1

| Model | RPM | ITPM | OTPM |
|-------|-----|------|------|
| Claude Opus 4.x* | 50 | 20,000 | 8,000 |
| Claude Sonnet 4.x** | 50 | 30,000 | 8,000 |
| Claude Haiku 4.5 | 50 | 50,000 | 10,000 |
| Claude Haiku 3.5† | 50 | 50,000 | 10,000 |

`*` Opus rate limit applies to all Opus 4.6, 4.5, 4.1, Opus 4 combined.
`**` Sonnet 4.x applies to Sonnet 4.6, 4.5, Sonnet 4 combined.
`†` Counts `cache_read_input_tokens` towards ITPM.

## Message Batches API Rate Limits (all tiers)

| Limit | Tier 1 |
|-------|--------|
| RPM | 50 |
| Batch requests in queue | 100,000 |
| Max batch requests per batch | 100,000 |

## Token Bucket Algorithm

Rate limiting uses token bucket — capacity replenishes continuously up to maximum, not at fixed intervals.

## Cache-Aware ITPM

For most models, **cached tokens do NOT count toward ITPM limits:**

| Token Type | Counts Toward ITPM? |
|-----------|---------------------|
| `input_tokens` (after last cache breakpoint) | ✅ Yes |
| `cache_creation_input_tokens` | ✅ Yes |
| `cache_read_input_tokens` | ❌ No (most models) |

**Example:** With 2,000,000 ITPM limit and 80% cache hit rate → you can process 10,000,000 total tokens/min.

## Response Headers

| Header | Description |
|--------|-------------|
| `retry-after` | Seconds to wait before retry |
| `anthropic-ratelimit-requests-limit` | Max requests in rate limit period |
| `anthropic-ratelimit-requests-remaining` | Remaining requests |
| `anthropic-ratelimit-requests-reset` | Time when limit replenishes (RFC 3339) |
| `anthropic-ratelimit-tokens-limit` | Max tokens in rate limit period |
| `anthropic-ratelimit-tokens-remaining` | Remaining tokens (rounded to nearest 1K) |
| `anthropic-ratelimit-input-tokens-limit` | Max input tokens |
| `anthropic-ratelimit-input-tokens-remaining` | Remaining input tokens |
| `anthropic-ratelimit-output-tokens-limit` | Max output tokens |
| `anthropic-ratelimit-output-tokens-remaining` | Remaining output tokens |

## Best Practices

- Use **prompt caching** to maximize effective throughput (cached tokens don't count)
- Ramp up traffic gradually to avoid acceleration limits
- Monitor rate limits on the Claude Console Usage page
- If exceeded: 429 error returned with `retry-after` header

## Workspace-Level Limits

You can set custom spend and rate limits per Workspace:

```
Organization limit: 40,000 ITPM / 8,000 OTPM
  ├── Workspace A: 30,000 ITPM
  ├── Workspace B: 10,000 ITPM
  └── (No limit on default workspace)
```

Organization-wide limits always apply, even if Workspace limits sum to more.

## Setting Limits

**Customer-set spend limits:** Settings > Limits > Change Limit in Claude Console

**Tier-enforced limit increase:** Contact Sales via the Limits page (for Tier 4+ custom limits)

## Related Docs

- [Prompt Caching](../03-build-with-claude/prompt-caching.md)
- [API Overview](./messages-api.md)
- [Client SDKs](./client-sdks.md)

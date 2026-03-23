# Pricing

> Source: https://platform.claude.com/docs/en/about-claude/pricing

All prices in USD. All models support prompt caching.

## Model Pricing

| Model | Base Input | 5m Cache Write | 1h Cache Write | Cache Read | Output |
|-------|-----------|----------------|----------------|------------|--------|
| Claude Opus 4.6 | $5/MTok | $6.25/MTok | $10/MTok | $0.50/MTok | $25/MTok |
| Claude Opus 4.5 | $5/MTok | $6.25/MTok | $10/MTok | $0.50/MTok | $25/MTok |
| Claude Opus 4.1 | $15/MTok | $18.75/MTok | $30/MTok | $1.50/MTok | $75/MTok |
| Claude Opus 4 | $15/MTok | $18.75/MTok | $30/MTok | $1.50/MTok | $75/MTok |
| Claude Sonnet 4.6 | $3/MTok | $3.75/MTok | $6/MTok | $0.30/MTok | $15/MTok |
| Claude Sonnet 4.5 | $3/MTok | $3.75/MTok | $6/MTok | $0.30/MTok | $15/MTok |
| Claude Sonnet 4 | $3/MTok | $3.75/MTok | $6/MTok | $0.30/MTok | $15/MTok |
| Claude Haiku 4.5 | $1/MTok | $1.25/MTok | $2/MTok | $0.10/MTok | $5/MTok |
| Claude Haiku 3.5 | $0.80/MTok | $1/MTok | $1.6/MTok | $0.08/MTok | $4/MTok |
| Claude Haiku 3 | $0.25/MTok | $0.30/MTok | $0.50/MTok | $0.03/MTok | $1.25/MTok |

MTok = Million tokens

## Prompt Caching Pricing Multipliers

| Cache Operation | Multiplier | Duration |
|----------------|-----------|---------|
| 5-minute cache write | 1.25x base input | 5 minutes |
| 1-hour cache write | 2x base input | 1 hour |
| Cache read (hit) | 0.1x base input | Same as write |

Cache read = 10% of standard input price → pays off after 1 cache read (5m TTL) or 2 cache reads (1h TTL).

## Batch API (50% Discount)

| Model | Batch Input | Batch Output |
|-------|------------|-------------|
| Claude Opus 4.6 | $2.50/MTok | $12.50/MTok |
| Claude Sonnet 4.6 | $1.50/MTok | $7.50/MTok |
| Claude Haiku 4.5 | $0.50/MTok | $2.50/MTok |

## Feature-Specific Pricing

### Web Search
- $10 per 1,000 searches + standard token costs
- Not charged if search returns an error

### Code Execution
- **Free** when used with web search or web fetch
- Standalone: 1,550 free hours/month; $0.05/hour additional

### Web Fetch
- No additional charge (standard token costs only)

### Fast Mode (Opus 4.6 Research Preview)
- Input: $30/MTok | Output: $150/MTok
- Not available with Batch API

## Data Residency
- US-only inference (`inference_geo: "us"`): 1.1x multiplier on all token prices
- Available on Claude Opus 4.6+ models

## Long Context Pricing

Claude Opus 4.6 and Sonnet 4.6: Full 1M token window at **standard pricing**.

For Claude Sonnet 4.5 / Sonnet 4 with beta header `context-1m-2025-08-07`:

| Tokens | Input | Output |
|--------|-------|--------|
| ≤ 200k | $3/MTok | $15/MTok |
| > 200k | $6/MTok | $22.50/MTok |

## Tool Use Token Overhead

System prompt tokens added when tools are provided:

| Model | auto/none | any/tool |
|-------|----------|---------|
| Claude Opus/Sonnet 4.x | 346 tokens | 313 tokens |
| Claude Haiku 4.5 | 346 tokens | 313 tokens |
| Claude Haiku 3.5 | 264 tokens | 340 tokens |

Additional per-tool tokens:
- Bash tool: 245 input tokens
- Text editor tool: 700 input tokens
- Computer use: 735 input tokens + 466-499 system prompt tokens

## Rate Limit Tiers

| Tier | Credit Purchase | Monthly Spend Limit |
|------|----------------|-------------------|
| Tier 1 | $5 | $100 |
| Tier 2 | $40 | $500 |
| Tier 3 | $200 | $1,000 |
| Tier 4 | $400 | $200,000 |
| Monthly Invoicing | N/A | No limit |

## Related

- [Models Overview](models-overview.md)
- [Rate Limits](../06-api-reference/rate-limits.md)
- [Prompt Caching](../03-build-with-claude/prompt-caching.md)
- [Batch Processing](../03-build-with-claude/batch-processing.md)

# Models Overview

> Source: https://platform.claude.com/docs/en/about-claude/models/overview

Claude is a family of state-of-the-art large language models developed by Anthropic.

## Latest Models Comparison

| Feature | Claude Opus 4.6 | Claude Sonnet 4.6 | Claude Haiku 4.5 |
|---------|----------------|-------------------|-----------------|
| **Description** | Most intelligent for agents/coding | Best speed+intelligence balance | Fastest near-frontier model |
| **API ID** | `claude-opus-4-6` | `claude-sonnet-4-6` | `claude-haiku-4-5-20251001` |
| **API Alias** | `claude-opus-4-6` | `claude-sonnet-4-6` | `claude-haiku-4-5` |
| **AWS Bedrock** | `anthropic.claude-opus-4-6-v1` | `anthropic.claude-sonnet-4-6` | `anthropic.claude-haiku-4-5-20251001-v1:0` |
| **GCP Vertex** | `claude-opus-4-6` | `claude-sonnet-4-6` | `claude-haiku-4-5@20251001` |
| **Input Price** | $5 / MTok | $3 / MTok | $1 / MTok |
| **Output Price** | $25 / MTok | $15 / MTok | $5 / MTok |
| **Extended Thinking** | Yes (adaptive) | Yes | Yes |
| **Adaptive Thinking** | Yes | Yes | No |
| **Context Window** | 1M tokens | 1M tokens | 200k tokens |
| **Max Output** | 128k tokens | 64k tokens | 64k tokens |
| **Knowledge Cutoff** | May 2025 | Aug 2025 | Feb 2025 |
| **Training Cutoff** | Aug 2025 | Jan 2026 | Jul 2025 |

> MTok = Million tokens. See [Pricing](pricing.md) for full details including batch discounts and caching rates.

## Model Selection Guide

**Use Claude Opus 4.6 when:**
- Building complex agentic workflows
- Tackling the hardest coding tasks
- Need maximum intelligence
- Working with extended context (1M tokens)

**Use Claude Sonnet 4.6 when:**
- Need a balance of intelligence and speed
- Running enterprise-scale agent workflows
- Cost-sensitive but still need high capability

**Use Claude Haiku 4.5 when:**
- Building real-time applications
- High-volume processing pipelines
- Cost-sensitive deployments
- Fast response time is critical

## Platform Availability

All current Claude models support:
- Text and image input
- Text output
- Multilingual capabilities
- Vision processing

Available via:
- **Claude API** (direct)
- **AWS Bedrock**
- **Google Vertex AI**

## Context Windows

| Model | Context Window | Notes |
|-------|---------------|-------|
| Claude Opus 4.6 | 1M tokens | GA at standard pricing |
| Claude Sonnet 4.6 | 1M tokens | GA at standard pricing |
| Claude Sonnet 4.5 | 1M tokens | Beta (requires header) |
| Claude Haiku 4.5 | 200k tokens | Standard |

## Model API via Models API

You can query model capabilities programmatically:

```bash
curl https://api.anthropic.com/v1/models \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

Response includes: `max_input_tokens`, `max_tokens`, and a `capabilities` object.

## Legacy Models

Older models that are deprecated or retired — see [Model Deprecations](model-deprecations.md).

## Related

- [Choosing a Model](choosing-a-model.md)
- [What's New in Claude 4.6](whats-new-claude-4-6.md)
- [Migration Guide](migration-guide.md)
- [Pricing](pricing.md)

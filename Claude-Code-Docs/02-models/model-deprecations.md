# Model Deprecations

> Source: https://platform.claude.com/docs/en/about-claude/model-deprecations

As safer and more capable models launch, Anthropic regularly retires older ones. This page lists all API deprecations with recommended replacements.

## Model Lifecycle

| Status | Description |
|--------|-------------|
| **Active** | Fully supported and recommended for use |
| **Legacy** | No longer receives updates; may be deprecated in the future |
| **Deprecated** | No longer available for new customers; existing users have until retirement date |
| **Retired** | No longer available. Requests will fail. |

Deprecated models are likely to be **less reliable** than active models. Migrate to active models for highest reliability and support.

## Current Model Status

| API Model Name | Status | Deprecated | Tentative Retirement |
|---------------|--------|------------|---------------------|
| claude-opus-4-6 | Active | N/A | Not sooner than Feb 5, 2027 |
| claude-opus-4-5-20251101 | Active | N/A | Not sooner than Nov 24, 2026 |
| claude-opus-4-1-20250805 | Active | N/A | Not sooner than Aug 5, 2026 |
| claude-opus-4-20250514 | Active | N/A | Not sooner than May 14, 2026 |
| claude-sonnet-4-6 | Active | N/A | Not sooner than Feb 17, 2027 |
| claude-sonnet-4-5-20250929 | Active | N/A | Not sooner than Sep 29, 2026 |
| claude-sonnet-4-20250514 | Active | N/A | Not sooner than May 14, 2026 |
| claude-haiku-4-5-20251001 | Active | N/A | Not sooner than Oct 15, 2026 |
| claude-3-7-sonnet-20250219 | Retired | Oct 28, 2025 | Feb 19, 2026 |
| claude-3-5-haiku-20241022 | Retired | Dec 19, 2025 | Feb 19, 2026 |
| claude-3-haiku-20240307 | Deprecated | Feb 19, 2026 | Apr 20, 2026 |

## Deprecation History

### 2026-02-19: Claude Haiku 3

| Retirement Date | Deprecated Model | Recommended Replacement |
|----------------|-----------------|------------------------|
| April 20, 2026 | claude-3-haiku-20240307 | claude-haiku-4-5-20251001 |

### 2025-12-19: Claude Haiku 3.5

This model was retired February 19, 2026.

| Retirement Date | Deprecated Model | Recommended Replacement |
|----------------|-----------------|------------------------|
| Feb 19, 2026 | claude-3-5-haiku-20241022 | claude-haiku-4-5-20251001 |

### 2025-10-28: Claude Sonnet 3.7

This model was retired February 19, 2026.

| Retirement Date | Deprecated Model | Recommended Replacement |
|----------------|-----------------|------------------------|
| Feb 19, 2026 | claude-3-7-sonnet-20250219 | claude-opus-4-6 |

### 2025-08-13: Claude Sonnet 3.5 Models

These models were retired October 28, 2025.

| Retirement Date | Deprecated Model | Recommended Replacement |
|----------------|-----------------|------------------------|
| Oct 28, 2025 | claude-3-5-sonnet-20240620 | claude-opus-4-6 |
| Oct 28, 2025 | claude-3-5-sonnet-20241022 | claude-opus-4-6 |

### 2025-06-30: Claude Opus 3

This model was retired January 5, 2026.

| Retirement Date | Deprecated Model | Recommended Replacement |
|----------------|-----------------|------------------------|
| Jan 5, 2026 | claude-3-opus-20240229 | claude-opus-4-6 |

### 2025-01-21: Claude 2, Claude 2.1, and Claude Sonnet 3

These models were retired July 21, 2025.

| Retirement Date | Deprecated Model | Recommended Replacement |
|----------------|-----------------|------------------------|
| Jul 21, 2025 | claude-2.0 | claude-opus-4-6 |
| Jul 21, 2025 | claude-2.1 | claude-opus-4-6 |
| Jul 21, 2025 | claude-3-sonnet-20240229 | claude-opus-4-6 |

### 2024-09-04: Claude 1 and Instant Models

These models were retired November 6, 2024.

| Retirement Date | Deprecated Model | Recommended Replacement |
|----------------|-----------------|------------------------|
| Nov 6, 2024 | claude-1.0 | claude-haiku-4-5-20251001 |
| Nov 6, 2024 | claude-1.1 | claude-haiku-4-5-20251001 |
| Nov 6, 2024 | claude-1.2 | claude-haiku-4-5-20251001 |
| Nov 6, 2024 | claude-1.3 | claude-haiku-4-5-20251001 |
| Nov 6, 2024 | claude-instant-1.0 | claude-haiku-4-5-20251001 |
| Nov 6, 2024 | claude-instant-1.1 | claude-haiku-4-5-20251001 |
| Nov 6, 2024 | claude-instant-1.2 | claude-haiku-4-5-20251001 |

## Migration Process

Once a model is deprecated, migrate all usage to a suitable replacement **before the retirement date**. Requests to models past the retirement date will fail.

### Auditing Model Usage

To identify deprecated model usage:

1. Go to the **Usage page** in the Anthropic Console
2. Click the **Export** button
3. Review the downloaded CSV — usage broken down by API key and model

### Best Practices

- Regularly check docs for deprecation announcements
- Test with newer models well before the retirement date of your current model
- Update code to use recommended replacement models as soon as possible
- Anthropic provides at least **60 days notice** before retirement for publicly released models

```python
# Quick code update pattern
# Before
model = 'claude-3-5-sonnet-20241022'

# After
model = 'claude-opus-4-6'  # Or claude-sonnet-4-6 for cost efficiency
```

## Related Documentation

- [Models Overview](models-overview.md)
- [Migration Guide](migration-guide.md)
- [Pricing](pricing.md)

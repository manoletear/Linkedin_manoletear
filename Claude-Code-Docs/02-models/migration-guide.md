# Migration Guide

> Source: https://platform.claude.com/docs/en/about-claude/models/migration-guide

Guide for migrating to Claude 4.6 models from previous Claude versions.

## Migrating to Claude Opus 4.6

Claude Opus 4.6 is a near drop-in replacement for Claude 4.5, with a few breaking changes.

### Update Model Name

```python
# Before
model = 'claude-opus-4-5'

# After
model = 'claude-opus-4-6'
```

### Breaking Changes

**1. Prefill removal (BREAKING)**
Prefilling assistant messages returns a `400` error on Claude 4.6 models.

```python
# This will fail with a 400 error:
client.messages.create(
    model='claude-opus-4-6',
    messages=[
        {'role': 'user', 'content': 'List the top 5 items'},
        {'role': 'assistant', 'content': '1.'}  # Prefill - NOT supported
    ]
)

# Alternatives:
# 1. Use structured outputs
# 2. Add instructions to system prompt
# 3. Use output_config.format
```

**2. Tool parameter JSON escaping**
Claude 4.6 models may produce slightly different JSON string escaping. Always use standard JSON parsers:

```python
import json
# Always parse tool arguments with json.loads(), never manual string parsing
tool_args = json.loads(tool_use_block.input)
```

### Recommended Changes

**Migrate to adaptive thinking:**

```python
# Before (deprecated on 4.6)
response = client.beta.messages.create(
    model='claude-opus-4-5',
    max_tokens=16000,
    thinking={'type': 'enabled', 'budget_tokens': 32000},
    betas=['interleaved-thinking-2025-05-14'],
    messages=[...]
)

# After (on Opus 4.6)
response = client.messages.create(
    model='claude-opus-4-6',
    max_tokens=16000,
    thinking={'type': 'adaptive'},
    output_config={'effort': 'high'},  # low, medium, high, or max
    messages=[...]
)
```

Note: Migration also moves from `client.beta.messages.create` to `client.messages.create`. Adaptive thinking is GA and requires no beta header.

**Remove deprecated beta headers:**
- Remove `betas=['effort-2025-11-24']` (effort is now GA)
- Remove `betas=['fine-grained-tool-streaming-2025-05-14']` (now GA)
- Remove `betas=['interleaved-thinking-2025-05-14']` on Opus 4.6 (auto-enabled with adaptive thinking)

**Migrate to output_config.format:**

```python
# Before (deprecated)
client.messages.create(
    output_format={'type': 'json'},
    ...
)

# After
client.messages.create(
    output_config={'format': {'type': 'json'}},
    ...
)
```

### Opus 4.6 Migration Checklist

- [ ] Update model ID to `claude-opus-4-6`
- [ ] BREAKING: Remove assistant message prefills
- [ ] Recommended: Migrate from `budget_tokens` to `thinking: {type: 'adaptive'}` with `effort`
- [ ] Verify tool call JSON parsing uses standard JSON parser
- [ ] Remove `effort-2025-11-24` beta header
- [ ] Remove `fine-grained-tool-streaming-2025-05-14` beta header
- [ ] Remove `interleaved-thinking-2025-05-14` beta header
- [ ] Migrate `output_format` to `output_config.format`
- [ ] Review and update prompts (Claude 4.6 is more proactive; tune anti-laziness prompting)
- [ ] Test in development before production

---

## Migrating to Claude Sonnet 4.6

Claude Sonnet 4.6 combines strong intelligence with fast performance, featuring improved agentic search and free code execution when used with web search/web fetch.

### Update Model Name

```python
# From Sonnet 4.5
model = 'claude-sonnet-4-5'   # Before
model = 'claude-sonnet-4-6'   # After

# From Sonnet 4
model = 'claude-sonnet-4-20250514'  # Before
model = 'claude-sonnet-4-6'          # After
```

### Breaking Changes (from Sonnet 4.5)

- Prefilling assistant messages returns 400 error (same as Opus 4.6)
- JSON string escaping in tool parameters may differ

### Recommended Configuration

Sonnet 4.6 defaults to `effort: high`. Adjust for your use case:

```bash
# Low effort - fast, cost-efficient
curl https://api.anthropic.com/v1/messages \
  --header 'x-api-key: $ANTHROPIC_API_KEY' \
  --header 'anthropic-version: 2023-06-01' \
  --header 'content-type: application/json' \
  --data '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 8192,
    "output_config": {"effort": "low"},
    "messages": [{"role": "user", "content": "Your prompt here"}]
  }'

# Medium effort - coding/agentic use cases
# High effort - default (best quality)
```

### Extended Thinking on Sonnet 4.6

```bash
# With extended thinking (coding/agentic)
curl https://api.anthropic.com/v1/messages \
  --header 'x-api-key: $ANTHROPIC_API_KEY' \
  --header 'anthropic-version: 2023-06-01' \
  --header 'anthropic-beta: interleaved-thinking-2025-05-14' \
  --header 'content-type: application/json' \
  --data '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 16384,
    "thinking": {"type": "enabled", "budget_tokens": 16384},
    "output_config": {"effort": "medium"},
    "messages": [{"role": "user", "content": "Your prompt here"}]
  }'

# Adaptive thinking (for agentic/computer use workloads)
curl https://api.anthropic.com/v1/messages \
  --header 'x-api-key: $ANTHROPIC_API_KEY' \
  --header 'anthropic-version: 2023-06-01' \
  --header 'content-type: application/json' \
  --data '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 64000,
    "thinking": {"type": "adaptive"},
    "output_config": {"effort": "medium"},
    "messages": [{"role": "user", "content": "Your prompt here"}]
  }'
```

### Sonnet 4.6 Migration Checklist

- [ ] Update model ID to `claude-sonnet-4-6`
- [ ] BREAKING: Remove assistant message prefilling
- [ ] BREAKING: Verify tool parameter JSON parsing
- [ ] Set `effort` explicitly (default is `high`; use `low` for latency-sensitive apps)
- [ ] Remove `fine-grained-tool-streaming-2025-05-14` beta header
- [ ] Migrate `output_format` to `output_config.format`
- [ ] Test in development before production

---

## Migrating from Claude 4.1 or Earlier

If migrating from Opus 4.1, Sonnet 4, or earlier models directly to Claude 4.6, apply the Claude 4.6 breaking changes above plus these additional changes.

### Update Sampling Parameters

```python
# Before - This will error in Claude 4+ models
response = client.messages.create(
    model='claude-3-7-sonnet-20250219',
    temperature=0.7,
    top_p=0.9,  # Cannot use BOTH temperature and top_p
    ...
)

# After - Use temperature OR top_p, not both
response = client.messages.create(
    model='claude-opus-4-6',
    temperature=0.7,  # Only one
    ...
)
```

### Update Tool Versions

```python
# Before (old versions)
tools = [{'type': 'text_editor_20250124', 'name': 'str_replace_editor'}]

# After (latest versions)
tools = [{'type': 'text_editor_20250728', 'name': 'str_replace_based_edit_tool'}]
# Also update: code_execution_20250825
# Remove: undo_edit command usage
```

### Handle New Stop Reasons

```python
response = client.messages.create(model='claude-opus-4-6', ...)

if response.stop_reason == 'refusal':
    # Handle refusal (new in Claude 4.x)
    print('Request was refused')

if response.stop_reason == 'model_context_window_exceeded':
    # Handle context window limit (new in Claude 4.5+)
    print('Context window exceeded')
```

### Remove Legacy Beta Headers

```python
# Remove these - they have no effect in Claude 4+:
# betas=['token-efficient-tools-2025-02-19']
# betas=['output-128k-2025-02-19']
```

---

## Migrating to Claude Haiku 4.5

Claude Haiku 4.5 is the fastest and most intelligent Haiku model.

### Update Model Name

```python
# From Haiku 3.5
model = 'claude-3-5-haiku-20241022'  # Before
model = 'claude-haiku-4-5-20251001'  # After

# From Haiku 3
model = 'claude-3-haiku-20240307'    # Before
model = 'claude-haiku-4-5-20251001'  # After
```

**Breaking changes:** Same as other Claude 4.x models (sampling parameters, tool versions, stop reasons).

**Note:** Haiku 4.5 has separate rate limits from Haiku 3.5 and Haiku 3. Review rate limits documentation.

---

## Common Migration Patterns

### Pattern 1: Simple Model Upgrade

```python
import anthropic

# Just update the model string
MODELS = {
    'fast': 'claude-haiku-4-5-20251001',
    'balanced': 'claude-sonnet-4-6',
    'powerful': 'claude-opus-4-6',
}

client = anthropic.Anthropic()
response = client.messages.create(
    model=MODELS['balanced'],
    max_tokens=1024,
    messages=[{'role': 'user', 'content': 'Hello'}]
)
```

### Pattern 2: Replace Prefills with Instructions

```python
# Before (prefill approach - not supported on Claude 4.6)
messages = [
    {'role': 'user', 'content': 'List the top 5 programming languages'},
    {'role': 'assistant', 'content': 'Here are the top 5:\n1.'}  # Prefill
]

# After (instruction approach)
response = client.messages.create(
    model='claude-opus-4-6',
    system='When listing items, start directly with the numbered list without preamble.',
    messages=[{'role': 'user', 'content': 'List the top 5 programming languages'}]
)

# Or use structured output
response = client.messages.create(
    model='claude-opus-4-6',
    max_tokens=1024,
    output_config={'format': {'type': 'json', 'schema': {'type': 'object', 'properties': {'languages': {'type': 'array', 'items': {'type': 'string'}}}}}}
    messages=[{'role': 'user', 'content': 'List the top 5 programming languages'}]
)
```

---

## Related Documentation

- [Models Overview](models-overview.md)
- [Model Deprecations](model-deprecations.md)
- [Pricing](pricing.md)
- [Extended Thinking Tips](../05-prompt-engineering/extended-thinking-tips.md)
- [Rate Limits](../06-api-reference/rate-limits.md)

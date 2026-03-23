# Extended Thinking Tips

> Source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/extended-thinking-tips
> Also: https://platform.claude.com/docs/en/build-with-claude/extended-thinking

Extended thinking gives Claude enhanced reasoning capabilities for complex tasks. This guide covers best practices for prompting Claude with extended thinking enabled.

## Overview of Extended Thinking

When extended thinking is enabled, Claude creates internal reasoning (thinking) content blocks before generating its final response. This improves performance on complex tasks like math, coding, analysis, and multi-step reasoning.

### Supported Models

- **Claude Opus 4.6** — adaptive thinking only (`thinking: {type: "adaptive"}`); manual mode deprecated
- **Claude Opus 4.5** — manual extended thinking + interleaved thinking
- **Claude Sonnet 4.6** — manual extended thinking + adaptive thinking + interleaved mode
- **Claude Sonnet 4.5, Sonnet 4, Opus 4, Opus 4.1** — manual extended thinking
- **Claude Haiku 4.5** — manual extended thinking

## Enabling Extended Thinking

### Manual Mode (Older Models)

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000  # Max tokens for thinking
    },
    messages=[{
        "role": "user",
        "content": "Solve this complex math problem step by step..."
    }]
)

# Access thinking blocks
for block in response.content:
    if block.type == "thinking":
        print("Thinking:", block.thinking)
    elif block.type == "text":
        print("Response:", block.text)
```

### Adaptive Thinking (Claude Opus 4.6 and Sonnet 4.6)

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=64000,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},  # low, medium, high, max
    messages=[{"role": "user", "content": "..."}]
)
```

The model dynamically decides when and how much to think based on query complexity.

## Best Practices for Extended Thinking

### 1. Set Appropriate Token Budgets

```python
# For complex tasks (math, code, analysis)
thinking={"type": "enabled", "budget_tokens": 16000}

# For very complex multi-step reasoning
thinking={"type": "enabled", "budget_tokens": 32000}

# Use batch processing for budgets above 32k to avoid timeouts
```

- Minimum budget: **1,024 tokens**
- Start low and increase incrementally
- Budget is a target, not a strict limit
- For Claude Opus 4.6, use adaptive thinking with `effort` instead of `budget_tokens`

### 2. Leverage Thinking for Specific Task Types

Extended thinking provides the most benefit for:
- Complex mathematical reasoning
- Multi-step coding problems
- Deep analytical tasks
- Long-horizon planning
- Tasks requiring careful evaluation of tradeoffs

For simple, conversational tasks, disable thinking to save tokens and reduce latency.

### 3. Prompt for Thinking Guidance

You can guide Claude's reasoning process:

```python
messages=[{
    "role": "user",
    "content": """Solve this step by step:
    
    A train travels 120km at 60km/h, then 180km at 90km/h.
    What is the average speed for the entire journey?
    
    Think through this carefully before answering."""
}]
```

### 4. Use Multishot Examples with Thinking

Include `<thinking>` tags in few-shot examples to model the reasoning pattern:

```python
system = """You solve math problems step by step.

<example>
User: What is 15% of 280?
<thinking>
To find 15% of 280:
- 10% of 280 = 28
- 5% of 280 = 14
- 15% = 28 + 14 = 42
</thinking>
Answer: 42
</example>"""
```

### 5. Ask Claude to Self-Check

```python
messages=[{
    "role": "user",
    "content": """Write a Python function to find all prime numbers up to n.
    
    After writing the solution, verify it against these test cases:
    - primes_up_to(10) should return [2, 3, 5, 7]
    - primes_up_to(1) should return []
    - primes_up_to(2) should return [2]"""
}]
```

### 6. Prefer General Instructions over Prescriptive Steps

Instead of:
```
Think through: step 1, then step 2, then step 3...
```

Prefer:
```
Think thoroughly about this problem before answering.
```

Claude's own reasoning often exceeds what a human would prescribe.

## Controlling Thinking Display

Use `display` in the thinking config to control what you receive:

```python
# Default - receive summarized thinking (Claude 4 models)
thinking={"type": "enabled", "budget_tokens": 10000, "display": "summarized"}

# Omit thinking text to reduce latency (you still pay for thinking tokens)
thinking={"type": "enabled", "budget_tokens": 10000, "display": "omitted"}
```

**When to use `display: "omitted"`:**
- Your application doesn't show thinking to users
- You want faster time-to-first-text-token
- Note: You're still billed for the full thinking tokens

## Streaming Extended Thinking

```python
with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[{"role": "user", "content": "..."}]
) as stream:
    for event in stream:
        if hasattr(event, 'type'):
            if event.type == 'content_block_start':
                print(f"Block type: {event.content_block.type}")
            elif event.type == 'content_block_delta':
                if hasattr(event.delta, 'thinking'):
                    print(f"Thinking: {event.delta.thinking}", end='')
                elif hasattr(event.delta, 'text'):
                    print(f"Text: {event.delta.text}", end='')
```

**Note:** The SDK requires streaming when `max_tokens > 21,333` to avoid HTTP timeouts.

## Extended Thinking with Tool Use

```python
tools = [{
    "name": "get_data",
    "description": "Retrieves data from a database",
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {"type": "string"}
        },
        "required": ["query"]
    }
}]

response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    # Only "auto" or "none" supported with thinking
    tools=tools,
    messages=[{"role": "user", "content": "Analyze sales data for Q3 2024"}]
)
```

### Important Constraints with Tool Use:
- Only `tool_choice: {"type": "auto"}` or `tool_choice: {"type": "none"}` supported
- Must preserve and return thinking blocks when continuing after tool results
- Don't toggle thinking mode mid-turn (mid tool-use loop)

### Preserving Thinking Blocks (Critical)

```python
# First request
response1 = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    tools=tools,
    messages=[{"role": "user", "content": "What is the sales total?"}]
)

# Must preserve ALL thinking blocks when passing tool results back
tool_result_message = {
    "role": "user",
    "content": [{"type": "tool_result", "tool_use_id": "...", "content": "Sales: $1.2M"}]
}

# Include the full unmodified response from step 1
response2 = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    tools=tools,
    messages=[
        {"role": "user", "content": "What is the sales total?"},
        {"role": "assistant", "content": response1.content},  # Includes thinking blocks
        tool_result_message
    ]
)
```

## Interleaved Thinking

Interleaved thinking lets Claude reason between tool calls for more sophisticated multi-step reasoning.

```python
# Claude Opus 4.5, Sonnet 4.6 and Claude 4 models
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    extra_headers={"anthropic-beta": "interleaved-thinking-2025-05-14"},
    thinking={"type": "enabled", "budget_tokens": 10000},
    tools=tools,
    messages=[{"role": "user", "content": "Research and summarize the latest AI developments"}]
)

# Claude Opus 4.6 - automatic with adaptive thinking
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=64000,
    thinking={"type": "adaptive"},  # Automatically enables interleaved thinking
    output_config={"effort": "high"},
    tools=tools,
    messages=[{"role": "user", "content": "..."}]
)
```

## Adaptive Thinking Configuration

For Claude Opus 4.6 and Claude Sonnet 4.6:

```python
# High effort - maximum reasoning, best for complex problems
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=64000,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},
    messages=[{"role": "user", "content": "Solve this complex optimization problem..."}]
)

# Low effort - faster, cheaper, for simple queries
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=8192,
    thinking={"type": "adaptive"},
    output_config={"effort": "low"},
    messages=[{"role": "user", "content": "What is 2+2?"}]
)
```

### Effort Levels:
- **low** — minimal thinking, fastest, cheapest
- **medium** — balanced (recommended for most apps)
- **high** — thorough reasoning (default for Sonnet 4.6)
- **max** — maximum effort (for hardest problems)

## Migrating from budget_tokens to Adaptive Thinking

```python
# Before (manual extended thinking)
client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=64000,
    thinking={"type": "enabled", "budget_tokens": 32000},
    messages=[{"role": "user", "content": "..."}]
)

# After (adaptive thinking on Opus 4.6)
client.messages.create(
    model="claude-opus-4-6",
    max_tokens=64000,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},
    messages=[{"role": "user", "content": "..."}]
)
```

## Pricing Considerations

You are billed for:
1. **Full thinking tokens** (output tokens) — even if using `display: "summarized"` or `display: "omitted"`
2. **Thinking blocks in subsequent requests** (input tokens) — when passed back for tool use
3. **Standard text output tokens**

The billed output token count will **not** match what you see in the response when using summarized thinking.

## Feature Compatibility

Extended thinking is **NOT compatible** with:
- `temperature` parameter modifications
- `top_k` modifications
- `tool_choice: {"type": "any"}` or specific tool forcing
- Response prefilling (assistant turn prefill)

Extended thinking **IS compatible** with:
- `top_p` (values between 0.95 and 1)
- `stream: true`
- Prompt caching (system prompts and tools stay cached; message cache invalidated when thinking parameters change)
- Tool use with auto/none tool choice

## Prompt Caching with Extended Thinking

```python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16000,
    system=[{
        "type": "text",
        "text": "You are an expert mathematician...",
        "cache_control": {"type": "ephemeral"}  # System prompt cached even when thinking changes
    }],
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[{"role": "user", "content": "Solve this problem..."}]
)
```

**Cache behavior:**
- System prompts and tool definitions: **preserved** when thinking parameters change
- Message history cache: **invalidated** when thinking parameters change
- Use 1-hour cache TTL for long-running thinking tasks

## Context Window Management

With extended thinking, context is calculated as:
```
context = (input tokens - previous thinking tokens) + (thinking + encrypted thinking + text output)
```

Key points:
- Previous turn thinking blocks are **stripped** from context (don't accumulate)
- Current turn thinking counts toward `max_tokens`
- `max_tokens` is strictly enforced (no automatic reduction)
- Use the token counting API to monitor usage

```python
# Count tokens before sending
token_count = client.messages.count_tokens(
    model="claude-sonnet-4-6",
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[{"role": "user", "content": "Your complex prompt here..."}]
)
print(f"Input tokens: {token_count.input_tokens}")
```

## Related Documentation

- [Extended Thinking Overview](../03-build-with-claude/extended-thinking.md)
- [Prompt Engineering Overview](overview.md)
- [Best Practices](best-practices.md)
- [Messages API Reference](../06-api-reference/messages-api.md)
- [Rate Limits](../06-api-reference/rate-limits.md)

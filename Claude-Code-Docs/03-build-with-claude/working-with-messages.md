# Using the Messages API

> Source: https://platform.claude.com/docs/en/build-with-claude/working-with-messages

Practical patterns and examples for using the Messages API effectively.

## Basic Request and Response

```bash
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-opus-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello, Claude"}
    ]
  }'
```

### Response Format

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Hello!"
    }
  ],
  "model": "claude-opus-4-6",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 12,
    "output_tokens": 6
  }
}
```

## Multi-Turn Conversations

The Messages API is **stateless** — you always send the full conversational history.

```bash
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-opus-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello, Claude"},
      {"role": "assistant", "content": "Hello!"},
      {"role": "user", "content": "Can you describe LLMs to me?"}
    ]
  }'
```

## System Prompts

Use `system` to provide background context, instructions, or persona:

```json
{
  "model": "claude-opus-4-6",
  "max_tokens": 1024,
  "system": "You are a helpful coding assistant specializing in Python.",
  "messages": [
    {"role": "user", "content": "How do I read a file?"}
  ]
}
```

## Vision (Images)

Claude accepts images as `base64`, `url`, or `file` source types.

Supported media types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

### URL-Referenced Image

```json
{
  "model": "claude-opus-4-6",
  "max_tokens": 1024,
  "messages": [{
    "role": "user",
    "content": [
      {
        "type": "image",
        "source": {
          "type": "url",
          "url": "https://example.com/image.jpg"
        }
      },
      {"type": "text", "text": "What is in this image?"}
    ]
  }]
}
```

### Base64-Encoded Image

```json
{
  "type": "image",
  "source": {
    "type": "base64",
    "media_type": "image/jpeg",
    "data": "<base64-encoded-image-data>"
  }
}
```

## Prefilling (Deprecated on Claude 4.x)

> Note: Prefilling is deprecated and not supported on Claude Opus 4.6, Sonnet 4.6, and Sonnet 4.5. Use structured outputs or system prompt instructions instead.

## Stop Reasons

| stop_reason | Meaning |
|-------------|---------|
| `end_turn` | Claude finished naturally |
| `max_tokens` | Hit max_tokens limit |
| `stop_sequence` | Hit a custom stop sequence |
| `tool_use` | Claude wants to use a tool |
| `pause_turn` | API paused a long-running turn |
| `model_context_window_exceeded` | Context window full |

## Usage Object

```json
"usage": {
  "input_tokens": 12,
  "output_tokens": 6,
  "cache_creation_input_tokens": 0,
  "cache_read_input_tokens": 0
}
```

## Related

- [Features Overview](features-overview.md)
- [Streaming](streaming.md)
- [Tool Use](../04-agents-and-tools/tool-use-overview.md)
- [Extended Thinking](extended-thinking.md)
- [Structured Outputs](structured-outputs.md)
- [API Reference](../06-api-reference/messages-api.md)

# Messages API Reference

> Source: https://platform.claude.com/docs/en/api/overview

The Messages API is the core interface for interacting with Claude. It follows REST conventions with JSON request/response bodies.

## Base URL

```
https://api.anthropic.com/v1
```

## Authentication

All requests require an API key in the header:
```bash
x-api-key: $ANTHROPIC_API_KEY
```

Additionally, specify the API version:
```bash
anthropic-version: 2023-06-01
```

## Create a Message

**POST** `/v1/messages`

### Request Body

```json
{
  "model": "claude-opus-4-6",
  "max_tokens": 1024,
  "messages": [
    {"role": "user", "content": "Hello, Claude!"}
  ],
  "system": "You are a helpful assistant.",
  "temperature": 1.0,
  "top_p": 0.999,
  "top_k": 50,
  "stop_sequences": ["\n\nHuman:"],
  "stream": false,
  "metadata": {
    "user_id": "user-123"
  }
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `model` | string | Model ID (e.g., `claude-opus-4-6`) |
| `max_tokens` | integer | Max output tokens (1–model_max) |
| `messages` | array | Array of message objects |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `system` | string or array | System prompt |
| `temperature` | float | Randomness 0.0–1.0 (default: 1.0) |
| `top_p` | float | Nucleus sampling (default: 0.999) |
| `top_k` | integer | Top-K sampling |
| `stop_sequences` | array | Custom stop sequences |
| `stream` | boolean | Enable SSE streaming |
| `tools` | array | Tool definitions for tool use |
| `tool_choice` | object | Control tool selection |
| `thinking` | object | Extended thinking config |
| `metadata` | object | Request metadata |
| `cache_control` | object | Automatic prompt caching |
| `betas` | array | Beta feature flags |

### Message Object

```json
{
  "role": "user",  // or "assistant"
  "content": "Hello"  // string or array of content blocks
}
```

### Content Block Types

**Text:**
```json
{"type": "text", "text": "Hello"}
```

**Image:**
```json
{
  "type": "image",
  "source": {
    "type": "base64",
    "media_type": "image/jpeg",
    "data": "/9j/4AAQSkZJRgAB..."
  }
}
```

**Image URL:**
```json
{
  "type": "image",
  "source": {
    "type": "url",
    "url": "https://example.com/image.jpg"
  }
}
```

**Document:**
```json
{
  "type": "document",
  "source": {
    "type": "base64",
    "media_type": "application/pdf",
    "data": "JVBERi0x..."
  },
  "title": "My Document",
  "context": "Relevant background"
}
```

**Tool use (assistant turn):**
```json
{
  "type": "tool_use",
  "id": "toolu_abc123",
  "name": "get_weather",
  "input": {"location": "San Francisco"}
}
```

**Tool result (user turn):**
```json
{
  "type": "tool_result",
  "tool_use_id": "toolu_abc123",
  "content": "It's 18°C and sunny"
}
```

## Response Format

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "model": "claude-opus-4-6-20260309",
  "content": [
    {"type": "text", "text": "Hello! How can I help you?"}
  ],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 25,
    "output_tokens": 15,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 0
  }
}
```

## Stop Reasons

| Stop Reason | Description |
|-------------|-------------|
| `end_turn` | Natural completion |
| `max_tokens` | Hit max_tokens limit |
| `stop_sequence` | Matched a stop sequence |
| `tool_use` | Claude wants to use a tool |
| `pause_turn` | Server-side tool execution limit reached |

## cURL Example

```bash
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-opus-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello, Claude!"}
    ]
  }'
```

## Python SDK

```python
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")

message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude!"}
    ]
)

print(message.content[0].text)
```

## TypeScript SDK

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: "your-api-key" });

const message = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [
    { role: "user", content: "Hello, Claude!" }
  ]
});

console.log(message.content[0].text);
```

## Multi-turn Conversation

```python
messages = [
    {"role": "user", "content": "What's the capital of France?"},
    {"role": "assistant", "content": "The capital of France is Paris."},
    {"role": "user", "content": "What's the population?"}
]

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=messages
)
```

## Error Codes

| HTTP Status | Error Type | Description |
|-------------|-----------|-------------|
| 400 | `invalid_request_error` | Malformed request |
| 401 | `authentication_error` | Invalid API key |
| 403 | `permission_error` | Access denied |
| 404 | `not_found_error` | Resource not found |
| 429 | `rate_limit_error` | Rate limit exceeded |
| 500 | `api_error` | Internal server error |
| 529 | `overloaded_error` | API overloaded |

## Beta Features

Use the `anthropic-beta` header:
```bash
-H "anthropic-beta: computer-use-2025-11-24"
```

Multiple betas can be combined:
```bash
-H "anthropic-beta: code-execution-2025-08-25,skills-2025-10-02,files-api-2025-04-14"
```

## Related Docs

- [Rate Limits](./rate-limits.md)
- [Client SDKs](./client-sdks.md)
- [Streaming](../03-build-with-claude/streaming.md)
- [Tool Use Overview](../04-agents-and-tools/tool-use-overview.md)

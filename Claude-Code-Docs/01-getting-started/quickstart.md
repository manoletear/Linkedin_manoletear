# Quickstart — Get Started with Claude

> Source: https://platform.claude.com/docs/en/get-started

Make your first API call to Claude.

## Prerequisites

- An Anthropic Console account
- An API key from https://platform.claude.com/settings/keys

## Step 1 — Set Your API Key

```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

## Step 2 — Make Your First API Call

```bash
curl https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-opus-4-6",
    "max_tokens": 1000,
    "messages": [{"role": "user", "content": "Hello, Claude"}]
  }'
```

## Python SDK

```python
import anthropic

client = anthropic.Anthropic()
message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude"}]
)
print(message.content)
```

Install: `pip install anthropic`

## TypeScript SDK

```typescript
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

const message = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello, Claude" }],
});
console.log(message.content);
```

Install: `npm install @anthropic-ai/sdk`

## Example Response

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [{"type": "text", "text": "Hello! How can I assist you today?"}],
  "model": "claude-opus-4-6",
  "stop_reason": "end_turn",
  "usage": {"input_tokens": 12, "output_tokens": 8}
}
```

## Required Headers

| Header | Value |
|--------|-------|
| `x-api-key` | Your API key from Console |
| `anthropic-version` | `2023-06-01` |
| `content-type` | `application/json` |

## Next Steps

- [Working with Messages](../03-build-with-claude/working-with-messages.md)
- [Models Overview](../02-models/models-overview.md)
- [Features Overview](../03-build-with-claude/features-overview.md)
- [Client SDKs](../06-api-reference/client-sdks.md)

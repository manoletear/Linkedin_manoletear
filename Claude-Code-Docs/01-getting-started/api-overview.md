# API Overview

> Source: https://platform.claude.com/docs/en/api

The Claude API provides access to Anthropic's Claude models through a REST API and official SDKs.

## Base URL

```
https://api.anthropic.com
```

## Authentication

All API requests require an API key in the `x-api-key` header:

```bash
curl https://api.anthropic.com/v1/messages \
  --header 'x-api-key: YOUR_API_KEY' \
  --header 'anthropic-version: 2023-06-01' \
  --header 'content-type: application/json' \
  --data '{"model": "claude-sonnet-4-6", "max_tokens": 1024, "messages": [{"role": "user", "content": "Hello"}]}'
```

Get your API key at: https://console.anthropic.com/

## API Version Header

Always include `anthropic-version: 2023-06-01` in all requests. This is the stable, recommended version.

## Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/messages` | POST | Create a message (main endpoint) |
| `/v1/messages/count_tokens` | POST | Count tokens without sending |
| `/v1/messages/batches` | POST | Create a batch of messages |
| `/v1/messages/batches/{id}` | GET | Get batch status |
| `/v1/messages/batches/{id}/results` | GET | Stream batch results |
| `/v1/models` | GET | List available models |
| `/v1/models/{id}` | GET | Get model details |
| `/v1/files` | POST/GET | Upload and manage files |
| `/v1/admin/api-keys` | GET/POST/DEL | Manage API keys (admin) |

## The Messages API

The `/v1/messages` endpoint is the primary way to interact with Claude.

### Minimum Request

```python
import anthropic

client = anthropic.Anthropic()  # Reads ANTHROPIC_API_KEY from environment

message = client.messages.create(
    model='claude-sonnet-4-6',
    max_tokens=1024,
    messages=[
        {'role': 'user', 'content': 'What is the capital of France?'}
    ]
)

print(message.content[0].text)  # 'The capital of France is Paris.'
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | Model ID (e.g., `claude-sonnet-4-6`) |
| `max_tokens` | integer | Yes | Maximum output tokens (1-128000) |
| `messages` | array | Yes | Array of message objects |
| `system` | string/array | No | System prompt |
| `tools` | array | No | Tool definitions |
| `tool_choice` | object | No | Tool selection behavior |
| `thinking` | object | No | Extended thinking config |
| `output_config` | object | No | Output format and effort |
| `temperature` | float | No | Randomness (0-1) |
| `top_p` | float | No | Nucleus sampling |
| `top_k` | integer | No | Top-k sampling |
| `stop_sequences` | array | No | Custom stop sequences |
| `stream` | boolean | No | Enable streaming |
| `metadata` | object | No | User metadata |

### Response Structure

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "The capital of France is Paris."
    }
  ],
  "model": "claude-sonnet-4-6",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 10,
    "output_tokens": 8,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 0
  }
}
```

### Stop Reasons

| Stop Reason | Description |
|-------------|-------------|
| `end_turn` | Claude finished naturally |
| `max_tokens` | Hit the `max_tokens` limit |
| `stop_sequence` | Hit a custom stop sequence |
| `tool_use` | Claude wants to use a tool |
| `refusal` | Request was refused |
| `model_context_window_exceeded` | Context window full (Claude 4.5+) |
| `pause_turn` | Turn was paused (agentic workflows) |

## System Prompts

```python
# Simple string system prompt
response = client.messages.create(
    model='claude-sonnet-4-6',
    max_tokens=1024,
    system='You are a helpful assistant specialized in Python programming.',
    messages=[{'role': 'user', 'content': 'How do I read a CSV file?'}]
)

# Array format with cache_control
response = client.messages.create(
    model='claude-sonnet-4-6',
    max_tokens=1024,
    system=[{
        'type': 'text',
        'text': 'You are a Python expert with deep knowledge of data science.',
        'cache_control': {'type': 'ephemeral'}  # Cache this system prompt
    }],
    messages=[{'role': 'user', 'content': 'Explain pandas DataFrames'}]
)
```

## Multi-turn Conversations

```python
messages = []

while True:
    user_input = input('You: ')
    if user_input.lower() == 'exit':
        break

    messages.append({'role': 'user', 'content': user_input})

    response = client.messages.create(
        model='claude-sonnet-4-6',
        max_tokens=1024,
        messages=messages
    )

    assistant_message = response.content[0].text
    messages.append({'role': 'assistant', 'content': assistant_message})
    print(f'Claude: {assistant_message}')
```

## Streaming

```python
with client.messages.stream(
    model='claude-sonnet-4-6',
    max_tokens=1024,
    messages=[{'role': 'user', 'content': 'Write a short story'}]
) as stream:
    for text in stream.text_stream:
        print(text, end='', flush=True)
```

## Content Types

### Text

```python
{'type': 'text', 'text': 'Your text here'}
```

### Image

```python
# Base64 encoded
{
    'type': 'image',
    'source': {
        'type': 'base64',
        'media_type': 'image/jpeg',
        'data': '/9j/4AAQSkZJRg...'
    }
}

# URL
{
    'type': 'image',
    'source': {
        'type': 'url',
        'url': 'https://example.com/image.jpg'
    }
}

# Uploaded file
{
    'type': 'image',
    'source': {
        'type': 'file',
        'file_id': 'file_abc123'
    }
}
```

### Document (PDF, text, HTML)

```python
{
    'type': 'document',
    'source': {
        'type': 'base64',
        'media_type': 'application/pdf',
        'data': 'base64_encoded_pdf...'
    },
    'title': 'My Document',
    'context': 'Reference material for the question'
}
```

## Quick SDK Setup

### Python

```bash
pip install anthropic
export ANTHROPIC_API_KEY='your-api-key'
```

```python
import anthropic
client = anthropic.Anthropic()  # Reads from ANTHROPIC_API_KEY

# Or with explicit key:
client = anthropic.Anthropic(api_key='your-api-key')
```

### TypeScript

```bash
npm install @anthropic-ai/sdk
export ANTHROPIC_API_KEY='your-api-key'
```

```typescript
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic();

const message = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
});

console.log(message.content[0].type === 'text' ? message.content[0].text : '');
```

## Related Documentation

- [Quickstart Guide](quickstart.md)
- [Introduction to Claude](intro-to-claude.md)
- [Messages API Reference](../06-api-reference/messages-api.md)
- [Client SDKs](../06-api-reference/client-sdks.md)
- [Error Handling](../06-api-reference/error-handling.md)
- [Rate Limits](../06-api-reference/rate-limits.md)
- [Models Overview](../02-models/models-overview.md)

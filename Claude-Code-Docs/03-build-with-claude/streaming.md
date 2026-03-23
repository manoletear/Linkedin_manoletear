# Streaming Messages

> Source: https://platform.claude.com/docs/en/build-with-claude/streaming

When creating a Message, you can set `"stream": true` to incrementally stream the response using server-sent events (SSE).

## Streaming with SDKs

The Python and TypeScript SDKs offer multiple ways of streaming. The PHP SDK provides streaming via `createStream()`.

```python
import anthropic
client = anthropic.Anthropic()

with client.messages.stream(
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
    model="claude-opus-4-6",
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

## Get Final Message Without Handling Events

If you don't need to process text as it arrives, use streaming under the hood while returning the complete Message object:

```python
with client.messages.stream(
    max_tokens=128000,
    messages=[{"role": "user", "content": "Write a detailed analysis..."}],
    model="claude-opus-4-6",
) as stream:
    message = stream.get_final_message()
```

## Event Types

Each stream uses the following event flow:

1. `message_start` — contains a Message object with empty content
2. Content blocks, each with:
   - `content_block_start`
   - One or more `content_block_delta` events
   - `content_block_stop`
3. One or more `message_delta` events
4. A final `message_stop` event

Token counts in `message_delta` are cumulative.

### Content Block Delta Types

**Text delta:**
```json
event: content_block_delta
data: {"type": "content_block_delta","index": 0,"delta": {"type": "text_delta", "text": "ello frien"}}
```

**Input JSON delta (for tool_use blocks):**
```json
event: content_block_delta
data: {"type": "content_block_delta","index": 1,"delta": {"type": "input_json_delta","partial_json": "{\"location\": \"San Fra"}}
```

**Thinking delta (for extended thinking):**
```json
event: content_block_delta
data: {"type": "content_block_delta", "index": 0, "delta": {"type": "thinking_delta", "thinking": "I need to find the GCD..."}}
```

## Basic Streaming Request

```bash
curl https://api.anthropic.com/v1/messages \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --data '{
    "model": "claude-opus-4-6",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 256,
    "stream": true
  }'
```

### Example Stream Response

```
event: message_start
data: {"type": "message_start", "message": {"id": "msg_1nZdL29xx5MUA1yADyHTEsnR8uuvGzszyY", ...}}

event: content_block_start
data: {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}}

event: content_block_delta
data: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Hello!"}}

event: content_block_stop
data: {"type": "content_block_stop", "index": 0}

event: message_delta
data: {"type": "message_delta", "delta": {"stop_reason": "end_turn"}, "usage": {"output_tokens": 15}}

event: message_stop
data: {"type": "message_stop"}
```

## Streaming with Tool Use

Tool use supports fine-grained streaming for parameter values. Enable per tool with `eager_input_streaming`:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-opus-4-6",
    "max_tokens": 1024,
    "tools": [
      {
        "name": "get_weather",
        "description": "Get the current weather in a given location",
        "input_schema": {
          "type": "object",
          "properties": {
            "location": {"type": "string", "description": "The city and state"}
          },
          "required": ["location"]
        }
      }
    ],
    "tool_choice": {"type": "any"},
    "messages": [{"role": "user", "content": "What is the weather in San Francisco?"}],
    "stream": true
  }'
```

## Streaming with Extended Thinking

```bash
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-opus-4-6",
    "max_tokens": 20000,
    "stream": true,
    "thinking": {
      "type": "enabled",
      "budget_tokens": 16000
    },
    "messages": [{"role": "user", "content": "What is the greatest common divisor of 1071 and 462?"}]
  }'
```

## Error Recovery

### Claude 4.6 and later
Add a user message instructing the model to continue:
```
Your previous response was interrupted and ended with [previous_response]. Continue from where you left off.
```

### Claude 4.5 and earlier
Construct a continuation request with the partial assistant response as the beginning of a new assistant message.

## Error Events

The API may send errors in the event stream:
```
event: error
data: {"type": "error", "error": {"type": "overloaded_error", "message": "Overloaded"}}
```

## Related Docs

- [Extended Thinking](./extended-thinking.md)
- [Tool Use Overview](../04-agents-and-tools/tool-use-overview.md)
- [Messages API Reference](../06-api-reference/messages-api.md)

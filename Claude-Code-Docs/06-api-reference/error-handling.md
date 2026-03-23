# Error Handling

> Source: https://platform.claude.com/docs/en/api/errors

The Claude API uses standard HTTP status codes and returns structured JSON error responses.

## HTTP Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | `invalid_request_error` | Issue with format or content of your request |
| 401 | `authentication_error` | Issue with your API key |
| 402 | `billing_error` | Issue with billing or payment information |
| 403 | `permission_error` | API key lacks permission for the specified resource |
| 404 | `not_found_error` | Requested resource was not found |
| 413 | `request_too_large` | Request exceeds maximum allowed size |
| 429 | `rate_limit_error` | Account has hit a rate limit |
| 500 | `api_error` | Unexpected error internal to Anthropic's systems |
| 529 | `overloaded_error` | API is temporarily overloaded |

## Error Response Format

Errors are always returned as JSON with a top-level `error` object:

```json
{
  "type": "error",
  "error": {
    "type": "not_found_error",
    "message": "The requested resource could not be found."
  },
  "request_id": "req_011CSHoEeqs5C35K2UUqR7Fy"
}
```

Every response also includes a `request-id` header for tracking and debugging.

## Request Size Limits

| Endpoint | Maximum Request Size |
|----------|---------------------|
| Messages API | 32 MB |
| Token Counting API | 32 MB |
| Batch API | 256 MB |
| Files API | 500 MB |

Exceeding these limits returns a `413 request_too_large` error.

## Getting the Request ID

```python
import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude"}],
)

print(f'Request ID: {message._request_id}')
# Output: Request ID: req_018EeWyXxfu5pfWkrYcMdjWG
```

Include this ID when contacting support about a specific request.

## Error Handling Patterns

### Basic Error Handling (Python)

```python
import anthropic
from anthropic import APIError, APIConnectionError, RateLimitError, APIStatusError

client = anthropic.Anthropic()

def make_api_call(prompt: str, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            message = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text

        except RateLimitError as e:
            print(f'Rate limited. Waiting before retry {attempt + 1}/{max_retries}')
            if attempt < max_retries - 1:
                import time
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                raise

        except APIStatusError as e:
            print(f'API error {e.status_code}: {e.message}')
            if e.status_code == 529:  # Overloaded
                import time
                time.sleep(5)
            elif e.status_code >= 500:  # Server errors
                if attempt < max_retries - 1:
                    import time
                    time.sleep(2 ** attempt)
                else:
                    raise
            else:  # Client errors (400, 401, etc.) - don't retry
                raise

        except APIConnectionError as e:
            print(f'Connection error: {e}')
            if attempt < max_retries - 1:
                import time
                time.sleep(2 ** attempt)
            else:
                raise
    return None
```

### Catching Specific Error Types

```python
try:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello"}]
    )
except anthropic.AuthenticationError:
    print('Invalid API key. Check ANTHROPIC_API_KEY environment variable.')
except anthropic.PermissionDeniedError:
    print('API key lacks permission for this operation.')
except anthropic.NotFoundError:
    print('Resource not found.')
except anthropic.UnprocessableEntityError as e:
    print(f'Invalid request: {e.message}')
except anthropic.RateLimitError:
    print('Rate limit hit. Implement exponential backoff.')
except anthropic.InternalServerError:
    print('Anthropic server error. Retry with backoff.')
```

### TypeScript Error Handling

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function makeApiCall(prompt: string): Promise<string> {
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    return (message.content[0] as Anthropic.TextBlock).text;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.log(`Status: ${error.status}`);
      console.log(`Error type: ${error.error?.type}`);
      console.log(`Message: ${error.message}`);
      console.log(`Request ID: ${error.headers?.['request-id']}`);
    }
    throw error;
  }
}
```

## Exponential Backoff Implementation

```python
import time
import random
from anthropic import RateLimitError

def with_exponential_backoff(
    func,
    max_retries: int = 5,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    jitter: bool = True
):
    for attempt in range(max_retries):
        try:
            return func()
        except RateLimitError as e:
            if attempt == max_retries - 1:
                raise
            delay = min(base_delay * (2 ** attempt), max_delay)
            if jitter:
                delay *= (0.5 + random.random() * 0.5)  # Add 50% jitter
            print(f'Rate limited. Retrying in {delay:.1f}s (attempt {attempt + 1}/{max_retries})')
            time.sleep(delay)

# Usage
result = with_exponential_backoff(
    lambda: client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello"}]
    )
)
```

## Handling Streaming Errors

Errors during streaming may occur after a 200 response — handle them in the stream loop:

```python
try:
    with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Tell me a story"}],
    ) as stream:
        for text in stream.text_stream:
            print(text, end='', flush=True)
        message = stream.get_final_message()
        print(f'\nRequest ID: {message._request_id}')
except anthropic.APIStatusError as e:
    print(f'Stream error: {e.status_code} - {e.message}')
```

## Long Request Best Practices

For requests expected to take more than a few seconds:

```python
# Option 1: Streaming (recommended for long responses)
with client.messages.stream(
    model="claude-opus-4-6",
    max_tokens=128000,
    messages=[{"role": "user", "content": "Write a detailed analysis..."}],
) as stream:
    message = stream.get_final_message()

# Option 2: Message Batches API (for very long or many requests)
# See batch-processing.md for details
batch = client.messages.batches.create(
    requests=[
        {
            'custom_id': 'request-1',
            'params': {
                "model": "claude-sonnet-4-6",
                'max_tokens': 1024,
                'messages': [{'role': 'user', 'content': 'Hello'}]
            }
        }
    ]
)
```

**Key guidance:**
- Use streaming for requests expected to take > 10 minutes
- Avoid large `max_tokens` without streaming (idle connections may be dropped)
- Use the Batch API for high-volume processing to avoid connection issues
- SDKs automatically set TCP keep-alive socket options

## Common Validation Errors

### Prefill Not Supported

Claude Opus 4.6 does not support prefilling assistant messages:

```json
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "Prefilling assistant messages is not supported for this model."
  }
}
```

**Fix:** Use structured outputs, system prompt instructions, or `output_config.format` instead.

### Token Budget Exceeded

```python
# Wrong: budget_tokens must be less than max_tokens
thinking={'type': 'enabled', 'budget_tokens': 10000}  # OK if max_tokens > 10000

# If this error occurs, increase max_tokens
client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=20000,  # Must be > budget_tokens
    thinking={'type': 'enabled', 'budget_tokens': 10000},
    ...
)
```

### Context Window Exceeded

```python
# Monitor token usage
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "..."}]
)

print(f'Input tokens: {response.usage.input_tokens}')
print(f'Output tokens: {response.usage.output_tokens}')
print(f'Cache read: {response.usage.cache_read_input_tokens}')
print(f'Cache write: {response.usage.cache_creation_input_tokens}')

# Use token counting API to check before sending
token_count = client.messages.count_tokens(
    model="claude-sonnet-4-6",
    messages=[{"role": "user", "content": "..."}]
)
MAX_CONTEXT = 200000  # Claude's context window
if token_count.input_tokens + 1024 > MAX_CONTEXT:
    print('Request would exceed context window')
```

## Related Documentation

- [Rate Limits](rate-limits.md)
- [Messages API Reference](messages-api.md)
- [Client SDKs](client-sdks.md)
- [Batch Processing](../03-build-with-claude/batch-processing.md)

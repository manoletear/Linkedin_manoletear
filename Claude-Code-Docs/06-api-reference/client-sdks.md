# Client SDKs

> Source: https://platform.claude.com/docs/en/api/client-sdks

Anthropic provides official SDKs for multiple programming languages to make it easy to integrate with the Claude API.

## Official SDKs

| Language | Package | Repository |
|----------|---------|-----------|
| Python | `anthropic` | https://github.com/anthropics/anthropic-sdk-python |
| TypeScript/JavaScript | `@anthropic-ai/sdk` | https://github.com/anthropics/anthropic-sdk-typescript |
| Java | `anthropic-java` | https://github.com/anthropics/anthropic-sdk-java |
| Go | `anthropic-go` | https://github.com/anthropics/anthropic-sdk-go |
| Ruby | `anthropic` | https://github.com/anthropics/anthropic-sdk-ruby |
| PHP | `anthropic-sdk-php` | https://github.com/anthropics/anthropic-sdk-php |

## Python SDK

### Installation

```bash
pip install anthropic
```

### Basic Usage

```python
import anthropic

# Initialize client (reads ANTHROPIC_API_KEY from environment)
client = anthropic.Anthropic()

# Or with explicit key
client = anthropic.Anthropic(api_key="your-key")

# Create a message
message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)

print(message.content[0].text)
print(f"Stop reason: {message.stop_reason}")
print(f"Usage: {message.usage}")
```

### Async Python

```python
import asyncio
import anthropic

client = anthropic.AsyncAnthropic()

async def main():
    message = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(message.content[0].text)

asyncio.run(main())
```

### Streaming (Python)

```python
with client.messages.stream(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Write a haiku about AI"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

### Error Handling (Python)

```python
import anthropic

client = anthropic.Anthropic()

try:
    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello"}]
    )
except anthropic.APIConnectionError as e:
    print(f"Connection error: {e}")
except anthropic.RateLimitError as e:
    print(f"Rate limited: {e}")
    # Respect retry-after header
except anthropic.AuthenticationError as e:
    print(f"Auth error — check API key: {e}")
except anthropic.APIStatusError as e:
    print(f"API error {e.status_code}: {e.message}")
```

## TypeScript/JavaScript SDK

### Installation

```bash
npm install @anthropic-ai/sdk
# or
yarn add @anthropic-ai/sdk
```

### Basic Usage

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: "Hello, Claude!" }],
  });

  console.log(message.content[0].text);
  console.log(`Stop reason: ${message.stop_reason}`);
}

main();
```

### Streaming (TypeScript)

```typescript
const stream = await client.messages.stream({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Write a poem about code" }],
});

for await (const chunk of stream) {
  if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
    process.stdout.write(chunk.delta.text);
  }
}

const finalMessage = await stream.finalMessage();
console.log(`\nTotal tokens: ${finalMessage.usage.input_tokens + finalMessage.usage.output_tokens}`);
```

### Error Handling (TypeScript)

```typescript
import Anthropic from "@anthropic-ai/sdk";

try {
  const message = await client.messages.create({...});
} catch (error) {
  if (error instanceof Anthropic.RateLimitError) {
    console.log("Rate limited, waiting...");
    await new Promise(resolve => setTimeout(resolve, 60000));
  } else if (error instanceof Anthropic.APIError) {
    console.log(`API Error ${error.status}: ${error.message}`);
  }
}
```

## Go SDK

```go
package main

import (
    "context"
    "fmt"
    "github.com/anthropics/anthropic-sdk-go"
    "github.com/anthropics/anthropic-sdk-go/option"
)

func main() {
    client := anthropic.NewClient(
        option.WithAPIKey("your-api-key"),
    )

    message, err := client.Messages.New(context.Background(), anthropic.MessageNewParams{
        Model:     anthropic.F(anthropic.ModelClaudeOpus4_6),
        MaxTokens: anthropic.F(int64(1024)),
        Messages: anthropic.F([]anthropic.MessageParam{
            anthropic.NewUserMessage(anthropic.NewTextBlock("Hello!")),
        }),
    })
    if err != nil {
        panic(err.Error())
    }
    
    fmt.Println(message.Content[0].Text)
}
```

## Java SDK

```java
import com.anthropic.AnthropicClient;
import com.anthropic.models.*;

AnthropicClient client = AnthropicClient.builder()
    .apiKey("your-api-key")
    .build();

Message message = client.messages().create(
    MessageCreateParams.builder()
        .model(Model.CLAUDE_OPUS_4_6)
        .maxTokens(1024L)
        .addUserMessage("Hello, Claude!")
        .build()
);

System.out.println(message.content().get(0).text().get().text());
```

## Ruby SDK

```ruby
require 'anthropic'

client = Anthropic::Client.new(api_key: "your-api-key")

message = client.messages.create(
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{role: "user", content: "Hello!"}]
)

puts message.content.first.text
```

## PHP SDK

```php
use AnthropicClient;

$client = new Client("your-api-key");

$message = $client->messages()->create([
    'model' => 'claude-opus-4-6',
    'max_tokens' => 1024,
    'messages' => [
        ['role' => 'user', 'content' => 'Hello!']
    ]
]);

echo $message->content[0]->text;
```

## Environment Variables

All SDKs read the API key from `ANTHROPIC_API_KEY` by default:

```bash
export ANTHROPIC_API_KEY="your-api-key"
```

## Retry Logic

SDKs automatically retry on transient errors with exponential backoff:

- `429 Rate Limit` — retries respecting the `retry-after` header
- `500 Internal Server Error` — retries with backoff
- `529 Overloaded` — retries with backoff
- Network timeouts — retries with backoff

Default: 2 retries. Configurable:
```python
client = anthropic.Anthropic(max_retries=3)
```

## Related Docs

- [Messages API Reference](./messages-api.md)
- [Rate Limits](./rate-limits.md)
- [Streaming](../03-build-with-claude/streaming.md)

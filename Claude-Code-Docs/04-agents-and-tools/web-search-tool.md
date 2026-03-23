# Web Search Tool

> Source: https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool

The web search tool gives Claude direct access to real-time web content, allowing it to answer questions with up-to-date information beyond its knowledge cutoff. Claude automatically cites sources from search results.

## Tool Versions

| Version | Dynamic Filtering | ZDR Eligible |
|---------|------------------|--------------|
| `web_search_20260209` | ✅ (Opus 4.6, Sonnet 4.6) | No (unless disabled) |
| `web_search_20250305` | ❌ | ✅ |

**Dynamic filtering** lets Claude write and execute code to filter search results before loading into context — keeping only relevant information and reducing token consumption.

## Supported Models

- Claude Opus 4.6, 4.5, 4.1, 4
- Claude Sonnet 4.6, 4.5, 4
- Claude Haiku 4.5, 3.5

## Basic Usage

Requires admin to enable web search in the Claude Console first.

```bash
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-opus-4-6",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "What is the weather in NYC?"}],
    "tools": [{
      "type": "web_search_20250305",
      "name": "web_search",
      "max_uses": 5
    }]
  }'
```

## Dynamic Filtering (web_search_20260209)

```bash
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-opus-4-6",
    "max_tokens": 4096,
    "messages": [{"role": "user", "content": "Search for AAPL and GOOGL prices, calculate P/E ratios."}],
    "tools": [{"type": "web_search_20260209", "name": "web_search"}]
  }'
```

## Tool Parameters

```json
{
  "type": "web_search_20250305",
  "name": "web_search",
  "max_uses": 5,
  "allowed_domains": ["example.com", "trusteddomain.org"],
  "blocked_domains": ["untrustedsource.com"],
  "user_location": {
    "type": "approximate",
    "city": "San Francisco",
    "region": "California",
    "country": "US",
    "timezone": "America/Los_Angeles"
  }
}
```

**Notes:**
- Cannot use `allowed_domains` and `blocked_domains` in same request
- Subdomains auto-included when using root domain
- Request-level domains can only further restrict organization-level settings

## Response Structure

```json
{
  "role": "assistant",
  "content": [
    {"type": "text", "text": "I'll search for that."},
    {
      "type": "server_tool_use",
      "id": "srvtoolu_01WYG3...",
      "name": "web_search",
      "input": {"query": "claude shannon birth date"}
    },
    {
      "type": "web_search_tool_result",
      "tool_use_id": "srvtoolu_01WYG3...",
      "content": [
        {
          "type": "web_search_result",
          "url": "https://en.wikipedia.org/wiki/Claude_Shannon",
          "title": "Claude Shannon - Wikipedia",
          "encrypted_content": "EqgfCio...",
          "page_age": "April 30, 2025"
        }
      ]
    },
    {
      "text": "Claude Shannon was born on April 30, 1916",
      "type": "text",
      "citations": [
        {
          "type": "web_search_result_location",
          "url": "https://en.wikipedia.org/wiki/Claude_Shannon",
          "title": "Claude Shannon - Wikipedia",
          "encrypted_index": "Eo8BCio...",
          "cited_text": "Claude Elwood Shannon (April 30, 1916 – February 24, 2001)..."
        }
      ]
    }
  ],
  "usage": {
    "input_tokens": 6039,
    "output_tokens": 931,
    "server_tool_use": {"web_search_requests": 1}
  }
}
```

## Citations

Always enabled. Each `web_search_result_location` includes:
- `url`: Source URL
- `title`: Source title
- `encrypted_index`: Reference for multi-turn conversations
- `cited_text`: Up to 150 characters of cited content

**Note:** Citation fields (`cited_text`, `title`, `url`) don't count toward token usage.

## Error Handling

API returns 200 even on tool errors. Error structure:
```json
{
  "type": "web_search_tool_result",
  "content": {
    "type": "web_search_tool_result_error",
    "error_code": "max_uses_exceeded"
  }
}
```

**Error codes:** `too_many_requests`, `invalid_input`, `max_uses_exceeded`, `query_too_long`, `unavailable`

## Pricing

- **$10 per 1,000 searches** plus standard token costs
- Search results count as input tokens in current and subsequent turns
- Each search = 1 use (regardless of number of results)
- Errors are not billed

## ZDR with web_search_20260209

To use dynamic filtering with ZDR, disable it by setting `allowed_callers: ["direct"]`:
```json
{
  "type": "web_search_20260209",
  "name": "web_search",
  "allowed_callers": ["direct"]
}
```

## Related Docs

- [Tool Use Overview](./tool-use-overview.md)
- [Code Execution Tool](./code-execution-tool.md)
- [Streaming](../03-build-with-claude/streaming.md)
- [Prompt Caching](../03-build-with-claude/prompt-caching.md)

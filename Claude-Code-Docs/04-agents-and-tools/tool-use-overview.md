# Tool Use with Claude

> Source: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview

Claude can interact with tools and functions, extending its capabilities to perform a wider variety of tasks. Each tool defines a contract: you specify what operations are available and what they return; Claude decides when and how to call them.

## Two Types of Tools

### Client Tools
Execute on your systems:
- User-defined custom tools you create and implement
- Anthropic-defined tools like computer use and text editor (require client implementation)

### Server Tools
Execute on Anthropic's servers:
- Web search and web fetch tools
- Must be specified in API request but don't require your implementation
- Use versioned types (e.g., `web_search_20250305`)

## Client Tool Workflow

```
1. You provide tools + user prompt
2. Claude decides to use a tool → API response has stop_reason: "tool_use"
3. You execute the tool + return results in a tool_result content block
4. Claude uses tool result to formulate final response
```

## Basic Example

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
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            }
          },
          "required": ["location"]
        }
      }
    ],
    "messages": [
      {"role": "user", "content": "What is the weather like in San Francisco?"}
    ]
  }'
```

## Python Example (Full Loop)

```python
import anthropic

client = anthropic.Anthropic()

tools = [
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
]

messages = [{"role": "user", "content": "What's the weather in Paris?"}]

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    tools=tools,
    messages=messages
)

# Check if Claude wants to use a tool
if response.stop_reason == "tool_use":
    tool_use_block = next(block for block in response.content if block.type == "tool_use")
    tool_name = tool_use_block.name
    tool_input = tool_use_block.input
    
    # Execute your tool
    tool_result = {"temperature": "18°C", "condition": "Partly cloudy"}
    
    # Continue the conversation with tool result
    messages = [
        {"role": "user", "content": "What's the weather in Paris?"},
        {"role": "assistant", "content": response.content},
        {
            "role": "user",
            "content": [
                {
                    "type": "tool_result",
                    "tool_use_id": tool_use_block.id,
                    "content": str(tool_result)
                }
            ]
        }
    ]
    
    final_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        tools=tools,
        messages=messages
    )
    print(final_response.content[0].text)
```

## Strict Tool Use (Guaranteed Schema Conformance)

Add `strict: true` to tool definitions to ensure Claude's tool calls always match your schema:

```json
{
  "name": "get_weather",
  "description": "Get the current weather",
  "strict": true,
  "input_schema": {
    "type": "object",
    "properties": {
      "location": {"type": "string"}
    },
    "required": ["location"],
    "additionalProperties": false
  }
}
```

## Using MCP Tools

Convert MCP tools to Claude's format:

```python
from mcp import ClientSession

async def get_claude_tools(mcp_session: ClientSession):
    mcp_tools = await mcp_session.list_tools()
    claude_tools = []
    for tool in mcp_tools.tools:
        claude_tools.append({
            "name": tool.name,
            "description": tool.description or "",
            "input_schema": tool.inputSchema,  # rename inputSchema -> input_schema
        })
    return claude_tools
```

## Server Tools Workflow

For server tools (web search, web fetch), Anthropic's servers handle execution:
1. You provide tools + user prompt
2. Claude executes the server tool (sampling loop, up to 10 iterations)
3. If limit reached, API returns `stop_reason="pause_turn"` → send back to continue

## Pricing

Tool use pricing includes:
- Total input tokens (including `tools` parameter)
- Output tokens generated
- Additional charges for server-side tools (e.g., web search per query)

**System prompt token overhead per model:**

| Model | auto/none | any/tool |
|-------|-----------|----------|
| Claude Opus 4.6 | 346 tokens | 313 tokens |
| Claude Sonnet 4.6 | 346 tokens | 313 tokens |
| Claude Haiku 4.5 | 346 tokens | 313 tokens |
| Claude Haiku 3.5 | 264 tokens | 340 tokens |

## Related Docs

- [Web Search Tool](./web-search-tool.md)
- [Code Execution Tool](./code-execution-tool.md)
- [Computer Use](./computer-use.md)
- [MCP Connector](./mcp-connector.md)
- [Agent Skills](./agent-skills.md)

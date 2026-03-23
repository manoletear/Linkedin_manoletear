# MCP Connector

> Source: https://platform.claude.com/docs/en/agents-and-tools/mcp-connector

The MCP (Model Context Protocol) connector lets you connect Claude directly to remote MCP servers via the Messages API, without implementing your own MCP client.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that allows Claude to connect to external data sources and tools through a standardized interface. MCP servers expose tools, resources, and prompts that Claude can use.

## Using MCP Tools via Messages API

You can use tools from MCP servers directly in the Messages API:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-opus-4-6",
    "max_tokens": 1024,
    "mcp_servers": [
      {
        "type": "url",
        "url": "https://mcp.example.com/server",
        "name": "example-server",
        "tool_configuration": {
          "enabled": true,
          "allowed_tools": ["tool1", "tool2"]
        }
      }
    ],
    "messages": [
      {"role": "user", "content": "Use the example server to do X"}
    ]
  }'
```

## MCP Server Configuration

```json
{
  "mcp_servers": [
    {
      "type": "url",
      "url": "https://mcp.server.com/sse",
      "name": "my-server",
      "authorization_token": "Bearer YOUR_TOKEN",
      "tool_configuration": {
        "enabled": true,
        "allowed_tools": ["specific_tool"]
      }
    }
  ]
}
```

**Parameters:**
- `type`: Connection type (`"url"` for HTTP/SSE)
- `url`: MCP server endpoint URL
- `name`: Identifier for this server
- `authorization_token`: Auth token for the server
- `tool_configuration.enabled`: Enable/disable tool use
- `tool_configuration.allowed_tools`: Whitelist specific tools

## Converting MCP Tools to Claude Format

When building your own MCP client with `list_tools()`:

```python
from mcp import ClientSession

async def get_claude_tools(mcp_session: ClientSession):
    """Convert MCP tools to Claude's tool format."""
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

## MCP Architecture

The Model Context Protocol defines three core primitives:

### Tools
Functions Claude can call (like API endpoints):
```json
{
  "name": "search_database",
  "description": "Search the product database",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {"type": "string"}
    },
    "required": ["query"]
  }
}
```

### Resources
Data sources Claude can read:
```json
{
  "uri": "file:///docs/readme.txt",
  "name": "README",
  "mimeType": "text/plain"
}
```

### Prompts
Reusable prompt templates:
```json
{
  "name": "code_review",
  "description": "Review code for issues",
  "arguments": [
    {"name": "language", "description": "Programming language", "required": true}
  ]
}
```

## Python MCP Client Example

```python
import anthropic
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def main():
    # Connect to an MCP server
    server_params = StdioServerParameters(
        command="python",
        args=["-m", "my_mcp_server"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # Get available tools
            tools_result = await session.list_tools()
            claude_tools = [
                {
                    "name": t.name,
                    "description": t.description,
                    "input_schema": t.inputSchema
                }
                for t in tools_result.tools
            ]
            
            # Use Claude with MCP tools
            client = anthropic.Anthropic()
            response = client.messages.create(
                model="claude-opus-4-6",
                max_tokens=1024,
                tools=claude_tools,
                messages=[{"role": "user", "content": "Search for products under $50"}]
            )
            
            # Handle tool calls
            if response.stop_reason == "tool_use":
                for block in response.content:
                    if block.type == "tool_use":
                        result = await session.call_tool(
                            block.name,
                            arguments=block.input
                        )
                        # Continue conversation with result...
```

## Official MCP Resources

- MCP Spec: https://modelcontextprotocol.io
- MCP Python SDK: https://github.com/modelcontextprotocol/python-sdk
- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- MCP Servers (official): https://github.com/modelcontextprotocol/servers

## Related Docs

- [Tool Use Overview](./tool-use-overview.md)
- [Web Search Tool](./web-search-tool.md)
- [Agent Skills](./agent-skills.md)

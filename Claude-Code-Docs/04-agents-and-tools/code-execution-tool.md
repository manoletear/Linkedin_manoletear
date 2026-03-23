# Code Execution Tool

> Source: https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool

The code execution tool allows Claude to run Bash commands and manipulate files in a secure, sandboxed environment. Claude can analyze data, create visualizations, perform calculations, run system commands, and process uploaded files.

**Free when used with web search or web fetch** — no additional charges for code execution when `web_search_20260209` or `web_fetch_20260209` is included.

## Model Compatibility

| Model | Tool Version |
|-------|-------------|
| Claude Opus 4.6 | `code_execution_20250825` |
| Claude Sonnet 4.6 | `code_execution_20250825` |
| Claude Haiku 4.5 | `code_execution_20250825` |
| (Legacy) | `code_execution_20250522` (Python only) |

**Platform availability:** Claude API and Microsoft Azure AI Foundry. Not available on Amazon Bedrock or Google Vertex AI.

## Quick Start

```bash
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-opus-4-6",
    "max_tokens": 4096,
    "messages": [{"role": "user", "content": "Calculate the mean and std dev of [1,2,3,4,5,6,7,8,9,10]"}],
    "tools": [{"type": "code_execution_20250825", "name": "code_execution"}]
  }'
```

## Capabilities

The tool provides Claude with two sub-tools:
- **`bash_code_execution`** — Run shell commands
- **`text_editor_code_execution`** — Create, view, and edit files

### Execute Bash Commands

```bash
# Ask Claude to check system info
{
  "messages": [{"role": "user", "content": "Check the Python version and list installed packages"}],
  "tools": [{"type": "code_execution_20250825", "name": "code_execution"}]
}
```

### Create and Edit Files

```bash
{
  "messages": [{"role": "user", "content": "Create a config.yaml with database settings, then update the port from 5432 to 3306"}],
  "tools": [{"type": "code_execution_20250825", "name": "code_execution"}]
}
```

### Upload and Analyze Files (Files API)

Requires beta header: `"anthropic-beta": "files-api-2025-04-14"`

```bash
# 1. Upload a file
curl https://api.anthropic.com/v1/files \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "anthropic-beta: files-api-2025-04-14" \
  --form 'file=@"data.csv"'

# 2. Use file with code execution
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "anthropic-beta: files-api-2025-04-14" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-opus-4-6",
    "max_tokens": 4096,
    "messages": [{"role": "user", "content": [
      {"type": "text", "text": "Analyze this CSV data"},
      {"type": "container_upload", "file_id": "file_abc123"}
    ]}],
    "tools": [{"type": "code_execution_20250825", "name": "code_execution"}]
  }'
```

## Sandbox Environment

**Runtime:** Python 3.11.12 on Linux x86_64

**Resource limits:**
- Memory: 5 GiB RAM
- Disk: 5 GiB workspace
- CPU: 1 CPU
- Internet: **Completely disabled**
- Container expiration: 30 days

**Pre-installed libraries:**
- Data Science: pandas, numpy, scipy, scikit-learn, statsmodels
- Visualization: matplotlib, seaborn
- File Processing: pyarrow, openpyxl, xlsxwriter, pillow, python-pptx, python-docx, pypdf
- Math: sympy, mpmath
- Utilities: tqdm, python-dateutil, pytz, joblib

## Container Reuse

Maintain state between requests using container IDs:

```bash
# First request - creates a file
response=$(curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model": "claude-opus-4-6", "max_tokens": 4096,
       "messages": [{"role": "user", "content": "Save a random number to /tmp/number.txt"}],
       "tools": [{"type": "code_execution_20250825", "name": "code_execution"}]}')

CONTAINER_ID=$(echo $response | jq -r '.container.id')

# Second request - reuses container to access that file
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d "{
    \"container\": \"$CONTAINER_ID\",
    \"model\": \"claude-opus-4-6\",
    \"max_tokens\": 4096,
    \"messages\": [{\"role\": \"user\", \"content\": \"Read the number and calculate its square\"}],
    \"tools\": [{\"type\": \"code_execution_20250825\", \"name\": \"code_execution\"}]
  }"
```

## Response Format

### Bash Response
```json
{
  "type": "bash_code_execution_tool_result",
  "content": {
    "type": "bash_code_execution_result",
    "stdout": "Python 3.11.12\n...",
    "stderr": "",
    "return_code": 0
  }
}
```

### File Edit Response (str_replace)
```json
{
  "type": "text_editor_code_execution_tool_result",
  "content": {
    "type": "text_editor_code_execution_result",
    "oldStart": 3, "oldLines": 1, "newStart": 3, "newLines": 1,
    "lines": ["- \"debug\": true", "+ \"debug\": false"]
  }
}
```

## Error Codes

| Error Code | Description |
|-----------|-------------|
| `unavailable` | Tool temporarily unavailable |
| `execution_time_exceeded` | Exceeded max time limit |
| `container_expired` | Container expired |
| `invalid_tool_input` | Invalid parameters |
| `too_many_requests` | Rate limit exceeded |
| `file_not_found` | File doesn't exist (text_editor) |
| `string_not_found` | old_str not found (str_replace) |

## Pricing

- **Free** when used with `web_search_20260209` or `web_fetch_20260209`
- **$0.05/hour** per container when used alone
- Minimum billing: 5 minutes
- Free tier: **1,550 hours/month** per organization
- Not ZDR-eligible

## Programmatic Tool Calling

Allow Claude to call your custom tools programmatically:

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=4096,
    messages=[{"role": "user", "content": "Get weather for 5 cities and find the warmest"}],
    tools=[
        {"type": "code_execution_20250825", "name": "code_execution"},
        {
            "name": "get_weather",
            "description": "Get weather for a city",
            "input_schema": {...},
            "allowed_callers": ["code_execution_20250825"],  # Enable programmatic calling
        },
    ],
)
```

## Related Docs

- [Web Search Tool](./web-search-tool.md)
- [Tool Use Overview](./tool-use-overview.md)
- [Agent Skills](./agent-skills.md)

# Computer Use Tool

> Source: https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool

Claude can interact with computer environments through the computer use tool — providing screenshot capabilities and mouse/keyboard control for autonomous desktop interaction.

**Beta feature** — requires beta header.

## Beta Headers

| Model | Beta Header |
|-------|------------|
| Claude Opus 4.6, Sonnet 4.6, Opus 4.5 | `computer-use-2025-11-24` |
| All other supported models | `computer-use-2025-01-24` |

## Tool Versions

| Model | Tool Version |
|-------|-------------|
| Claude Opus 4.6, Sonnet 4.6, Opus 4.5 | `computer_20251124` |
| All other models (Haiku 4.5, Sonnet 4, Opus 4, etc.) | `computer_20250124` |

## Quick Start

```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: computer-use-2025-11-24" \
  -d '{
    "model": "claude-opus-4-6",
    "max_tokens": 1024,
    "tools": [
      {
        "type": "computer_20251124",
        "name": "computer",
        "display_width_px": 1024,
        "display_height_px": 768,
        "display_number": 1
      },
      {"type": "text_editor_20250728", "name": "str_replace_based_edit_tool"},
      {"type": "bash_20250124", "name": "bash"}
    ],
    "messages": [{"role": "user", "content": "Save a picture of a cat to my desktop."}]
  }'
```

## How Computer Use Works

1. You provide the computer use tool + user prompt
2. Claude decides to use the tool → API returns `stop_reason: "tool_use"`
3. You extract action, execute in VM/container, return `tool_result`
4. Claude continues calling tools until task complete ("agent loop")

## Available Actions

### All Versions (`computer_20250124` and `computer_20251124`)
- `screenshot` — Capture current display
- `left_click` — Click at coordinates [x, y]
- `type` — Type text string
- `key` — Press key combination (e.g., "ctrl+s")
- `mouse_move` — Move cursor

### Enhanced (`computer_20250124` only)
- `scroll` — Scroll in any direction
- `left_click_drag` — Click and drag
- `right_click`, `middle_click`
- `double_click`, `triple_click`
- `left_mouse_down`, `left_mouse_up`
- `hold_key` — Hold a key for duration

### Latest (`computer_20251124` only)
All above + `zoom` — View specific screen region at full resolution (requires `enable_zoom: true`)

## Tool Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `type` | Yes | Tool version |
| `name` | Yes | Must be `"computer"` |
| `display_width_px` | Yes | Display width |
| `display_height_px` | Yes | Display height |
| `display_number` | No | X11 display number |
| `enable_zoom` | No | Enable zoom action (v20251124 only) |

## Agent Loop Implementation

```python
async def sampling_loop(model, messages, api_key, tool_version, max_iterations=10):
    client = Anthropic(api_key=api_key)
    beta_flag = "computer-use-2025-11-24" if "20251124" in tool_version else "computer-use-2025-01-24"
    
    tools = [
        {"type": f"computer_{tool_version}", "name": "computer",
         "display_width_px": 1024, "display_height_px": 768},
        {"type": f"text_editor_{tool_version}", "name": "str_replace_editor"},
        {"type": f"bash_{tool_version}", "name": "bash"},
    ]
    
    iterations = 0
    while iterations < max_iterations:
        iterations += 1
        response = client.beta.messages.create(
            model=model, max_tokens=4096,
            messages=messages, tools=tools, betas=[beta_flag]
        )
        
        messages.append({"role": "assistant", "content": response.content})
        
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input)  # YOUR IMPLEMENTATION
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": result
                })
        
        if not tool_results:
            return messages  # Claude finished
        
        messages.append({"role": "user", "content": tool_results})
```

## Coordinate Scaling

For high-res displays, handle coordinate transformation:

```python
import math

def get_scale_factor(width, height):
    long_edge = max(width, height)
    total_pixels = width * height
    long_edge_scale = 1568 / long_edge
    total_pixels_scale = math.sqrt(1_150_000 / total_pixels)
    return min(1.0, long_edge_scale, total_pixels_scale)

# Scale screenshot before sending to Claude
scale = get_scale_factor(screen_width, screen_height)
scaled_screenshot = resize(screenshot, int(screen_width * scale), int(screen_height * scale))

# Scale coordinates back up for execution
def execute_click(x, y):
    perform_click(x / scale, y / scale)
```

## Pricing

- System prompt overhead: 466-499 tokens added
- Input tokens per tool definition: **735 tokens** (Claude 4.x, Sonnet 3.7)
- Additional: screenshot images (vision pricing) + tool results

## Security Considerations

- Use dedicated VM/container with minimal privileges
- Avoid providing access to sensitive accounts/data
- Limit internet access to allowlist domains
- Enable human confirmation for consequential actions
- Be aware of prompt injection risk from web content
- Classifiers run automatically to detect prompt injections

## Prompting Tips

- Specify simple, well-defined tasks with explicit steps
- After each step: "Take a screenshot and evaluate if outcome is correct"
- Use keyboard shortcuts for tricky UI elements (dropdowns, scrollbars)
- Include example screenshots of successful outcomes for repeatable tasks

## Related Docs

- [Tool Use Overview](./tool-use-overview.md)
- [Code Execution Tool](./code-execution-tool.md)
- [Extended Thinking](../03-build-with-claude/extended-thinking.md)

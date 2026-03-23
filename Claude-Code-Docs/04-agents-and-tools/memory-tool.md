# Memory Tool

> Source: https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool

The memory tool enables Claude to store and retrieve information across conversations through a memory file directory. Claude can create, read, update, and delete files that persist between sessions, allowing it to build knowledge over time without keeping everything in the context window.

## Overview

The memory tool is the key primitive for **just-in-time context retrieval**: rather than loading all relevant information upfront, agents store what they learn in memory and pull it back on demand. This keeps the active context focused on what is currently relevant — critical for long-running workflows.

The memory tool operates **client-side**: you control where and how the data is stored through your own infrastructure.

## Use Cases

- Maintain project context across multiple agent executions
- Learn from past interactions, decisions, and feedback
- Build knowledge bases over time
- Enable cross-conversation learning where Claude improves at recurring workflows

## Supported Models

- Claude Opus 4.6 (claude-opus-4-6)
- Claude Opus 4.5 (claude-opus-4-5-20251101)
- Claude Opus 4.1 (claude-opus-4-1-20250805)
- Claude Opus 4 (claude-opus-4-20250514)
- Claude Sonnet 4.6 (claude-sonnet-4-6)
- Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- Claude Sonnet 4 (claude-sonnet-4-20250514)
- Claude Haiku 4.5 (claude-haiku-4-5-20251001)

## Getting Started

### Basic Usage

```bash
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: $ANTHROPIC_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-opus-4-6",
    "max_tokens": 2048,
    "messages": [
      {
        "role": "user",
        "content": "Help me debug this Python function..."
      }
    ],
    "tools": [{"type": "memory_20250818", "name": "memory"}]
  }'
```

### Python SDK

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=2048,
    messages=[{
        "role": "user",
        "content": "Help me continue the project we were working on."
    }],
    tools=[{"type": "memory_20250818", "name": "memory"}]
)

# Claude will automatically check /memories before starting
print(response.content[0].text)
```

## How It Works

When enabled, Claude automatically:
1. Checks the `/memories` directory before starting tasks
2. Reads relevant memory files to restore context
3. Creates/updates memory files as it works
4. References those memories in future conversations

### Example Interaction Flow

**1. User request:**
```
Help me respond to this customer service ticket.
```

**2. Claude checks memory directory:**
```json
{
  "type": "tool_use",
  "name": "memory",
  "input": {
    "command": "view",
    "path": "/memories"
  }
}
```

**3. Application returns directory listing:**
```
Here are the files in /memories:
1.5K  /memories/customer_service_guidelines.xml
2.0K  /memories/refund_policies.xml
```

**4. Claude reads relevant files and uses context to help the user.**

## Tool Commands

Your client-side implementation handles these memory commands:

### view - Read Files or Directories

```json
{
  "command": "view",
  "path": "/memories",
  "view_range": [1, 10]
}
```

**Directory response:**
```
Here are the files and directories up to 2 levels deep in /memories:
4.0K  /memories
1.5K  /memories/project_notes.xml
2.0K  /memories/preferences.txt
```

**File response:**
```
Here's the content of /memories/notes.txt with line numbers:
     1  Hello World
     2  This is line two
```

### create - Create New File

```json
{
  "command": "create",
  "path": "/memories/project_notes.txt",
  "file_text": "Project: web scraper\nStatus: debugging timeout error\n"
}
```
Response: `File created successfully at: /memories/project_notes.txt`

### str_replace - Replace Text

```json
{
  "command": "str_replace",
  "path": "/memories/preferences.txt",
  "old_str": "Favorite color: blue",
  "new_str": "Favorite color: green"
}
```
Response: `The memory file has been edited.` + snippet of edited content

### insert - Insert at Line

```json
{
  "command": "insert",
  "path": "/memories/todo.txt",
  "insert_line": 2,
  "insert_text": "- Review memory tool documentation\n"
}
```

### delete - Delete File or Directory

```json
{
  "command": "delete",
  "path": "/memories/old_file.txt"
}
```
Response: `Successfully deleted /memories/old_file.txt`

### rename - Rename or Move

```json
{
  "command": "rename",
  "old_path": "/memories/draft.txt",
  "new_path": "/memories/final.txt"
}
```

## Client-Side Implementation

You must implement handlers for each memory command:

```python
import os
from pathlib import Path

MEMORY_DIR = Path('./memories')
MEMORY_DIR.mkdir(exist_ok=True)

def handle_memory_command(tool_input: dict) -> str:
    command = tool_input.get('command')
    path_str = tool_input.get('path', '')

    # SECURITY: Validate path stays within /memories
    path = Path(path_str)
    resolved = (MEMORY_DIR / path.relative_to('/memories')).resolve()
    if not str(resolved).startswith(str(MEMORY_DIR.resolve())):
        return 'Error: Path traversal not allowed'

    if command == 'view':
        if resolved.is_dir():
            files = list(resolved.rglob('*'))
            listing = f'Files in {path_str}:\n'
            for f in files[:50]:  # Limit listing
                size = f.stat().st_size if f.is_file() else 0
                listing += f'{size}\t{f}\n'
            return listing
        elif resolved.is_file():
            content = resolved.read_text()
            lines = content.split('\n')
            numbered = '\n'.join(f'{i+1:6d}\t{line}' for i, line in enumerate(lines))
            return f'Content of {path_str}:\n{numbered}'
        return f'The path {path_str} does not exist.'

    elif command == 'create':
        if resolved.exists():
            return f'Error: File {path_str} already exists'
        resolved.parent.mkdir(parents=True, exist_ok=True)
        resolved.write_text(tool_input.get('file_text', ''))
        return f'File created successfully at: {path_str}'

    elif command == 'str_replace':
        if not resolved.exists():
            return f'Error: The path {path_str} does not exist.'
        content = resolved.read_text()
        old_str = tool_input['old_str']
        new_str = tool_input['new_str']
        occurrences = content.count(old_str)
        if occurrences == 0:
            return f'No replacement was performed, old_str did not appear in {path_str}.'
        if occurrences > 1:
            return f'No replacement was performed. Multiple occurrences found.'
        resolved.write_text(content.replace(old_str, new_str, 1))
        return 'The memory file has been edited.'

    elif command == 'delete':
        if not resolved.exists():
            return f'Error: The path {path_str} does not exist'
        if resolved.is_file():
            resolved.unlink()
        else:
            import shutil
            shutil.rmtree(resolved)
        return f'Successfully deleted {path_str}'

    elif command == 'insert':
        if not resolved.exists():
            return f'Error: The path {path_str} does not exist'
        lines = resolved.read_text().split('\n')
        insert_line = tool_input.get('insert_line', 0)
        insert_text = tool_input.get('insert_text', '')
        lines.insert(insert_line, insert_text.rstrip('\n'))
        resolved.write_text('\n'.join(lines))
        return f'The file {path_str} has been edited.'

    elif command == 'rename':
        old_path = Path(tool_input['old_path'])
        new_path = Path(tool_input['new_path'])
        # Validate both paths
        old_resolved = (MEMORY_DIR / old_path.relative_to('/memories')).resolve()
        new_resolved = (MEMORY_DIR / new_path.relative_to('/memories')).resolve()
        if not old_resolved.exists():
            return f'Error: The path {old_path} does not exist'
        if new_resolved.exists():
            return f'Error: The destination {new_path} already exists'
        old_resolved.rename(new_resolved)
        return f'Successfully renamed {old_path} to {new_path}'

    return f'Unknown command: {command}'

# Process Claude tool calls in a loop
def run_with_memory(user_message: str):
    import anthropic
    client = anthropic.Anthropic()
    messages = [{'role': 'user', 'content': user_message}]

    while True:
        response = client.messages.create(
            model='claude-opus-4-6',
            max_tokens=2048,
            messages=messages,
            tools=[{'type': 'memory_20250818', 'name': 'memory'}]
        )

        if response.stop_reason == 'end_turn':
            return response.content[-1].text

        # Handle tool calls
        tool_results = []
        for block in response.content:
            if block.type == 'tool_use' and block.name == 'memory':
                result = handle_memory_command(block.input)
                tool_results.append({
                    'type': 'tool_result',
                    'tool_use_id': block.id,
                    'content': result
                })

        # Add assistant response and tool results to conversation
        messages.append({'role': 'assistant', 'content': response.content})
        messages.append({'role': 'user', 'content': tool_results})
```

## Using with Context Editing

Combine memory with context editing for long-running workflows:

```python
response = client.messages.create(
    model='claude-opus-4-6',
    max_tokens=4096,
    messages=[...],
    tools=[
        {'type': 'memory_20250818', 'name': 'memory'},
    ],
    context_management={
        'edits': [
            {
                'type': 'clear_tool_uses_20250919',
                'trigger': {'type': 'input_tokens', 'value': 100000},
                'keep': {'type': 'tool_uses', 'value': 3},
            }
        ]
    },
)

# Exclude memory tool calls from being cleared
context_management = {
    'edits': [{'type': 'clear_tool_uses_20250919', 'exclude_tools': ['memory']}]
}
```

When context approaches the threshold, Claude automatically saves progress to memory before tool results are cleared.

## Multi-Session Development Pattern

For long-running software projects spanning multiple sessions:

```python
# Session initialization script
def initialize_project_memory(project_name: str, features: list):
    memory_content = f'''<project>
  <name>{project_name}</name>
  <status>in_progress</status>
  <features>

  </features>
  <progress_log>
    <entry date='day1'>Project initialized</entry>
  </progress_log>
  <next_steps>
    <step>Implement feature 1</step>
  </next_steps>
</project>'''
    with open('./memories/project_state.xml', 'w') as f:
        f.write(memory_content)

# Each session: Claude reads project_state.xml first,
# works on one feature at a time,
# and updates progress_log before ending.
```

**Key principle:** Work on one feature at a time. Only mark complete after end-to-end verification.

## Prompting Guidance

This instruction is automatically included when memory tool is enabled:

```
IMPORTANT: ALWAYS VIEW YOUR MEMORY DIRECTORY BEFORE DOING ANYTHING ELSE.
MEMORY PROTOCOL:
1. Use the view command to check for earlier progress.
2. ... (work on the task) ...
   - As you make progress, record status/progress/thoughts in your memory.
ASSUME INTERRUPTION: Your context window might be reset at any moment.
```

### Custom Memory Guidance

You can add instructions to guide what Claude writes to memory:

```python
system = '''You are a software development assistant.
When editing your memory folder, keep it organized and up-to-date.
Only write down information relevant to the current project.
Delete files that are no longer relevant.
Do not create new files unless necessary.'''
```

## Security Considerations

### Path Traversal Protection (Critical)

```python
from pathlib import Path

MEMORY_DIR = Path('./memories').resolve()

def validate_path(path_str: str) -> Path:
    # Resolve the path and verify it stays within /memories
    target = (MEMORY_DIR / Path(path_str).relative_to('/memories')).resolve()
    if not str(target).startswith(str(MEMORY_DIR)):
        raise ValueError(f'Path traversal attempt: {path_str}')
    return target
```

### Other Security Best Practices

- **Sensitive information**: Claude usually refuses to write PII/secrets to memory, but add validation to strip sensitive data
- **File size limits**: Track file sizes and prevent unlimited growth
- **Memory expiration**: Clear files periodically that haven't been accessed recently
- **Zero Data Retention**: This feature is eligible for ZDR when your organization has that arrangement

## Related Documentation

- [Tool Use Overview](tool-use-overview.md)
- [Agent Skills](agent-skills.md)
- [Computer Use](computer-use.md)
- [Prompt Engineering Best Practices](../05-prompt-engineering/best-practices.md)

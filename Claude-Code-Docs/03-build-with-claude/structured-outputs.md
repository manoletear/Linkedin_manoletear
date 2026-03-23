# Structured Outputs

> Source: https://platform.claude.com/docs/en/build-with-claude/structured-outputs

Structured outputs provide guaranteed schema conformance for Claude's responses, ensuring JSON outputs always match your defined schema.

## Overview

There are two modes of structured outputs:
1. **JSON Outputs** — Claude's entire response is a valid JSON object matching your schema
2. **Strict Tool Use** — Tool call inputs always match the tool's input schema

Both require the beta header: `structured-outputs-2025-11-13`

Currently supported on: Claude Sonnet 4.5, Claude Opus 4.1, Claude Haiku 4.5 (and newer models).

## JSON Outputs

Force Claude to respond with a JSON object conforming to your schema:

```python
import anthropic
import json

client = anthropic.Anthropic()

response = client.beta.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    betas=["structured-outputs-2025-11-13"],
    messages=[
        {
            "role": "user",
            "content": "Extract the person's information from: John Smith, 30 years old, software engineer at TechCorp in San Francisco."
        }
    ],
    json_schema={
        "name": "person_info",
        "description": "Extracted person information",
        "schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Full name"},
                "age": {"type": "integer", "description": "Age in years"},
                "occupation": {"type": "string", "description": "Job title"},
                "company": {"type": "string", "description": "Employer name"},
                "city": {"type": "string", "description": "City of residence"}
            },
            "required": ["name", "age", "occupation"],
            "additionalProperties": false
        }
    }
)

# Response is guaranteed to be valid JSON matching the schema
person_data = json.loads(response.content[0].text)
print(f"Name: {person_data['name']}")
print(f"Age: {person_data['age']}")
```

## Strict Tool Use

Guarantee that tool call inputs always match the schema exactly:

```python
response = client.beta.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    betas=["structured-outputs-2025-11-13"],
    tools=[
        {
            "name": "create_calendar_event",
            "description": "Create a calendar event",
            "strict": True,  # Enable strict mode
            "input_schema": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "date": {"type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$"},
                    "duration_minutes": {"type": "integer", "minimum": 15, "maximum": 480},
                    "attendees": {
                        "type": "array",
                        "items": {"type": "string", "format": "email"}
                    }
                },
                "required": ["title", "date", "duration_minutes"],
                "additionalProperties": false
            }
        }
    ],
    messages=[
        {"role": "user", "content": "Schedule a 1-hour meeting tomorrow with alice@example.com and bob@example.com to discuss Q4 planning."}
    ]
)
```

## JSON Schema Types Supported

Structured outputs support the following JSON Schema types:

| Type | Description |
|------|-------------|
| `string` | Text values |
| `number` | Numeric values (integer or float) |
| `integer` | Integer values only |
| `boolean` | `true` or `false` |
| `array` | List of values |
| `object` | Key-value pairs |
| `null` | Null value |

## Schema Constraints

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": ["pending", "active", "completed"]  // Enum constraint
    },
    "priority": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10        // Range constraint
    },
    "tags": {
      "type": "array",
      "items": {"type": "string"},
      "minItems": 1,
      "maxItems": 5        // Length constraints
    },
    "description": {
      "type": "string",
      "maxLength": 500     // String length constraint
    }
  },
  "required": ["status", "priority"],
  "additionalProperties": false  // No extra fields allowed
}
```

## Nested Objects

```python
schema = {
    "name": "order_data",
    "schema": {
        "type": "object",
        "properties": {
            "order_id": {"type": "string"},
            "customer": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "email": {"type": "string"}
                },
                "required": ["name", "email"],
                "additionalProperties": False
            },
            "items": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "product_id": {"type": "string"},
                        "quantity": {"type": "integer"},
                        "price": {"type": "number"}
                    },
                    "required": ["product_id", "quantity", "price"],
                    "additionalProperties": False
                }
            },
            "total": {"type": "number"}
        },
        "required": ["order_id", "customer", "items", "total"],
        "additionalProperties": False
    }
}
```

## When to Use Structured Outputs

**Use JSON Outputs when:**
- You need the entire response as structured data
- Processing outputs programmatically
- Building pipelines that depend on consistent schemas
- Extracting information from text

**Use Strict Tool Use when:**
- You have tools with complex input requirements
- Your application cannot handle schema violations
- Building production agents where invalid inputs would cause failures

## Without Structured Outputs (Alternative)

If not using structured outputs beta, prompt Claude to return JSON:

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": """Extract person info and return ONLY a JSON object with fields:
        name (string), age (integer), occupation (string)
        
        Text: John Smith, 30, software engineer
        
        Return only the JSON, no other text."""
    }]
)
# Note: Without structured outputs, you need to handle potential formatting issues
import json
try:
    data = json.loads(response.content[0].text)
except json.JSONDecodeError:
    # Handle cases where Claude didn't return pure JSON
    pass
```

## Related Docs

- [Tool Use Overview](../04-agents-and-tools/tool-use-overview.md)
- [Working with Messages](./working-with-messages.md)
- [Messages API Reference](../06-api-reference/messages-api.md)

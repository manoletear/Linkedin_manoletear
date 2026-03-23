# Workspaces

> Source: https://platform.claude.com/docs/en/build-with-claude/workspaces

Workspaces allow organizations to segment API usage, set custom rate limits, manage API keys, and control costs across different projects and teams.

## Overview

A workspace is an isolated environment within your organization:
- Each workspace has its own API keys
- Individual rate limits and spend caps
- Separate cache isolation (from Feb 2026)
- Visible usage metrics per workspace

## Creating and Managing Workspaces

Workspaces are managed via the **Admin API** (requires an admin API key with elevated permissions).

### Create a Workspace

```bash
curl https://api.anthropic.com/v1/organizations/workspaces \
  -H "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "name": "production-team"
  }'
```

### List Workspaces

```bash
curl https://api.anthropic.com/v1/organizations/workspaces \
  -H "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  -H "anthropic-version: 2023-06-01"
```

### Get Workspace Details

```bash
curl https://api.anthropic.com/v1/organizations/workspaces/{workspace_id} \
  -H "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  -H "anthropic-version: 2023-06-01"
```

## API Keys per Workspace

Each workspace can have multiple API keys:

```bash
# Create API key for a workspace
curl https://api.anthropic.com/v1/organizations/workspaces/{workspace_id}/api-keys \
  -H "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "name": "production-key"
  }'
```

API keys created for a workspace are automatically scoped to that workspace — all requests using that key count against the workspace's limits.

## Workspace Rate Limits

You can set custom rate limits per workspace to protect against overuse:

```bash
curl -X PATCH https://api.anthropic.com/v1/organizations/workspaces/{workspace_id} \
  -H "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "limits": {
      "input_tokens_per_minute": 30000,
      "output_tokens_per_minute": 8000,
      "requests_per_minute": 50
    }
  }'
```

**Important rules:**
- Workspace limits cannot exceed organization limits
- The default workspace cannot have custom limits set
- Organization-wide limits always apply regardless of workspace limits

## Workspace Spend Limits

Protect against overspending per workspace:

```
Organization limit: $200,000/month
  ├── Production workspace: $100,000/month
  ├── Staging workspace: $10,000/month
  ├── Dev workspace: $5,000/month
  └── Default workspace: (remaining budget)
```

## Admin API — User Management

Assign users to workspaces with roles:

```bash
# Add user to workspace
curl https://api.anthropic.com/v1/organizations/workspaces/{workspace_id}/members \
  -H "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "user_id": "user_xyz",
    "role": "developer"
  }'
```

**Workspace roles:**
- `admin` — Full workspace access including billing and member management
- `developer` — Can create/view API keys and access usage data
- `viewer` — Read-only access to workspace data

## Cache Isolation

Starting February 5, 2026, prompt caches are isolated per workspace:
- Caches are NOT shared between workspaces
- Even with identical prompts, different workspaces have separate caches
- This applies to: Claude API and Azure AI Foundry
- Amazon Bedrock and Google Vertex AI maintain organization-level isolation

## Usage Monitoring per Workspace

View workspace usage in the Claude Console:
1. Navigate to **Settings > Workspaces**
2. Select a workspace
3. View the **Usage** tab for detailed metrics

Via API:
```bash
curl https://api.anthropic.com/v1/organizations/workspaces/{workspace_id}/usage \
  -H "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  -H "anthropic-version: 2023-06-01"
```

## Python SDK Example

```python
import anthropic

# Admin client for workspace management
admin_client = anthropic.Anthropic(api_key="your-admin-key")

# List workspaces
workspaces = admin_client.admin.workspaces.list()
for workspace in workspaces.data:
    print(f"{workspace.name}: {workspace.id}")

# Create workspace
new_workspace = admin_client.admin.workspaces.create(
    name="new-team-workspace"
)

# Create API key for workspace
api_key = admin_client.admin.api_keys.create(
    workspace_id=new_workspace.id,
    name="team-api-key"
)
print(f"New key: {api_key.key}")  # Store securely — only shown once

# Regular client using workspace-scoped key
workspace_client = anthropic.Anthropic(api_key=api_key.key)
response = workspace_client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## Best Practices

1. **Separate environments** — Use different workspaces for dev, staging, and production
2. **Dedicated API keys** — Create separate keys per application/service
3. **Set conservative limits first** — Increase as needed rather than starting too high
4. **Monitor usage** — Check the Usage page regularly to track spend per workspace
5. **Rotate API keys** — Periodically create new keys and delete old ones

## Related Docs

- [Rate Limits](../06-api-reference/rate-limits.md)
- [Messages API](../06-api-reference/messages-api.md)
- [Prompt Caching](./prompt-caching.md)

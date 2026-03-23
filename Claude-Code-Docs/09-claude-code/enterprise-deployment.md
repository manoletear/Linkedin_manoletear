# Claude Code Enterprise Deployment

> Source: https://code.claude.com/docs/en/third-party-integrations

Organizations can deploy Claude Code through Anthropic directly or through a cloud provider.

## Deployment Options

| Feature | Claude Teams/Enterprise | Anthropic Console | Amazon Bedrock | Google Vertex AI | Microsoft Foundry |
|---------|------------------------|-------------------|----------------|-----------------|-------------------|
| Best for | Most organizations (recommended) | Individual developers | AWS-native | GCP-native | Azure-native |
| Billing | Teams: $150/seat (Premium), Enterprise: Contact Sales | PAYG | PAYG through AWS | PAYG through GCP | PAYG through Azure |
| Includes Claude on web | Yes | No | No | No | No |
| Enterprise features | Team management, SSO, usage monitoring | None | IAM policies | IAM roles | RBAC policies |

**Claude for Teams** — self-service, includes collaboration features, admin tools, billing management. Best for smaller teams.

**Claude for Enterprise** — adds SSO and domain capture, role-based permissions, compliance API access, managed policy settings. Best for larger organizations.

## Proxies and Gateways

**Corporate proxy** — routes traffic through HTTP/HTTPS proxy:
```bash
export HTTPS_PROXY='https://proxy.example.com:8080'
```

**LLM Gateway** — sits between Claude Code and the cloud provider:
```bash
export ANTHROPIC_BASE_URL='https://your-llm-gateway.com'
```

### Amazon Bedrock
```bash
# Enable Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Corporate proxy
export HTTPS_PROXY='https://proxy.example.com:8080'

# OR LLM Gateway
export ANTHROPIC_BEDROCK_BASE_URL='https://your-llm-gateway.com/bedrock'
export CLAUDE_CODE_SKIP_BEDROCK_AUTH=1  # If gateway handles AWS auth
```

### Google Vertex AI
```bash
# Enable Vertex
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=us-east5
export ANTHROPIC_VERTEX_PROJECT_ID=your-project-id

# Corporate proxy
export HTTPS_PROXY='https://proxy.example.com:8080'

# OR LLM Gateway
export ANTHROPIC_VERTEX_BASE_URL='https://your-llm-gateway.com/vertex'
export CLAUDE_CODE_SKIP_VERTEX_AUTH=1
```

### Microsoft Foundry
```bash
# Enable Microsoft Foundry
export CLAUDE_CODE_USE_FOUNDRY=1
export ANTHROPIC_FOUNDRY_RESOURCE=your-resource
export ANTHROPIC_FOUNDRY_API_KEY=your-api-key

# Corporate proxy
export HTTPS_PROXY='https://proxy.example.com:8080'

# OR LLM Gateway
export ANTHROPIC_FOUNDRY_BASE_URL='https://your-llm-gateway.com'
export CLAUDE_CODE_SKIP_FOUNDRY_AUTH=1
```

## Best Practices for Organizations

### Invest in Documentation and Memory
Deploy CLAUDE.md files at multiple levels:
- **Organization-wide**: `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS)
- **Repository-level**: `CLAUDE.md` in repository roots with project architecture, build commands, and contribution guidelines

### Simplify Deployment
Create a "one click" way to install Claude Code to grow adoption across the organization.

### Start with Guided Usage
Encourage new users to start with codebase Q&A or smaller bug fixes before letting Claude Code run more agentically.

### Pin Model Versions for Cloud Providers
```bash
export ANTHROPIC_DEFAULT_OPUS_MODEL=claude-opus-4-6
export ANTHROPIC_DEFAULT_SONNET_MODEL=claude-sonnet-4-6
export ANTHROPIC_DEFAULT_HAIKU_MODEL=claude-haiku-4-6
```
Without pinning, aliases resolve to the latest version, which can break users when a new model is released.

### Configure Security Policies
Security teams can configure managed permissions for what Claude Code is and is not allowed to do, which cannot be overwritten by local configuration.

### Leverage MCP for Integrations
Configure MCP servers centrally and check a `.mcp.json` configuration into the codebase so all users benefit.

## Related Documentation

- [Settings](./settings.md)
- [How Claude Code Works](./how-it-works.md)
- [Remote Control](./remote-control.md)

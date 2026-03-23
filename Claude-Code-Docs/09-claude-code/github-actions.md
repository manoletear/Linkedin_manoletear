# Claude Code GitHub Actions

> Source: https://code.claude.com/docs/en/github-actions

Claude Code GitHub Actions brings AI-powered automation to your GitHub workflow. With a simple `@claude` mention in any PR or issue, Claude can analyze your code, create pull requests, implement features, and fix bugs.

## Setup

### Quick Setup
```bash
# In Claude Code terminal, run:
/install-github-app
```
This guides you through setting up the GitHub app and required secrets. (Requires repository admin and direct Claude API — not Bedrock/Vertex.)

### Manual Setup
1. Install the Claude GitHub app: https://github.com/apps/claude
2. Add `ANTHROPIC_API_KEY` to your repository secrets
3. Copy the workflow file from `examples/claude.yml` into `.github/workflows/`

## Basic Workflow

```yaml
name: Claude Code
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          # Responds to @claude mentions in comments
```

## Common Examples

### Automated PR Review
```yaml
name: Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "Review this pull request for code quality, correctness, and security."
          claude_args: "--max-turns 5"
```

### Scheduled Automation
```yaml
name: Daily Report
on:
  schedule:
    - cron: "0 9 * * *"

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "Generate a summary of yesterday's commits and open issues"
          claude_args: "--model opus"
```

## In Issue or PR Comments

```
@claude implement this feature based on the issue description
@claude how should I implement user authentication for this endpoint?
@claude fix the TypeError in the user dashboard component
```

## Action Parameters (v1)

| Parameter | Description | Required |
|-----------|-------------|----------|
| `prompt` | Instructions for Claude | No* |
| `claude_args` | CLI arguments passed to Claude Code | No |
| `anthropic_api_key` | Claude API key | Yes** |
| `github_token` | GitHub token for API access | No |
| `trigger_phrase` | Custom trigger phrase (default: `@claude`) | No |
| `use_bedrock` | Use AWS Bedrock instead of Claude API | No |
| `use_vertex` | Use Google Vertex AI instead of Claude API | No |

**Common `claude_args`:**
- `--max-turns 5` — Maximum conversation turns
- `--model claude-sonnet-4-6` — Model to use
- `--mcp-config /path/to/config.json` — MCP configuration
- `--allowed-tools` — Comma-separated list of allowed tools

## Using with AWS Bedrock

```yaml
name: Claude PR Action
permissions:
  contents: write
  pull-requests: write
  issues: write
  id-token: write

on:
  issue_comment:
    types: [created]

jobs:
  claude-pr:
    runs-on: ubuntu-latest
    env:
      AWS_REGION: us-west-2
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Configure AWS Credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: us-west-2
      - uses: anthropics/claude-code-action@v1
        with:
          use_bedrock: "true"
          claude_args: "--model us.anthropic.claude-sonnet-4-6 --max-turns 10"
```

## Using with Google Vertex AI

```yaml
name: Claude PR Action
permissions:
  contents: write
  pull-requests: write
  id-token: write

on:
  issue_comment:
    types: [created]

jobs:
  claude-pr:
    runs-on: ubuntu-latest
    steps:
      - name: Authenticate to Google Cloud
        id: auth
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}
      - uses: anthropics/claude-code-action@v1
        with:
          use_vertex: "true"
          claude_args: "--model claude-sonnet-4@20250514 --max-turns 10"
        env:
          ANTHROPIC_VERTEX_PROJECT_ID: ${{ steps.auth.outputs.project_id }}
          CLOUD_ML_REGION: us-east5
```

## Upgrading from Beta to v1

| Old Beta Input | New v1.0 Input |
|----------------|----------------|
| `mode` | (Removed - auto-detected) |
| `direct_prompt` | `prompt` |
| `custom_instructions` | `claude_args: --append-system-prompt` |
| `max_turns` | `claude_args: --max-turns` |
| `model` | `claude_args: --model` |
| `allowed_tools` | `claude_args: --allowedTools` |

## Security Best Practices

- **Never commit API keys directly** — use GitHub Secrets
- Reference secrets in workflows: `anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}`
- Limit action permissions to only what is necessary
- Review Claude's suggestions before merging

## Related Documentation

- [Common Workflows](./common-workflows.md)
- [Best Practices](./best-practices.md)
- [Enterprise Deployment](./enterprise-deployment.md)
- [Sub-Agents](./sub-agents.md)

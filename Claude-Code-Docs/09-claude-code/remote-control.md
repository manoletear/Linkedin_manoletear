# Claude Code Remote Control

> Source: https://code.claude.com/docs/en/remote-control

Remote Control connects claude.ai/code or the Claude app for iOS and Android to a Claude Code session running on your machine. Start a task at your desk, then pick it up from your phone or another computer.

**Key feature:** When you start a Remote Control session, Claude keeps running locally the entire time — nothing moves to the cloud.

**Requirements:**
- Claude Code v2.1.51 or later (`claude --version`)
- Subscription: Pro, Max, Team, or Enterprise plans (Team/Enterprise requires admin to enable the toggle)
- Authentication: `claude` then `/login` to sign in through claude.ai
- Workspace trust: run `claude` in your project directory at least once to accept the workspace trust dialog

## Start a Remote Control Session

### Server Mode (Dedicated Remote Control)
```bash
claude remote-control

# With options
claude remote-control --name "My Project"          # Custom session title
claude remote-control --spawn worktree             # Each session gets its own git worktree
claude remote-control --capacity 10                # Max 10 concurrent sessions
claude remote-control --verbose                    # Show detailed logs
claude remote-control --sandbox                    # Enable filesystem/network isolation
```

### Interactive Session with Remote Control
```bash
claude --remote-control
# or
claude --rc

# With custom name
claude --remote-control "My Project"
```

### From an Existing Session
```
/remote-control
# or
/rc

# With custom name
/remote-control My Project
```

## Connect from Another Device

1. **Open the session URL** — displayed in terminal when session starts
2. **Scan the QR code** — press spacebar to toggle QR code display (server mode)
3. **Open claude.ai/code** — find session by name in the session list (Remote Control sessions show a computer icon with green dot)

## Enable Remote Control for All Sessions

To enable automatically for every interactive session:
```
/config  → set "Enable Remote Control for all sessions" to true
```

## Connection and Security

- Makes outbound HTTPS requests only — never opens inbound ports
- Registers with the Anthropic API and polls for work
- All traffic travels over TLS through the Anthropic API
- Uses multiple short-lived credentials, each scoped to a single purpose

## Remote Control vs Claude Code on the Web

| | Remote Control | Claude Code on Web |
|-|---------------|-------------------|
| Where it runs | Your machine (local) | Anthropic cloud infrastructure |
| Local MCP servers | Yes | No |
| Local filesystem | Yes | No |
| Local tools | Yes | No |
| Use case | Continue local work from another device | Start task without local setup |

## Limitations

- **One remote session per interactive process** — use server mode with `--spawn` for multiple concurrent sessions
- **Terminal must stay open** — if you close the terminal, the session ends
- **Extended network outage** — if your machine is offline for more than ~10 minutes, the session times out

## Troubleshooting

**"Remote Control is not yet enabled for your account"**
- Unset `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` or `DISABLE_TELEMETRY`
- Remote Control requires claude.ai authentication (not Bedrock/Vertex/Foundry)
- Run `/logout` then `/login` to refresh

**"Remote Control is disabled by your organization's policy"**
- If using API key: Remote Control requires claude.ai OAuth. Run `/login` and choose the claude.ai option
- On Team/Enterprise: Admin must enable Remote Control in `claude.ai/admin-settings/claude-code`

**"Remote credentials fetch failed"**
```bash
claude remote-control --verbose  # See full error
```
- Check you are signed in: `claude` then `/login`
- Check firewall/proxy is not blocking outbound HTTPS on port 443

## Related Documentation

- [CLI Reference](./cli-reference.md)
- [Settings](./settings.md)
- [Enterprise Deployment](./enterprise-deployment.md)

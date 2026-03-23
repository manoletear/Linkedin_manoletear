# Building with Remotion and AI

> Source: https://www.remotion.dev/docs/ai

Here are ways to use AI in your Remotion workflow:

## AI Integration Options

- **Claude Code** - Use Claude Code to prompt Remotion videos
- **Chatbot** - Get help with Remotion from the built-in chatbot
- **MCP** - Get Remotion-domain specific help from LLMs via Model Context Protocol
- **Bolt.new** - Use Bolt.new to prompt Remotion videos
- **System Prompt** - Teach LLMs Remotion rules via system prompts
- **Agent Skills** - Skill files for Claude Code, Codex, and other AI agents
- **Code generation with LLMs** - Generate Remotion code by invoking AI
- **Just-in-time compilation** - Compile a Remotion component in JavaScript
- **AI SaaS Template** - Template for "Prompt to Motion Graphics" products
- **Prompt to Video** - Template that turns prompts into videos with script, images, and voiceover

## AI-Ready Documentation

Remotion docs are optimized for AI agents:

- **Copy as Markdown**: Click the copy button on any doc page to copy raw markdown
- **Markdown URLs**: Add `.md` to any doc URL (e.g., `remotion.dev/docs/player.md`) to view/fetch raw markdown
- **Content negotiation**: Remotion docs respect the `Accept` header - request `text/markdown` to get markdown instead of HTML

Paste any Remotion doc link into Claude Code, opencode, or other AI coding agents and they will automatically fetch the markdown version.

## Using Claude Code with Remotion

```bash
# Install agent skills for Remotion
npx remotion skills

# Then use Claude Code to generate/modify Remotion compositions
claude "Create a Remotion composition that shows text animating in"
```

## MCP Integration

Remotion provides an MCP (Model Context Protocol) server for LLM-powered development.
This gives AI agents access to Remotion-specific knowledge and APIs.

## Related

- [Getting Started](./getting-started.md)
- [The Fundamentals](./the-fundamentals.md)
- [CLI Reference](./cli-reference.md)
- [Parameterized Rendering](./parameterized-rendering.md)

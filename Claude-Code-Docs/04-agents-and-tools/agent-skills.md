# Agent Skills

> Source: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

Agent Skills are modular capabilities that extend Claude's functionality. Each Skill packages instructions, metadata, and optional resources (scripts, templates) that Claude uses automatically when relevant.

## Why Use Skills?

Skills provide domain-specific expertise — workflows, context, and best practices — that transform general-purpose agents into specialists. Unlike prompts (one-off instructions), Skills load on-demand and eliminate repeated guidance across conversations.

**Benefits:** Specialize Claude for domains, reduce repetition, compose capabilities by combining Skills.

## Pre-built Agent Skills

| Skill ID | Capability |
|----------|-----------|
| `pptx` | Create/edit PowerPoint presentations |
| `xlsx` | Create spreadsheets, analyze data, generate charts |
| `docx` | Create/edit Word documents |
| `pdf` | Generate formatted PDF documents |

Available on Claude API and claude.ai.

## How Skills Work: Three Loading Levels

### Level 1: Metadata (always loaded, ~100 tokens per Skill)
YAML frontmatter — provides discovery info to decide when to trigger:
```yaml
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files.
---
```

### Level 2: Instructions (loaded when triggered, <5k tokens)
Main body of SKILL.md with workflows and best practices:
```markdown
# PDF Processing
## Quick start
Use pdfplumber to extract text from PDFs...
```

### Level 3: Resources (loaded as needed, effectively unlimited)
Additional files loaded only when referenced:
```
pdf-skill/
├── SKILL.md          (main instructions)
├── FORMS.md          (form-filling guide)
├── REFERENCE.md      (detailed API reference)
└── scripts/
    └── fill_form.py  (utility script)
```

**Key:** Scripts never load their CODE into context — only their output does.

## Using Skills via the Claude API

Requires three beta headers:
```bash
-H "anthropic-beta: code-execution-2025-08-25"
-H "anthropic-beta: skills-2025-10-02"
-H "anthropic-beta: files-api-2025-04-14"
```

Example using a pre-built Excel skill:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: code-execution-2025-08-25,skills-2025-10-02,files-api-2025-04-14" \
  -d '{
    "model": "claude-opus-4-6",
    "max_tokens": 4096,
    "container": {
      "skill_ids": ["xlsx"]
    },
    "tools": [{"type": "code_execution_20250825", "name": "code_execution"}],
    "messages": [
      {"role": "user", "content": "Create a sales report spreadsheet with monthly data"}
    ]
  }'
```

## Skill Structure

Every Skill requires a SKILL.md file:
```markdown
---
name: your-skill-name
description: What this Skill does and when to use it (max 1024 chars)
---

# Your Skill Name

## Instructions
[Clear, step-by-step guidance for Claude]

## Examples
[Concrete examples]
```

**Name requirements:**
- Max 64 characters
- Only lowercase letters, numbers, and hyphens
- No XML tags
- Cannot contain: "anthropic", "claude"

## Where Skills Work

| Surface | Pre-built | Custom | Sharing |
|---------|-----------|--------|---------|
| Claude API | ✅ | ✅ | Workspace-wide |
| Claude Code | ❌ | ✅ | Personal/project |
| Claude.ai | ✅ | ✅ | Individual user only |
| Agent SDK | ❌ | ✅ | Filesystem-based |

## Runtime Constraints

**Claude API:** No network access, no runtime package installation, pre-installed packages only.

**Claude Code:** Full network access, global package installation discouraged.

**Claude.ai:** Varying network access based on user/admin settings.

## Security Considerations

Skills run code in a VM environment. Only use Skills from trusted sources:
- Audit all bundled files (SKILL.md, scripts, images)
- External URL-fetching Skills are higher risk
- Malicious Skills can invoke bash/file operations
- Custom Skills have workspace-wide access in the API

## Skill Sharing Limitations

Custom Skills do NOT sync across surfaces automatically:
- Must upload separately to claude.ai and the API
- Claude.ai: per-user only (no org-wide management)
- Claude API: workspace-wide
- Claude Code: filesystem-based (~/.claude/skills/ or .claude/skills/)

## Related Docs

- [Code Execution Tool](./code-execution-tool.md)
- [Tool Use Overview](./tool-use-overview.md)
- [Features Overview](../03-build-with-claude/features-overview.md)

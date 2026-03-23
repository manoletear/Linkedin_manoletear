# Memory and CLAUDE.md

> Source: https://code.claude.com/docs/en/memory

Each Claude Code session begins with a fresh context window. Two mechanisms carry knowledge across sessions:

- **CLAUDE.md files**: instructions you write to give Claude persistent context
- **Auto memory**: notes Claude writes itself based on your corrections and preferences

## CLAUDE.md vs Auto Memory

| | CLAUDE.md files | Auto memory |
|--|-----------------|-------------|
| Who writes it | You | Claude |
| What it contains | Instructions and rules | Learnings and patterns |
| Scope | Project, user, or org | Per working tree |
| Loaded into | Every session | Every session (first 200 lines) |
| Use for | Coding standards, workflows, architecture | Build commands, debugging insights, preferences |

## CLAUDE.md Files

### File Locations

| Scope | Location | Shared With |
|-------|----------|-------------|
| Managed policy | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md` | All users in org |
| Managed policy | Linux: `/etc/claude-code/CLAUDE.md` | All users in org |
| Managed policy | Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | All users in org |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team members via source control |
| User | `~/.claude/CLAUDE.md` | Just you (all projects) |

Files higher in the hierarchy load at launch. Subdirectory CLAUDE.md files load on demand when Claude reads files in those directories.

### Setting Up a Project CLAUDE.md

```bash
# Generate automatically:
/init

# Enable interactive multi-phase flow:
export CLAUDE_CODE_NEW_INIT=true
/init
```

Manually create `.claude/CLAUDE.md` with:

```markdown
# My Project Instructions

## Build & Test
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`

## Architecture
- API handlers in `src/api/handlers/`
- Database models in `src/models/`
- React components in `src/components/`

## Coding Standards
- Use TypeScript strict mode
- 2-space indentation
- Max line length: 100 characters
- Use functional components with hooks

## Naming Conventions
- Files: kebab-case (user-profile.ts)
- Classes: PascalCase (UserProfile)
- Functions/variables: camelCase (getUserProfile)
```

### Writing Effective Instructions

- **Size**: Target under 200 lines per CLAUDE.md file
- **Specificity**: `Use 2-space indentation` not `Format code properly`
- **Avoid conflicts**: Review all CLAUDE.md files for contradictions
- **Structure**: Use markdown headers and bullets

Good examples:
```markdown
# Specific, verifiable instructions
- Run `npm test` before committing
- API handlers live in src/api/handlers/
- All API endpoints must return JSON with 'data' and 'error' keys
```

### Importing Additional Files

```markdown
# CLAUDE.md
See @README for project overview and @package.json for available npm commands.

# Git workflow
@docs/git-instructions.md

# Individual preferences (not checked in)
@~/.claude/my-project-instructions.md
```

## Organizing Rules with .claude/rules/

For larger projects, organize instructions into multiple files:

```
your-project/
├── .claude/
│   ├── CLAUDE.md              # Main project instructions
│   └── rules/
│       ├── code-style.md      # Code style guidelines
│       ├── testing.md         # Testing conventions
│       └── security.md        # Security requirements
```

### Path-Specific Rules

Rules with YAML frontmatter only apply when Claude works with matching files:

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "src/**/*.{ts,tsx}"
---

# API Development Rules
- All API endpoints must include input validation
- Use the standard error response format: {data, error}
- Include OpenAPI documentation comments
```

| Pattern | Matches |
|---------|---------|
| `**/*.ts` | All TypeScript files |
| `src/**/*` | All files under src/ |
| `*.md` | Markdown files in project root |
| `src/components/*.tsx` | React components in a directory |

## Auto Memory

Auto memory is **on by default**. Claude saves notes across sessions: build commands, debugging insights, architecture notes, coding preferences.

### Storage Location

```
~/.claude/projects/<project>/memory/
├── MEMORY.md                   # Concise index (first 200 lines loaded at session start)
├── debugging.md                # Detailed debugging notes
├── api-conventions.md          # API design decisions
└── ...                         # Any other topic files
```

Auto memory is machine-local and shared across all worktrees within the same git repository.

### Manage Auto Memory

```bash
# View and manage memory from within a session
/memory

# Toggle auto memory
# Use the toggle in /memory, or set in settings:
```

```json
{
  "autoMemoryEnabled": false
}
```

```bash
# Disable via environment variable
CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 claude

# Custom storage location
# Add to settings.json:
```

```json
{
  "autoMemoryDirectory": "~/my-custom-memory-dir"
}
```

### Teaching Claude New Preferences

```bash
# In a Claude Code session:
always use pnpm, not npm
remember that the API tests require a local Redis instance

# To add to CLAUDE.md instead:
add this to CLAUDE.md
```

## Managing for Large Teams

```bash
# Deploy organization-wide CLAUDE.md
# Create file at managed policy location:
# macOS: /Library/Application Support/ClaudeCode/CLAUDE.md
# Linux: /etc/claude-code/CLAUDE.md
# Windows: C:\Program Files\ClaudeCode\CLAUDE.md

# Then deploy via MDM, Group Policy, Ansible, etc.
```

### Exclude Specific Files (Large Monorepos)

```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

## Troubleshooting

**Claude isn't following my CLAUDE.md:**
1. Run `/memory` to verify the file is loaded
2. Check that the CLAUDE.md is in a location that gets loaded for your session
3. Make instructions more specific
4. Look for conflicting instructions across CLAUDE.md files

**CLAUDE.md is too large:**
- Move detailed content into separate files with `@path` imports
- Split instructions across `.claude/rules/` files

**Instructions lost after /compact:**
- CLAUDE.md survives compaction (re-read from disk after `/compact`)
- If an instruction disappeared, it was only in conversation — add it to CLAUDE.md

## Related Documentation

- [Overview](overview.md)
- [Settings](settings.md)
- [Common Workflows](common-workflows.md)

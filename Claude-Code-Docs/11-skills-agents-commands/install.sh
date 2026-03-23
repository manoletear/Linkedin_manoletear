#!/bin/bash
# Install Claude Code skills, agents, and commands
# Usage: ./install.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${HOME}/.claude"

echo "Installing Claude Code extensions..."
echo "Source: ${SCRIPT_DIR}"
echo "Target: ${CLAUDE_DIR}"
echo ""

# Create directories if they don't exist
mkdir -p "${CLAUDE_DIR}/agents"
mkdir -p "${CLAUDE_DIR}/skills"
mkdir -p "${CLAUDE_DIR}/commands"

# Copy agents
AGENT_COUNT=$(ls "${SCRIPT_DIR}/agents/"*.md 2>/dev/null | wc -l)
cp -r "${SCRIPT_DIR}/agents/"*.md "${CLAUDE_DIR}/agents/"
echo "Agents installed: ${AGENT_COUNT}"

# Copy skills (preserve directory structure)
SKILL_COUNT=$(ls -d "${SCRIPT_DIR}/skills/"*/ 2>/dev/null | wc -l)
cp -r "${SCRIPT_DIR}/skills/"* "${CLAUDE_DIR}/skills/"
echo "Skills installed: ${SKILL_COUNT} directories"

# Copy commands
CMD_COUNT=$(ls "${SCRIPT_DIR}/commands/"*.md 2>/dev/null | wc -l)
cp -r "${SCRIPT_DIR}/commands/"*.md "${CLAUDE_DIR}/commands/"
echo "Commands installed: ${CMD_COUNT}"

echo ""
echo "Done! Restart Claude Code to load the new extensions."

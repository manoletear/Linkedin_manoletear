# Prompt Engineering Overview

> Source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview

Prompt engineering is the practice of crafting inputs to language models to achieve desired outputs. This guide covers when and how to optimize prompts for Claude.

## Before You Start

Before prompt engineering, establish:
1. **Clear success criteria** — What does a "good" response look like?
2. **Evaluation methods** — How will you measure improvements?
3. **A first draft prompt** — Something to iterate on

Use the **Prompt Generator** in the Claude Console if you don't have a starting point.

## When to Use Prompt Engineering

Prompt engineering is most effective for improving:
- Response quality and accuracy
- Tone and formatting
- Following specific instructions
- Handling edge cases

Less effective (use other solutions) for:
- Latency → Use a faster model (e.g., Haiku)
- Cost → Use a smaller model or prompt caching
- Factual accuracy on recent events → Use web search tool

## Core Prompting Techniques

### 1. Be Direct and Specific

❌ Bad: "Write something about Python"
✅ Good: "Write a 200-word introduction to Python's list comprehension syntax, with two code examples showing transformation and filtering. Assume the reader knows basic Python."

### 2. Use XML Tags for Structure

Claude works exceptionally well with XML tags to separate content:

```xml
<document>
  <content>
    {{ DOCUMENT_CONTENT }}
  </content>
</document>

<instructions>
Summarize the document above in 3 bullet points.
</instructions>
```

### 3. Provide Examples (Few-Shot Prompting)

```
Classify the sentiment of these reviews:

Review: "The product broke after one week"
Sentiment: NEGATIVE

Review: "Amazing quality, exactly as described!"
Sentiment: POSITIVE

Review: "{{ REVIEW_TO_CLASSIFY }}"
Sentiment:
```

### 4. Role Prompting

```
You are an expert Python developer with 10 years of experience in data science. 
You specialize in pandas, numpy, and scikit-learn.
```

### 5. Chain of Thought

Ask Claude to reason step by step:
```
Before giving your final answer, think through this problem step by step in <thinking> tags.
```

Or use extended thinking for complex reasoning:
```json
{
  "thinking": {"type": "enabled", "budget_tokens": 8000}
}
```

### 6. Output Formatting

Be explicit about desired format:
```
Return your answer as a JSON object with these exact fields:
{
  "summary": "string",
  "key_points": ["array", "of", "strings"],
  "confidence": number between 0 and 1
}
```

### 7. Prompt Chaining

Break complex tasks into sequential prompts:
1. Extract key information
2. Analyze the information
3. Generate output based on analysis

### 8. Prefilling Assistant Responses

Control Claude's output format by prefilling:
```json
{
  "messages": [
    {"role": "user", "content": "What's the capital of France?"},
    {"role": "assistant", "content": "The capital of France is"}
  ]
}
```

## System Prompt Best Practices

Structure system prompts clearly:
```
You are [ROLE].

Your task is to [TASK DESCRIPTION].

Guidelines:
- [GUIDELINE 1]
- [GUIDELINE 2]

Constraints:
- [CONSTRAINT 1]
- [CONSTRAINT 2]

Format your response as [OUTPUT FORMAT].
```

## Handling Long Contexts

When working with long documents:
1. Place the document content before the task instruction
2. Use XML tags to separate document from instructions
3. Reference specific sections by name
4. Use prompt caching for repeated large contexts

## Iterative Improvement Process

1. Start with a simple prompt
2. Test against your success criteria
3. Identify failure modes
4. Add constraints or examples to address failures
5. Repeat

## Claude Console Tools

- **Prompt Generator** — Generate first-draft prompts from a task description
- **Prompt Improver** — Automatically enhance existing prompts
- **Variables & Templates** — Create reusable prompt templates
- **Workbench** — Test prompts with different parameters

## Related Docs

- [Best Practices](./best-practices.md)
- [Extended Thinking Tips](./extended-thinking-tips.md)
- [Extended Thinking](../03-build-with-claude/extended-thinking.md)
- [Streaming](../03-build-with-claude/streaming.md)

# Prompting Best Practices

> Source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview

Comprehensive guide to prompting Claude effectively across different use cases and model generations.

## Core Principles

### 1. Clarity Over Cleverness

Write prompts that are explicit and unambiguous. Claude is designed to follow instructions literally.

**Before:**
```
Improve this text
```

**After:**
```
Rewrite the following text to be more concise and professional. Remove filler words, 
use active voice, and limit each paragraph to 3 sentences. Preserve all factual content.
```

### 2. Use XML Tags for Structure

XML tags are Claude's native organizational syntax:

```xml
<system_context>
You are a customer support specialist for TechCorp. 
Always be polite and solution-focused.
</system_context>

<customer_issue>
{{ CUSTOMER_COMPLAINT }}
</customer_issue>

<instructions>
1. Acknowledge the customer's frustration
2. Identify the core issue
3. Provide a concrete solution
4. Offer a follow-up action
</instructions>
```

### 3. Give Examples (Few-Shot Prompting)

For consistent formatting or style:
```
Format each item as: [Category] → Item Name: Description

Example:
[Tech] → Python: A high-level programming language

Now format these:
- JavaScript: A web programming language
- Docker: A containerization platform
```

### 4. Define Output Format Explicitly

```
Return your analysis as a JSON object with these exact fields:
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": float between 0-1,
  "key_phrases": array of up to 5 strings,
  "summary": string of 1-2 sentences
}

Do not include any text outside the JSON object.
```

## Model-Specific Tips

### Claude Opus 4.6 / Sonnet 4.6

These models excel at complex reasoning with extended thinking:

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=16000,
    thinking={"type": "enabled", "budget_tokens": 10000},
    messages=[
        {"role": "user", "content": "Design a distributed caching strategy for a system with 100M DAU"}
    ]
)
```

**When to use extended thinking:**
- Multi-step mathematical problems
- Complex code architecture decisions
- Legal/ethical analysis with many tradeoffs
- Scientific reasoning

**When NOT to use extended thinking:**
- Simple factual queries
- Short creative tasks
- Real-time interactive applications (adds latency)

### Claude Haiku 4.5

Optimized for speed — use direct, focused prompts:
```
Classify this support ticket as: billing, technical, account, or other
Return only the category word.

Ticket: "I can't log into my account after changing my password"
```

## Advanced Techniques

### Prompt Chaining

Break complex workflows into steps:

```python
# Step 1: Extract data
extraction_result = client.messages.create(
    model="claude-sonnet-4-6",
    messages=[{"role": "user", "content": f"Extract all dates from this text: {document}"}]
)

# Step 2: Process extracted data
analysis_result = client.messages.create(
    model="claude-sonnet-4-6",
    messages=[{"role": "user", "content": f"Given these dates: {extraction_result.content[0].text}\n\nIdentify the most significant event and explain why."}]
)
```

### Metacognitive Prompting

Ask Claude to evaluate its own confidence:
```
Answer the following question. Then rate your confidence from 1-10 and explain 
what you're uncertain about.

Question: {{ QUESTION }}

Format:
Answer: [your answer]
Confidence: [1-10]
Uncertainty: [what you're not sure about]
```

### Negative Constraints

Tell Claude what NOT to do:
```
Summarize this article in 3 bullet points.
- Do NOT include opinions or analysis, only facts
- Do NOT use bullet sub-points
- Do NOT exceed 15 words per bullet
```

### Role + Context + Task Structure

The most effective system prompts follow this pattern:
```
[ROLE]
You are an expert [domain] specialist with [N] years of experience in [specific areas].

[CONTEXT]  
You are assisting [user type] with [use case]. They typically have [knowledge level].

[TASK GUIDELINES]
When responding:
- Always [behavior 1]
- Never [behavior 2]
- Format output as [format]

[CONSTRAINTS]
- Keep responses under [length]
- Only use information from [source]
```

## Handling Special Cases

### Long Documents

```xml
<document>
<title>{{ DOCUMENT_TITLE }}</title>
<content>
{{ DOCUMENT_CONTENT }}
</content>
</document>

Based only on the document above, answer: {{ QUESTION }}
If the answer is not in the document, say "Not found in document."
```

### Code Generation

```
Write a Python function that:
- Takes a list of integers as input
- Returns the top N elements by frequency
- Handles ties by returning all tied elements
- Uses type hints
- Includes a docstring with example
- Has at least 3 unit tests in a separate block

Parameters: numbers: list[int], n: int
Return type: list[int]
```

### Sensitive Topics

Use explicit framing to establish context:
```
This is for an academic cybersecurity course assignment on vulnerabilities.
Explain how SQL injection attacks work conceptually, without providing 
working exploit code, so students understand why input sanitization is important.
```

## Evaluation and Iteration

1. **Define specific test cases** — Not just "does it work" but precise inputs/outputs
2. **Use consistent test sets** — Same prompts across iterations
3. **A/B test changes** — Change one variable at a time
4. **Log failures** — Track which inputs cause problems
5. **Gradual rollout** — Test with small traffic before full deployment

## Related Docs

- [Prompt Engineering Overview](./overview.md)
- [Extended Thinking Tips](./extended-thinking-tips.md)
- [Extended Thinking](../03-build-with-claude/extended-thinking.md)
- [Working with Messages](../03-build-with-claude/working-with-messages.md)

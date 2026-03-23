# Define Success Criteria and Build Evaluations

> Source: https://platform.claude.com/docs/en/test-and-evaluate/develop-tests

Building a successful LLM-based application starts with clearly defining your success criteria and then designing evaluations to measure performance against them.

## Define Your Success Criteria

Good success criteria are:

- **Specific**: Clearly define what you want to achieve. Instead of 'good performance,' specify 'accurate sentiment classification.'
- **Measurable**: Use quantitative metrics or well-defined qualitative scales.
- **Achievable**: Base your targets on industry benchmarks, prior experiments, and expert knowledge.
- **Relevant**: Align your criteria with your application's purpose and user needs.

### Common Success Criteria

| Criterion | Description | Example Metric |
|-----------|-------------|----------------|
| **Task Fidelity** | Accuracy at the core task | < 5% error rate on labeled test set |
| **Consistency** | Same question, same answer | Cosine similarity > 0.9 across 100 runs |
| **Relevance** | Responses address the question | ROUGE-L score > 0.6 |
| **Tone & Style** | Matches brand voice | Likert scale 4+/5 on 95% of responses |
| **Privacy** | No PII leakage | 0 PII instances per 1000 outputs |
| **Latency** | Response time | P95 < 2 seconds |
| **Price** | Cost per query | < $0.01 per API call |

### Safety Criteria Example

Use measurable targets instead of vague criteria:

```
Less than 0.1% of outputs out of 10,000 trials flagged for toxicity by content filter.
```

## Build Evaluations

### Eval Design Principles

1. **Be task-specific**: Design evals that mirror your real-world task distribution, including edge cases.
2. **Automate when possible**: Structure questions for automated grading (multiple-choice, string match, code-graded, LLM-graded).
3. **Prioritize volume over quality**: More questions with automated grading is better than fewer with manual grading.

### Grading Methods

Choose the fastest, most reliable, most scalable method:

| Method | Speed | Flexibility | Best For |
|--------|-------|-------------|----------|
| Exact match | Fast | Low | Classification, structured output |
| String match | Fast | Medium | Required phrase presence |
| Code-based | Fast | Medium | Math, code, format validation |
| ROUGE/BLEU | Fast | Low | Summarization, translation |
| LLM-graded | Medium | High | Tone, nuance, complex judgment |
| Human-graded | Slow | Maximum | Ground truth, ambiguous cases |

### 1. Exact Match Evaluation

Best for classification, factual questions, structured outputs:

```python
import anthropic

client = anthropic.Anthropic()

test_cases = [
    {"input": "I love this product!", "expected": "positive"},
    {"input": "This is terrible.", "expected": "negative"},
    {"input": "It's okay.", "expected": "neutral"},
]

def run_exact_match_eval(test_cases):
    correct = 0
    for case in test_cases:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=10,
            system="Classify sentiment as 'positive', 'negative', or 'neutral'. Reply with only one word.",
            messages=[{"role": "user", "content": case["input"]}]
        )
        predicted = response.content[0].text.strip().lower()
        if predicted == case['expected']:
            correct += 1
    accuracy = correct / len(test_cases)
    print(f'Accuracy: {accuracy:.2%}')
    return accuracy
```

### 2. String Match Evaluation

Best for checking if required information is included:

```python
def evaluate_string_match(output: str, required_phrases: list) -> dict:
    results = {}
    for phrase in required_phrases:
        results[phrase] = phrase.lower() in output.lower()
    return results

def evaluate_faq_response(output: str) -> bool:
    required = ["Acme Inc.", "support@acme.com", "business hours"]
    checks = evaluate_string_match(output, required)
    return all(checks.values())
```

### 3. LLM-Based Grading

Best for tone, style, nuance, safety, and complex quality criteria:

```python
def llm_grade_response(question: str, model_response: str, rubric: str) -> dict:
    grading_prompt = f'''Grade the following response on a 1-5 scale.

Question asked: {question}
Response to grade: {model_response}

Grading rubric:
{rubric}

First explain your reasoning, then output: SCORE: [number]'''

    grade_response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        messages=[{"role": "user", "content": grading_prompt}]
    )
    return grade_response.content[0].text

# Customer service tone rubric
tone_rubric = '''
5 - Exceptionally warm, professional, and helpful.
4 - Professional and friendly. Clearly helpful.
3 - Neutral and adequate.
2 - Slightly cold or unhelpful.
1 - Rude, dismissive, or unprofessional.
The response MUST address the customer's concern to score above 2.
'''
```

### LLM Grading Best Practices

- **Have detailed rubrics**: Define exactly what constitutes each score level
- **Be empirical**: Output only 'correct'/'incorrect' or a numeric scale
- **Encourage reasoning first**: Ask the LLM to think before scoring, then discard the reasoning for scoring purposes

```python
def grade_with_reasoning(response: str, criteria: str) -> str:
    prompt = f'''Evaluate this response:

Response: {response}
Criteria: {criteria}

Think step by step, then provide:
THINKING: [your reasoning]
VERDICT: [pass/fail]'''

    result = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )
    return result.content[0].text
```

## Generate Test Cases with Claude

Use Claude to generate test cases from a baseline set:

```python
def generate_test_cases(baseline_cases: list, n: int = 50) -> list:
    examples = chr(10).join([
        f'Input: {c["input"]}' + chr(10) + f'Expected: {c["expected"]}'
        for c in baseline_cases[:5]
    ])

    prompt = f'''I have a sentiment analysis evaluation. Here are examples:

{examples}

Generate {n} more diverse test cases. Include:
- Edge cases (ambiguous sentiment, sarcasm, mixed feelings)
- Short and long texts
- Domain-specific language (reviews, social media)

Format each as:
Input: [text]
Expected: [positive/negative/neutral]'''

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text
```

## Complete Evaluation Pipeline

```python
def run_evaluation_pipeline(test_cases: list, system_prompt: str, grader, model: str = 'claude-sonnet-4-6') -> dict:
    results = []
    for case in test_cases:
        response = client.messages.create(
            model=model,
            max_tokens=500,
            system=system_prompt,
            messages=[{"role": "user", "content": case["input"]}]
        )
        actual = response.content[0].text
        passed, score = grader(actual, case.get('expected', ''))
        results.append({'input': case['input'], 'expected': case.get('expected'), 'actual': actual, 'passed': passed, 'score': score})

    total = len(results)
    passed_count = sum(1 for r in results if r['passed'])
    return {
        'total_tests': total,
        'passed': passed_count,
        'pass_rate': passed_count / total,
        'avg_score': sum(r['score'] for r in results) / total
    }
```

## Related Documentation

- [Guardrails and Safety](guardrails.md)
- [Prompt Engineering Overview](../05-prompt-engineering/overview.md)
- [Best Practices](../05-prompt-engineering/best-practices.md)
- [Messages API Reference](../06-api-reference/messages-api.md)

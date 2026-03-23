# Message Batches API (Batch Processing)

> Source: https://platform.claude.com/docs/en/build-with-claude/message-batches

The Message Batches API allows you to process large volumes of requests asynchronously at a reduced cost. Ideal for offline processing, data pipelines, and bulk operations.

## Key Benefits

- **50% cost reduction** — Batch requests are discounted compared to real-time API
- **Asynchronous processing** — Submit and retrieve when ready
- **Large volumes** — Process up to 100,000 requests per batch
- **No rate limit concerns** — Batch processing uses separate limits

## Quick Start

```python
import anthropic

client = anthropic.Anthropic()

# Create a batch
batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": "request-1",
            "params": {
                "model": "claude-opus-4-6",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "Summarize: The cat sat on the mat."}]
            }
        },
        {
            "custom_id": "request-2",
            "params": {
                "model": "claude-opus-4-6",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "Translate to French: Hello world"}]
            }
        }
    ]
)

print(f"Batch ID: {batch.id}")
print(f"Status: {batch.processing_status}")
```

## Checking Batch Status

```python
import time

# Poll until complete
while True:
    batch = client.messages.batches.retrieve(batch.id)
    
    if batch.processing_status == "ended":
        break
    
    print(f"Status: {batch.processing_status}")
    print(f"Request counts: {batch.request_counts}")
    time.sleep(60)  # Check every minute

print("Batch complete!")
```

## Retrieving Results

```python
# Stream results as they complete
for result in client.messages.batches.results(batch.id):
    if result.result.type == "succeeded":
        print(f"Request {result.custom_id}: {result.result.message.content[0].text}")
    elif result.result.type == "errored":
        print(f"Request {result.custom_id} failed: {result.result.error}")
    elif result.result.type == "canceled":
        print(f"Request {result.custom_id} was canceled")
```

## Full Workflow Example

```python
import anthropic
import time
import json

client = anthropic.Anthropic()

def process_documents_in_batch(documents: list[dict]) -> dict:
    """Process multiple documents using the Batch API."""
    
    # Create batch requests
    requests = []
    for i, doc in enumerate(documents):
        requests.append({
            "custom_id": f"doc-{i}",
            "params": {
                "model": "claude-haiku-4-5-20251001",  # Use Haiku for cost efficiency
                "max_tokens": 500,
                "messages": [{
                    "role": "user",
                    "content": f"Summarize this in 2 sentences: {doc['text']}"
                }]
            }
        })
    
    # Submit batch
    batch = client.messages.batches.create(requests=requests)
    print(f"Submitted batch {batch.id} with {len(requests)} requests")
    
    # Wait for completion
    while True:
        batch = client.messages.batches.retrieve(batch.id)
        counts = batch.request_counts
        print(f"Processing: {counts.processing}, Succeeded: {counts.succeeded}, Errored: {counts.errored}")
        
        if batch.processing_status == "ended":
            break
        time.sleep(30)
    
    # Collect results
    results = {}
    for result in client.messages.batches.results(batch.id):
        if result.result.type == "succeeded":
            results[result.custom_id] = result.result.message.content[0].text
        else:
            results[result.custom_id] = f"ERROR: {result.result}"
    
    return results

# Example usage
documents = [
    {"id": "doc1", "text": "Long document text here..."},
    {"id": "doc2", "text": "Another long document..."},
    # ... up to 100,000 documents
]

results = process_documents_in_batch(documents)
```

## Canceling a Batch

```python
# Cancel a batch before it completes
canceled_batch = client.messages.batches.cancel(batch.id)
print(f"Canceled: {canceled_batch.processing_status}")
```

## Listing Batches

```python
# List all batches
for batch in client.messages.batches.list():
    print(f"{batch.id}: {batch.processing_status} ({batch.request_counts.total} requests)")
```

## cURL Example

```bash
# Create batch
curl https://api.anthropic.com/v1/messages/batches \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "requests": [
      {
        "custom_id": "my-request-1",
        "params": {
          "model": "claude-opus-4-6",
          "max_tokens": 1024,
          "messages": [{"role": "user", "content": "Hello!"}]
        }
      }
    ]
  }'

# Check status
curl https://api.anthropic.com/v1/messages/batches/{batch_id} \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"

# Get results
curl https://api.anthropic.com/v1/messages/batches/{batch_id}/results \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

## Batch Request Object

```json
{
  "custom_id": "string (up to 64 chars, alphanumeric, hyphens, underscores)",
  "params": {
    "model": "claude-opus-4-6",
    "max_tokens": 1024,
    "messages": [...],
    "system": "optional system prompt",
    "temperature": 1.0,
    "tools": [...],
    "stream": false
  }
}
```

## Batch Response Object

```json
{
  "id": "msgbatch_01...",
  "type": "message_batch",
  "processing_status": "in_progress | ended",
  "request_counts": {
    "processing": 3,
    "succeeded": 47,
    "errored": 0,
    "canceled": 0,
    "expired": 0,
    "total": 50
  },
  "ended_at": "2025-03-19T10:00:00Z",
  "created_at": "2025-03-19T09:55:00Z",
  "expires_at": "2025-03-20T09:55:00Z",
  "results_url": "https://api.anthropic.com/v1/messages/batches/.../results"
}
```

## Rate Limits

The Batch API has separate rate limits (see Rate Limits page):
- RPM: 50 requests to batch endpoints per minute
- Max batch requests in queue: 100,000
- Max requests per batch: 100,000
- Batch results available for 29 days after creation

## Pricing

Batch API pricing is **50% less** than standard API pricing.

Example: If Claude Opus 4.6 is $5/MTok input, batch is $2.50/MTok input.

## Related Docs

- [Rate Limits](../06-api-reference/rate-limits.md)
- [Messages API](../06-api-reference/messages-api.md)
- [Prompt Caching](./prompt-caching.md)

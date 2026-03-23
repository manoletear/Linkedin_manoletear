# Vision — Image Processing

> Source: https://platform.claude.com/docs/en/build-with-claude/vision

Claude can process and analyze images, charts, diagrams, screenshots, and other visual content. Vision capabilities are available on all current Claude models.

## Supported Image Formats

- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`) — static images only
- WebP (`.webp`)

**Maximum file size:** 5MB per image
**Maximum image dimensions:** 8000 × 8000 pixels

For API responses, images are downsampled to a maximum of 1568px on the longest edge and ~1.15 megapixels total.

## Adding Images to Messages

### Method 1: Base64 Encoded

```python
import anthropic
import base64
from pathlib import Path

client = anthropic.Anthropic()

# Read and encode image
image_data = base64.standard_b64encode(Path("image.jpg").read_bytes()).decode("utf-8")

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": image_data
                    }
                },
                {
                    "type": "text",
                    "text": "What is in this image?"
                }
            ]
        }
    ]
)

print(response.content[0].text)
```

### Method 2: Image URL

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "url",
                        "url": "https://example.com/image.jpg"
                    }
                },
                {
                    "type": "text",
                    "text": "Describe this image in detail."
                }
            ]
        }
    ]
)
```

### Method 3: Files API

For reusable images, use the Files API:

```python
# Upload once
with open("chart.png", "rb") as f:
    file = client.beta.files.upload(
        file=("chart.png", f, "image/png")
    )

# Reference multiple times
response = client.beta.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    betas=["files-api-2025-04-14"],
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {
                        "type": "file",
                        "file_id": file.id
                    }
                },
                {"type": "text", "text": "Analyze this chart"}
            ]
        }
    ]
)
```

## Multiple Images

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {"type": "url", "url": "https://example.com/before.jpg"}
                },
                {
                    "type": "image",
                    "source": {"type": "url", "url": "https://example.com/after.jpg"}
                },
                {
                    "type": "text",
                    "text": "Compare these two images. What has changed?"
                }
            ]
        }
    ]
)
```

## Common Vision Use Cases

### Analyze Charts and Graphs

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "url", "url": "chart_url"}},
            {"type": "text", "text": "Extract all data points from this chart as a JSON table."}
        ]
    }]
)
```

### OCR — Extract Text from Images

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=2048,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_b64}},
            {"type": "text", "text": "Extract all text from this image exactly as it appears."}
        ]
    }]
)
```

### Analyze Screenshots

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": screenshot_b64}},
            {"type": "text", "text": "What errors or issues do you see in this UI screenshot?"}
        ]
    }]
)
```

### Document Analysis

```python
response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": doc_b64}},
            {"type": "text", "text": "Extract all key information from this document and structure it as JSON."}
        ]
    }]
)
```

## Vision Pricing

Images are billed based on their size (after downsampling to API limits):

| Image Size | Approx. Token Cost |
|-----------|-------------------|
| Small (~400×300) | ~100 tokens |
| Medium (~800×600) | ~300 tokens |
| Large (~1568px max) | ~1,200 tokens |

Images are billed at the same input token rate as text.

## Best Practices

1. **Image quality** — Higher resolution images improve accuracy for detailed tasks like OCR
2. **Multiple images** — Can include up to 20 images per request
3. **Context** — Provide clear instructions about what you want analyzed
4. **Format** — PNG for screenshots, JPEG for photos
5. **Size** — Compress images appropriately before sending to reduce token costs

## Limitations

- No real-time video processing
- No image generation (Claude only analyzes images)
- Cannot read highly stylized fonts reliably
- May struggle with very small text (< 8px) in images

## Related Docs

- [Working with Messages](./working-with-messages.md)
- [Code Execution Tool](../04-agents-and-tools/code-execution-tool.md)
- [Computer Use](../04-agents-and-tools/computer-use.md)
- [Messages API](../06-api-reference/messages-api.md)

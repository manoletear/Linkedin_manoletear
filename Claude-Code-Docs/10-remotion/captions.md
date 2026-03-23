# Captions in Remotion

> Source: https://www.remotion.dev/docs/captions

Learn how to add captions and subtitles to your Remotion videos.

## Topics

- **Importing from .srt** - Import existing .srt subtitle files
- **Transcribing audio** - Options for generating captions from audio
- **Displaying captions** - Render captions in your Remotion video
- **Exporting subtitles** - Export subtitles as burned-in or .srt files

## @remotion/captions Package

> Source: https://www.remotion.dev/docs/captions/api
> Available from v4.0.216

The `@remotion/captions` package provides utilities for dealing with subtitles.

### Installation

```bash
npx remotion add @remotion/captions
# or
npm i --save-exact @remotion/captions@4.0.438
```

### The Caption Type

The `Caption` type defines a standard shape for captions from different sources.
Captions from `@remotion/install-whisper-cpp` can be converted into this type.

### APIs

| Function | Description |
|----------|-------------|
| `Caption` | An object shape for captions |
| `parseSrt()` | Parse a .srt file into a Caption array |
| `serializeSrt()` | Serialize a Caption array into a .srt file |
| `createTikTokStyleCaptions()` | Structure captions for TikTok-style display |

### Example: Parsing SRT

```tsx
import { parseSrt } from "@remotion/captions";

const srtContent = `
1
00:00:01,000 --> 00:00:04,000
Hello, world!
`;

const captions = parseSrt({ input: srtContent });
// Returns Caption[] array
```

### Example: TikTok-Style Captions

```tsx
import { createTikTokStyleCaptions } from "@remotion/captions";
import { useCurrentFrame } from "remotion";

const { pages } = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 1200,
});

// Render the current page based on frame timing
```

**License:** MIT

## Related

- [Using Audio](./using-audio.md)
- [Rendering](./rendering.md)
- [Getting Started](./getting-started.md)

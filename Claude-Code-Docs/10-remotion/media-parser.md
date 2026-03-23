# @remotion/media-parser

> Source: https://www.remotion.dev/docs/media-parser

> **Note:** Media Parser is being phased out in favor of Mediabunny.

A package that parses video and audio files to extract metadata and samples.

## Design Goals

- Support all major containers: `.mp4`, `.mov`, `.webm`, `.mkv`, `.avi`, `.m3u8`, `.ts`, `.mp3`, `.wav`, `.aac`, `.m4a`, `.flac`
- Extract 20+ fields from multimedia files
- Works in browser, Node.js, and Bun
- Minimal fetching - satisfies query efficiently
- Functional TypeScript API
- WebCodecs support for decoding frames and audio samples
- Pausable, resumable, and cancellable
- Seekable to any position in a media file
- No dependencies

## Installation

```bash
npx remotion add @remotion/media-parser
# or
npm i --save-exact @remotion/media-parser@4.0.438
```

## Hello World

### Get Video Metadata

```tsx
import { parseMedia } from "@remotion/media-parser";

const { durationInSeconds, videoCodec } = await parseMedia({
  src: "https://remotion.media/video.mp4",
  fields: {
    durationInSeconds: true,
    videoCodec: true,
  },
});

console.log(durationInSeconds); // 5.056
console.log(videoCodec); // "h264"
```

### Extract Video Samples

```tsx
import { parseMedia } from "@remotion/media-parser";

await parseMedia({
  src: "https://remotion.media/video.mp4",
  onVideoTrack: ({ track }) => {
    console.log(track.width);
    console.log(track.height);
    return (sample) => {
      console.log(sample.timestamp); // 0
      console.log(sample.data); // Uint8Array
    };
  },
});
```

## APIs

| API | Description |
|-----|-------------|
| `parseMedia()` | Parse a media file |
| `downloadAndParseMedia()` | Download and parse a media file |
| `parseMediaOnWebWorker()` | Parse in browser on a separate thread |
| `parseMediaOnServerWorker()` | Parse on server on a separate thread |
| `mediaParserController()` | Pause, resume, and abort parsing |
| `hasBeenAborted()` | Determine if parsing was aborted |

## Readers

- `nodeReader` - Read from local file system
- `webReader` - Read from a File or URL
- `universalReader` - Read from File, URL, or local file system

## Comparison with FFmpeg

- Media Parser is specialized for JavaScript/web environments
- Does NOT decode/encode - only parses (combine with WebCodecs for decoding)
- No command line interface

## License

[Remotion License](https://remotion.dev/license)

## Related

- [WebCodecs](./webcodecs.md)
- [Rendering](./rendering.md)
- [Using Audio](./using-audio.md)

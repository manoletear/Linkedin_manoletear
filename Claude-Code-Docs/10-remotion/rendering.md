# Rendering in Remotion

> Source: https://www.remotion.dev/docs/render

There are various ways to render your video in Remotion.

## 1. Remotion Studio (GUI)

Click the **Render** button in the Remotion Studio. Choose your settings and confirm.

You can also deploy the Remotion Studio to a cloud server for team use.
See: [Deploy Remotion Studio](https://www.remotion.dev/docs/studio/deploy-server)

## 2. CLI

```bash
# Render a specific composition
npx remotion render HelloWorld

# Render with custom output path
npx remotion render HelloWorld out/my-video.mp4

# Show composition picker
npx remotion render

# Render a still image
npx remotion still HelloWorld --frame=30 out/still.png

# Render as GIF
npx remotion render HelloWorld out/video.gif

# Render image sequence
npx remotion render HelloWorld --sequence out/frames/
```

## 3. Server-Side Rendering (SSR)

Remotion has a full-featured Node.js API:

```typescript
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const bundleLocation = await bundle({
  entryPoint: "./src/index.ts",
});

const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: "MyComposition",
});

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: "out/video.mp4",
});
```

See: [Server-Side Rendering](./ssr.md)

## 4. AWS Lambda

Render videos in the cloud using AWS Lambda for scalable, fast rendering:
```bash
npx remotion lambda render <serve-url> <composition-id>
```

See: [Remotion Lambda](./lambda.md)

## 5. Google Cloud Run

Render using Google Cloud Run (alpha):
See: [Cloud Run](./cloudrun.md)

## 6. GitHub Actions

```yaml
# In your workflow
- name: Render video
  run: npx remotion render src/index.ts MyComposition out/video.mp4
```

## Output Formats

| Format | Codec | Command |
|--------|-------|---------|
| MP4 | h264 | `--codec h264` |
| WebM | vp8/vp9 | `--codec vp8` |
| MOV | ProRes | `--codec prores` |
| GIF | - | `out/video.gif` |
| Audio only | aac/mp3 | `--codec aac` |
| Image sequence | - | `--sequence` |
| Still image | - | `remotion still` |
| Transparent video | vp8 | `--codec vp8` |

## CLI Render Options

```bash
npx remotion render [entry] [comp-id] [output]
  --codec           Output codec (h264, vp8, vp9, prores, gif, aac, mp3)
  --frames          Frame range to render (e.g. "0-100")
  --fps             Output FPS override
  --width           Output width override
  --height          Output height override
  --concurrency     Number of threads (default: auto)
  --timeout         Browser timeout in ms (default: 30000)
  --quality         JPEG quality 0-100
  --image-format    Frame format (jpeg, png)
  --scale           Scale factor (e.g. 0.5 for half size)
  --muted           Render without audio
  --sequence        Output as image sequence instead of video
  --props           JSON input props (e.g. '{"title":"Hello"}')
```

## Related Documentation

- [Server-Side Rendering](./ssr.md)
- [Lambda](./lambda.md)
- [Cloud Run](./cloudrun.md)
- [CLI Reference](./cli-reference.md)
- [Encoding settings](https://www.remotion.dev/docs/encoding)

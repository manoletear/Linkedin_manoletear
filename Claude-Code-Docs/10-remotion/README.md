# Remotion Documentation

> Source: https://www.remotion.dev/docs/

Remotion is a framework for creating videos programmatically using React. It allows you to build videos as React components, animate properties using JavaScript, and render them to MP4, WebM, GIF, or other formats.

## What is Remotion?

Remotion gives you a **frame number** and a **blank canvas** — you render anything using React. A video is a function of images over time.

## Documentation Structure

| File | Description |
|------|-------------|
| [getting-started.md](./getting-started.md) | Installation, scaffolding, first project |
| [the-fundamentals.md](./the-fundamentals.md) | React components, compositions, video properties |
| [animating-properties.md](./animating-properties.md) | interpolate(), spring(), useCurrentFrame() |
| [reusability.md](./reusability.md) | Reusing components with Sequence |
| [preview.md](./preview.md) | Remotion Studio preview |
| [using-audio.md](./using-audio.md) | Adding and syncing audio |
| [parameterized-rendering.md](./parameterized-rendering.md) | Dynamic videos with input props |
| [rendering.md](./rendering.md) | Rendering to video files |
| [ssr.md](./ssr.md) | Server-side rendering |
| [lambda.md](./lambda.md) | AWS Lambda rendering |
| [cloudrun.md](./cloudrun.md) | Google Cloud Run rendering |
| [player.md](./player.md) | Embedding the Remotion Player |
| [media-parser.md](./media-parser.md) | Parsing media files |
| [webcodecs.md](./webcodecs.md) | WebCodecs API integration |
| [captions.md](./captions.md) | Adding captions/subtitles |
| [ai.md](./ai.md) | AI integration and Claude Code |
| [cli-reference.md](./cli-reference.md) | CLI commands reference |
| [config.md](./config.md) | Configuration file |
| [timeline.md](./timeline.md) | Timeline component |
| [studio.md](./studio.md) | Remotion Studio |
| [terminology.md](./terminology.md) | Key terms and concepts |
| [upgrading.md](./upgrading.md) | Upgrade guides |

## Key Concepts

- **Composition** — A React component + video metadata (width, height, fps, durationInFrames)
- **Frame** — A single image in the video; first frame is `0`
- **useCurrentFrame()** — Hook to get the current frame number
- **useVideoConfig()** — Hook to get fps, durationInFrames, width, height
- **AbsoluteFill** — Component that fills the entire canvas
- **Sequence** — Component to delay rendering to a specific frame range
- **interpolate()** — Map a frame range to a value range
- **spring()** — Physics-based animation

## Quick Start

```bash
# Create a new Remotion project
npx create-video@latest

# Start the Remotion Studio
npm run dev

# Render to video
npx remotion render src/index.ts MyComposition out/video.mp4
```

## External Links

- Documentation: https://www.remotion.dev/docs/
- API Reference: https://www.remotion.dev/docs/api
- GitHub: https://github.com/remotion-dev/remotion
- Discord: https://remotion.dev/discord
- Templates: https://www.remotion.dev/templates

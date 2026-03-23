# Server-Side Rendering (SSR) in Remotion

> Source: https://www.remotion.dev/docs/ssr

Remotion's rendering engine is built with Node.JS, making it easy to render videos in the cloud.

## Options Comparison

| Method | Best for |
|--------|---------|
| AWS Lambda | Fastest cloud rendering, scalable |
| Vercel Sandbox | Easiest for Vercel customers |
| Node.js API | Custom servers, full control |
| GitHub Actions | CI/CD pipelines |
| Docker | Self-hosted environments |
| Cloud Run | Google Cloud (alpha) |

## Node.js API

### Installation
```bash
npm install @remotion/renderer
```

### Basic Render
```typescript
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

// Step 1: Bundle the project
const bundleLocation = await bundle({
  entryPoint: "./src/index.ts",
  // webpackOverride: (config) => config,  // Optional webpack config
});

// Step 2: Select composition
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: "MyComposition",
  inputProps: { title: "My Video" },
});

// Step 3: Render
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: "out/video.mp4",
  onProgress: ({ progress }) => console.log(`${progress * 100}% rendered`),
});
```

## Node.js API Reference

| Function | Description |
|----------|-------------|
| `getCompositions()` | List available compositions |
| `selectComposition()` | Get a specific composition |
| `renderMedia()` | Render a video or audio |
| `renderFrames()` | Render a series of images |
| `renderStill()` | Render a single image |
| `stitchFramesToVideo()` | Turn images into a video |
| `openBrowser()` | Open a Chrome browser to reuse across renders |
| `ensureBrowser()` | Open a Chrome browser to reuse across renders |
| `makeCancelSignal()` | Create token to cancel a render |
| `getVideoMetadata()` | Get metadata from a video file |
| `getSilentParts()` | Obtain silent portions of a video/audio |

## Render Using GitHub Actions

```yaml
name: Render video
on:
  workflow_dispatch:
jobs:
  render:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@main
      - uses: actions/setup-node@main
      - run: npm i
      - run: npx remotion render MyComp out/video.mp4
      - uses: actions/upload-artifact@v4
        with:
          name: out.mp4
          path: out/video.mp4
```

### With Input Props

```yaml
name: Render video
on:
  workflow_dispatch:
    inputs:
      titleText:
        description: "Which text should it say?"
        required: true
        default: "Welcome to Remotion"
jobs:
  render:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@main
      - uses: actions/setup-node@main
      - run: npm i
      - run: echo $WORKFLOW_INPUT > input-props.json
        env:
          WORKFLOW_INPUT: ${{ toJson(github.event.inputs) }}
      - run: npx remotion render MyComp out/video.mp4 --props="./input-props.json"
      - uses: actions/upload-artifact@v4
        with:
          name: out.mp4
          path: out/video.mp4
```

## Docker

```dockerfile
FROM node:18-bullseye-slim

RUN apt-get update && apt-get install -y \
  chromium \
  --no-install-recommends

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npx remotion render src/index.ts MyComposition out/video.mp4
```

See: [Dockerizing a Remotion project](https://www.remotion.dev/docs/docker)

## Related Documentation

- [Lambda](./lambda.md)
- [Cloud Run](./cloudrun.md)
- [Rendering](./rendering.md)
- [@remotion/renderer API](https://www.remotion.dev/docs/renderer)

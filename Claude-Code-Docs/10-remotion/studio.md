# Remotion Studio

> Source: https://www.remotion.dev/docs/studio

Using the Remotion Studio, you can preview your video, and if a server is connected, even render the video.

## Prerequisites

The Remotion CLI is required. Install it with:

```bash
npm i @remotion/cli
# or
pnpm i @remotion/cli
# or
yarn add @remotion/cli
# or
bun i @remotion/cli
```

## Launching the Studio

Start the Remotion Studio with:

```bash
# For regular templates
npm start

# For Next.js and React Router 7 templates
npm run remotion

# Direct CLI command
npx remotion studio
```

A server will be started on port `3000` (or a higher port if not available) and the Remotion Studio opens in the browser.

## Studio Features

- **Preview** - Preview your video compositions in real-time
- **Timeline** - Navigate the timeline and scrub through frames
- **Props Editor** - Edit component props via the Remotion sidebar
- **Rendering** - Trigger renders directly from the Studio UI
- **Compositions List** - Browse registered compositions

## Related

- [Timeline](./timeline.md)
- [Rendering](./rendering.md)
- [CLI Reference](./cli-reference.md)
- [Getting Started](./getting-started.md)

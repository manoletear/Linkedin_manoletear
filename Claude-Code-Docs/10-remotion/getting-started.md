# Getting Started with Remotion

> Source: https://www.remotion.dev/docs/

Remotion is a framework for creating videos programmatically using React.

## Prerequisites

- Node.js 16 or later, OR Bun 1.0.3 or later
- Basic knowledge of React

## Scaffolding a New Project

```bash
# npm
npx create-video@latest

# pnpm
pnpm create video

# yarn
yarn create video

# bun
bun create video
```

> Note: Linux distros need at least Libc 2.35. Alpine Linux and nixOS are unsupported.

For your first project, choose the **Hello World** template.

## Start the Remotion Studio

```bash
npm run dev
```

This opens the Remotion Studio where you can preview and edit your compositions.

## Installation in Existing Projects

```bash
npm install remotion
```

See the [brownfield guide](https://www.remotion.dev/docs/brownfield) for detailed instructions.

## Project Structure

```
my-remotion-project/
├── src/
│   ├── index.ts          # Entry point — registers compositions
│   ├── Root.tsx          # Root component with <Composition> elements
│   └── MyComposition.tsx # Your video component
├── public/               # Static assets
├── remotion.config.ts    # Configuration (optional)
└── package.json
```

## Your First Composition

```tsx
// src/Root.tsx
import { Composition } from "remotion";
import { MyComposition } from "./MyComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
```

```tsx
// src/MyComposition.tsx
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const MyComposition = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontSize: 100,
        backgroundColor: "white",
      }}
    >
      The current frame is {frame}.
    </AbsoluteFill>
  );
};
```

## Render Your First Video

```bash
# Render using the CLI
npx remotion render src/index.ts MyComposition out/video.mp4

# Or render via Studio UI
# Click the "Render" button in the Remotion Studio
```

## Using with Claude Code (AI)

If you plan to prompt videos with Claude Code, see the [AI integration guide](https://www.remotion.dev/docs/ai/claude-code).

## Related Documentation

- [The Fundamentals](./the-fundamentals.md)
- [Animating Properties](./animating-properties.md)
- [Rendering](./rendering.md)
- [CLI Reference](./cli-reference.md)

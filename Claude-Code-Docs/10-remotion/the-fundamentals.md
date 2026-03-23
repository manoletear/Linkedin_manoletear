# The Fundamentals of Remotion

> Source: https://www.remotion.dev/docs/the-fundamentals

## React Components

Remotion gives you a frame number and a blank canvas. You can render anything using React. A video is a function of images over time - if you change content every frame, you get an animation.

```tsx
// MyComposition.tsx
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

## Video Properties

A video has 4 properties:
- `width` in pixels
- `height` in pixels
- `durationInFrames`: total number of frames
- `fps`: framerate

Use the `useVideoConfig()` hook to access these values:

```tsx
import { AbsoluteFill, useVideoConfig } from "remotion";

export const MyComposition = () => {
  const { fps, durationInFrames, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontSize: 60, backgroundColor: "white" }}>
      This {width}x{height}px video is {durationInFrames / fps} seconds long.
    </AbsoluteFill>
  );
};
```

> Note: A video's first frame is `0` and its last frame is `durationInFrames - 1`.

## Compositions

A composition is the combination of a React component and video metadata. Register it in `src/Root.tsx` using `<Composition>`:

```tsx
// src/Root.tsx
import { Composition } from "remotion";
import { MyComposition } from "./MyComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyComposition"
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      component={MyComposition}
    />
  );
};
```

You can register multiple compositions by wrapping them in a React Fragment: `<><Composition/><Composition/></>`.

## Related
- [Getting Started](./getting-started.md)
- [Animating Properties](./animating-properties.md)
- [Reusability](./reusability.md)
- [Parameterized Rendering](./parameterized-rendering.md)

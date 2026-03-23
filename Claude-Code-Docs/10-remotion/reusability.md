# Making Components Reusable in Remotion

> Source: https://www.remotion.dev/docs/reusability

React components allow you to encapsulate video logic and reuse the same visuals multiple times.

## Reusable Components

```tsx
// MyComposition.tsx
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

const Title: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity, textAlign: "center", fontSize: "7em" }}>
      {title}
    </div>
  );
};

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Title title="Hello World" />
    </AbsoluteFill>
  );
};
```

## Using `<Sequence>` to Time-Shift Components

The `<Sequence>` component limits duration and shifts the frame counter for child components:

```tsx
import { Sequence } from "remotion";

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      {/* First title: shown frames 0-39 */}
      <Sequence durationInFrames={40}>
        <Title title="Hello" />
      </Sequence>

      {/* Second title: shown from frame 40 onwards */}
      {/* Inside the Sequence, useCurrentFrame() returns 0 at frame 40 */}
      <Sequence from={40}>
        <Title title="World" />
      </Sequence>
    </AbsoluteFill>
  );
};
```

## `<Sequence>` Props

| Prop | Type | Description |
|------|------|-------------|
| `from` | `number` | Frame at which the sequence starts (default: 0) |
| `durationInFrames` | `number` | How many frames the sequence is active |
| `layout` | `"absolute-fill"` \| `"none"` | Positioning (default: absolute-fill) |
| `name` | `string` | Label shown in the Remotion Studio |

> **Note:** Inside a `<Sequence>`, `useCurrentFrame()` returns `0` at the start of that sequence. The component is not mounted before `from` frames.

## Combining Sequences

```tsx
export const Timeline = () => {
  return (
    <AbsoluteFill>
      {/* Background: always shown */}
      <Background />

      {/* Intro: 0-60 frames */}
      <Sequence durationInFrames={60}>
        <IntroAnimation />
      </Sequence>

      {/* Main content: 30-180 frames (overlapping with intro at 30-60) */}
      <Sequence from={30} durationInFrames={150}>
        <MainContent />
      </Sequence>

      {/* Outro: 180-240 frames */}
      <Sequence from={180}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
```

## Related Documentation

- [Sequence component API](https://www.remotion.dev/docs/sequence)
- [The Fundamentals](./the-fundamentals.md)
- [Animating Properties](./animating-properties.md)
- [How to combine compositions](https://www.remotion.dev/docs/miscellaneous/snippets/combine-compositions)

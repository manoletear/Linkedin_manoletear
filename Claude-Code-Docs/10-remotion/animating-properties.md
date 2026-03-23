# Animating Properties in Remotion

> Source: https://www.remotion.dev/docs/animating-properties

Animation in Remotion works by changing properties over time based on the current frame number.

## Basic Animation: Fade In

```tsx
// FadeIn.tsx
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const FadeIn = () => {
  const frame = useCurrentFrame();

  const opacity = Math.min(1, frame / 60);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        fontSize: 80,
      }}
    >
      <div style={{ opacity: opacity }}>Hello World!</div>
    </AbsoluteFill>
  );
};
```

This fades text in over 60 frames by mapping frame numbers to opacity values.

## Using `interpolate()`

The `interpolate()` function maps a range of input values to output values:

```tsx
import { interpolate } from "remotion";

const opacity = interpolate(
  frame,          // variable to interpolate
  [0, 60],        // input range
  [0, 1],         // output range
  {
    extrapolateRight: "clamp",  // never exceed output range
  }
);
```

### `interpolate()` Options

| Option | Values | Description |
|--------|--------|-------------|
| `extrapolateLeft` | `"extend"`, `"clamp"`, `"wrap"`, `"identity"` | How to handle values before the input range |
| `extrapolateRight` | `"extend"`, `"clamp"`, `"wrap"`, `"identity"` | How to handle values after the input range |
| `easing` | Easing function | Easing curve to apply |

## Using `spring()` Animations

Spring animations are physics-based and provide natural-looking motion:

```tsx
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const MyVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    // Optional configuration:
    // config: { damping: 200, stiffness: 100, mass: 0.5 }
    // from: 0,  // defaults to 0
    // to: 1,    // defaults to 1
    // delay: 10 // delay start by 10 frames
  });

  return (
    <div style={{ transform: `scale(${scale})` }}>
      Hello World!
    </div>
  );
};
```

### Spring Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `fps` | required | Frames per second (from useVideoConfig) |
| `frame` | required | Current frame (from useCurrentFrame) |
| `from` | `0` | Starting value |
| `to` | `1` | Target value |
| `delay` | `0` | Delay in frames before animation starts |
| `config.damping` | `10` | Controls oscillation (higher = less bouncy) |
| `config.stiffness` | `100` | Controls speed |
| `config.mass` | `1` | Controls inertia |

## Important: Always Use `useCurrentFrame()`

> **Warning:** Do NOT use CSS transitions or setTimeout for animations. These will cause flickering during rendering because Remotion renders frames non-sequentially.

Always drive animations through `useCurrentFrame()`:

```tsx
// WRONG: CSS transition
<div style={{ transition: "opacity 1s", opacity: 1 }}>

// CORRECT: Frame-based
const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
<div style={{ opacity }}>
```

## Combining Animations

```tsx
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const CombinedAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in over frames 0-30
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  // Scale with spring starting at frame 10
  const scale = spring({ fps, frame: Math.max(0, frame - 10) });

  // Move from left
  const translateX = interpolate(frame, [0, 60], [-200, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{
      opacity,
      transform: `scale(${scale}) translateX(${translateX}px)`,
    }}>
      Animated!
    </div>
  );
};
```

## Related Documentation

- [The Fundamentals](./the-fundamentals.md)
- [interpolate() API](https://www.remotion.dev/docs/interpolate)
- [spring() API](https://www.remotion.dev/docs/spring)
- [useCurrentFrame() API](https://www.remotion.dev/docs/use-current-frame)
- [Avoiding flickering](https://www.remotion.dev/docs/flickering)

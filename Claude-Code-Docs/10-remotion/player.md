# @remotion/player

> Source: https://www.remotion.dev/docs/player/

Using the Remotion Player, you can embed Remotion videos in any React app and customize the video content at runtime.

## Installation

```bash
# Using Remotion CLI
npx remotion add @remotion/player

# Using npm
npm i --save-exact @remotion/player

# Using pnpm
pnpm i @remotion/player

# Using bun
bun i @remotion/player
```

> Keep all `@remotion/*` packages at the same version.

## Basic Usage

```tsx
import { Player } from "@remotion/player";
import { MyComposition } from "./MyComposition";

export const App = () => {
  return (
    <Player
      component={MyComposition}
      inputProps={{ title: "Hello!" }}
      durationInFrames={150}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      style={{ width: "100%" }}
      controls
    />
  );
};
```

## `<Player>` Props

| Prop | Type | Description |
|------|------|-------------|
| `component` | `React.FC` | The Remotion component to render |
| `durationInFrames` | `number` | Total number of frames |
| `fps` | `number` | Frames per second |
| `compositionWidth` | `number` | Canvas width in pixels |
| `compositionHeight` | `number` | Canvas height in pixels |
| `inputProps` | `object` | Props passed to the component |
| `style` | `CSSProperties` | CSS styles for the player container |
| `controls` | `boolean` | Show playback controls |
| `loop` | `boolean` | Loop the video |
| `autoPlay` | `boolean` | Autoplay on mount |
| `muted` | `boolean` | Start muted |
| `playbackRate` | `number` | Playback speed multiplier (default: 1) |
| `showVolumeControls` | `boolean` | Show volume slider in controls |
| `clickToPlay` | `boolean` | Click canvas to toggle play/pause |
| `doubleClickToFullscreen` | `boolean` | Double click for fullscreen |
| `spaceKeyToPlayOrPause` | `boolean` | Spacebar to toggle play/pause |
| `moveToBeginningWhenEnded` | `boolean` | Return to frame 0 when video ends |
| `renderPlayPauseButton` | `function` | Custom play/pause button renderer |
| `renderFullscreenButton` | `function` | Custom fullscreen button renderer |
| `initiallyShowControls` | `number` \| `boolean` | Initially visible controls (in ms) |
| `errorFallback` | `function` | Custom error component |
| `renderLoading` | `function` | Custom loading component |

## `<Thumbnail>` Component

Render a static still from a composition:

```tsx
import { Thumbnail } from "@remotion/player";

export const Preview = () => {
  return (
    <Thumbnail
      component={MyComposition}
      compositionWidth={1920}
      compositionHeight={1080}
      frameToDisplay={30}
      durationInFrames={150}
      fps={30}
      style={{ width: "300px" }}
      inputProps={{ title: "Hello!" }}
    />
  );
};
```

## Controlling the Player with a Ref

```tsx
import { Player, PlayerRef } from "@remotion/player";
import { useRef } from "react";

export const App = () => {
  const playerRef = useRef<PlayerRef>(null);

  const handlePlay = () => playerRef.current?.play();
  const handlePause = () => playerRef.current?.pause();
  const handleSeek = (frame: number) => playerRef.current?.seekTo(frame);

  return (
    <>
      <Player
        ref={playerRef}
        component={MyComposition}
        durationInFrames={150}
        fps={30}
        compositionWidth={1920}
        compositionHeight={1080}
      />
      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>
      <button onClick={() => handleSeek(0)}>Go to start</button>
    </>
  );
};
```

## PlayerRef Methods

| Method | Description |
|--------|-------------|
| `play()` | Start playback |
| `pause()` | Pause playback |
| `toggle()` | Toggle play/pause |
| `seekTo(frame)` | Seek to a specific frame |
| `getCurrentFrame()` | Get current frame number |
| `isPlaying()` | Check if playing |
| `getContainerNode()` | Get the DOM container element |
| `mute()` | Mute audio |
| `unmute()` | Unmute audio |
| `setVolume(volume)` | Set volume (0-1) |
| `getVolume()` | Get current volume |
| `isMuted()` | Check if muted |
| `requestFullscreen()` | Enter fullscreen |
| `exitFullscreen()` | Exit fullscreen |

## Listening to Events

```tsx
const playerRef = useRef<PlayerRef>(null);

useEffect(() => {
  if (!playerRef.current) return;

  playerRef.current.addEventListener("play", () => console.log("Playing"));
  playerRef.current.addEventListener("pause", () => console.log("Paused"));
  playerRef.current.addEventListener("ended", () => console.log("Ended"));
  playerRef.current.addEventListener("frameupdate", (e) => {
    console.log("Frame:", e.detail.frame);
  });

  return () => {
    playerRef.current?.removeEventListener("play", ...);
  };
}, []);
```

## Templates with Player

- Next.js (App dir) — `npx create-video@latest` → choose Next.js template
- Next.js (Pages dir)
- React Router 7 (Remix)

## Related Documentation

- [Player API Reference](https://www.remotion.dev/docs/player/api)
- [Player Examples](https://www.remotion.dev/docs/player/examples)
- [Autoplay](https://www.remotion.dev/docs/player/autoplay)
- [The Fundamentals](./the-fundamentals.md)

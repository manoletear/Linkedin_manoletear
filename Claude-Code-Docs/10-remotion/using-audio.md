# Using Audio in Remotion

> Source: https://www.remotion.dev/docs/using-audio

Remotion provides powerful capabilities for working with audio in your compositions.

## Importing Audio

> Source: https://www.remotion.dev/docs/audio/importing

Put an audio file into the `public/` folder and use `staticFile()` to reference it.
Add an `<Html5Audio/>` tag to your component to add sound.

```tsx
// MyComp.tsx
import { AbsoluteFill, Html5Audio, staticFile } from "remotion";

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Html5Audio src={staticFile("audio.mp3")} />
    </AbsoluteFill>
  );
};
```

You can also add remote audio by passing a URL:

```tsx
import { AbsoluteFill, Html5Audio } from "remotion";

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Html5Audio src="https://example.com/audio.mp3" />
    </AbsoluteFill>
  );
};
```

By default, audio plays from the start at full volume. You can mix multiple tracks by adding more audio tags.

## Audio Sections

- **Importing audio** - Import audio from `public/` or remote URLs
- **Delaying audio** - Delay the start time of audio elements
- **Creating audio from video** - Use audio from video files
- **Controlling volume** - Control the volume of audio elements
- **Muting audio** - Mute audio elements
- **Controlling speed** - Change the speed of audio elements
- **Controlling pitch** - Change the pitch of audio elements
- **Visualizing audio** - Visualize audio elements
- **Exporting audio** - Export audio from compositions
- **Order of operations** - Control the order of operations for audio

## See Also

- [Rendering](./rendering.md)
- [SSR](./ssr.md)
- [Player](./player.md)
- [Getting Started](./getting-started.md)

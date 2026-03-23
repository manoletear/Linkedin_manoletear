# Parameterized Videos in Remotion

> Source: https://www.remotion.dev/docs/parameterized-rendering

Remotion allows ingesting, validating, visually editing, and transforming data to parametrize a video. Data may influence the content or the metadata (width, height, duration, framerate).

## Props Flow

1. **Default Props** — Defined statically for Studio design
2. **Input Props** — Override defaults when rendering
3. **calculateMetadata()** — Postprocess props, fetch data, calculate dynamic metadata
4. **Final Props** — Passed to the React component

## Defining Default Props

```tsx
// src/Root.tsx
import { Composition } from "remotion";
import { MyComposition, MyCompositionSchema } from "./MyComposition";

export const RemotionRoot = () => {
  return (
    <Composition
      id="MyComp"
      component={MyComposition}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      // Default props used when not overridden
      defaultProps={{
        title: "Welcome to Remotion!",
        color: "#3498db",
      }}
      // Optional: Zod schema for validation
      schema={MyCompositionSchema}
    />
  );
};
```

## Using Props in a Component

```tsx
// src/MyComposition.tsx
import { z } from "zod";

// Define schema with Zod
export const MyCompositionSchema = z.object({
  title: z.string(),
  color: z.string(),
});

type Props = z.infer<typeof MyCompositionSchema>;

export const MyComposition: React.FC<Props> = ({ title, color }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: color }}>
      <h1>{title}</h1>
    </AbsoluteFill>
  );
};
```

## Passing Input Props via CLI

```bash
# Inline JSON
npx remotion render MyComp out/video.mp4 --props='{"title":"Hello","color":"red"}'

# From a file
npx remotion render MyComp out/video.mp4 --props=./my-props.json
```

## Passing Input Props via Node.js API

```typescript
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: "out/video.mp4",
  inputProps: {
    title: "Hello World",
    color: "#ff0000",
  },
});
```

## Dynamic Metadata with `calculateMetadata()`

```tsx
import { Composition } from "remotion";
import type { CalculateMetadataFunction } from "remotion";

type Props = {
  videoUrl: string;
};

// Dynamically calculate duration from an external video
const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const { durationInSeconds } = await getVideoMetadata(props.videoUrl);

  return {
    durationInFrames: Math.floor(durationInSeconds * 30),
    fps: 30,
    width: 1920,
    height: 1080,
  };
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="DynamicVideo"
      component={DynamicComposition}
      calculateMetadata={calculateMetadata}
      defaultProps={{ videoUrl: "https://example.com/video.mp4" }}
    />
  );
};
```

## Data Fetching in Components

```tsx
import { delayRender, continueRender, staticFile } from "remotion";

export const DataFetchingComp = () => {
  const [data, setData] = useState(null);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    fetch("https://api.example.com/data")
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        continueRender(handle);
      });
  }, [handle]);

  if (!data) return null;

  return <div>{data.title}</div>;
};
```

> **Important:** Use `delayRender()` + `continueRender()` to pause rendering until async data is ready.

## Related Documentation

- [Passing Props](https://www.remotion.dev/docs/passing-props)
- [Schemas (Zod validation)](https://www.remotion.dev/docs/schemas)
- [Data Fetching](https://www.remotion.dev/docs/data-fetching)
- [Dynamic Metadata](https://www.remotion.dev/docs/dynamic-metadata)
- [Player (real-time updates)](./player.md)
- [Rendering](./rendering.md)

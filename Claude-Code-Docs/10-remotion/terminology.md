# Remotion Terminology

> Source: https://www.remotion.dev/docs/terminology

Key terms used in the Remotion documentation.

## Composition

A **Composition** is the combination of a React component and video metadata (width, height, fps, durationInFrames). Registered in `src/Root.tsx` with `<Composition>` component.

## Sequence

A **Sequence** is a component that offsets the timing of its children. Use it to lay out multiple components across a timeline.

## Composition ID

The **Composition ID** is the unique string identifier passed as the `id` prop to `<Composition>`. Used to select which composition to render.

## Bundle

A **Remotion Bundle** is a built/compiled version of your Remotion project. Created with `npx remotion bundle` or via the `bundle()` API.

## Serve URL

A **Serve URL** is the URL at which a Remotion Bundle is served. Used when rendering with Lambda or Cloud Run.

## Public Dir

The **Public Dir** is the folder (`public/` by default) where static assets are stored. Access files with `staticFile()`.

## Remotion Root

The **Remotion Root** is the root component exported from your entry point. It must return `<Composition>` elements.

## Entry Point

The **Entry Point** is the file that exports the Remotion Root component (typically `src/index.ts` or `src/Root.tsx`).

## Remotion Studio

The **Remotion Studio** is the browser-based IDE for previewing and rendering compositions. Started with `npm start` or `npx remotion studio`.

## Remotion Player

The **Remotion Player** is the `<Player>` component from `@remotion/player`. Embeds a Remotion composition in a React app.

## Concurrency

**Concurrency** is the number of browser tabs (or Lambda functions) used in parallel during rendering. Higher = faster but more resources.

## Input Props

**Input Props** are props passed to a composition at render time, overriding default props. Passed via `--props` CLI flag or the `inputProps` option.

## Cloud Run URL

**Cloud Run URL** is the URL of a deployed Remotion Cloud Run service endpoint.

## Service Name

**Service Name** is the identifier for a deployed Remotion Lambda or Cloud Run service.

## Related

- [Getting Started](./getting-started.md)
- [The Fundamentals](./the-fundamentals.md)
- [Parameterized Rendering](./parameterized-rendering.md)
- [Player](./player.md)
- [Lambda](./lambda.md)

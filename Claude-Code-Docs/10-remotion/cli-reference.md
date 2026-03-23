# Remotion CLI Reference

> Source: https://www.remotion.dev/docs/cli

## How to Use

Install `@remotion/cli` and run with:

- `npx remotion` in an npm project
- `yarn remotion` in a Yarn project
- `pnpm exec remotion` in a pnpm project
- `bunx remotion` in a Bun project

Inside an npm script, the `npx` prefix is not needed:

```json
// package.json
{
  "scripts": {
    "render": "remotion render"
  }
}
```

### Using Bun (v4.0.118+)

By default, `npx remotion` uses Node.js. To use Bun, replace `remotion` with `remotionb`:

```json
{
  "scripts": {
    "render": "remotionb render"
  }
}
```

## Commands

| Command | Description |
|---------|-------------|
| `studio` | Start the Remotion Studio |
| `render` | Render video or audio |
| `still` | Render a still image |
| `compositions` | List available compositions |
| `lambda` | Control Remotion Lambda |
| `bundle` | Create a Remotion Bundle |
| `browser` | Ensure Remotion has a browser to use |
| `cloudrun` | Control Remotion Cloud Run |
| `benchmark` | Measure and optimize render times |
| `skills` | Install or update skills |
| `versions` | List and validate Remotion package versions |
| `upgrade` | Upgrade to a newer version |
| `add` | Add Remotion packages with matching version |
| `gpu` | Print information about Chrome's GPU usage |
| `ffmpeg` | Execute an ffmpeg command |
| `ffprobe` | Execute an ffprobe command |
| `help` | Show CLI commands |

## Example

```bash
npx remotion render --codec=vp8 HelloWorld out/video.webm
```

## Related

- [Rendering](./rendering.md)
- [Config](./config.md)
- [Lambda](./lambda.md)
- [Studio](./studio.md)

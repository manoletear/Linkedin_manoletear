# Remotion Configuration File

> Source: https://www.remotion.dev/docs/config

Remotion uses `remotion.config.ts` for project-level configuration.

## Usage

```ts
// remotion.config.ts
import { Config } from "@remotion/cli/config";

Config.setCachingEnabled(false);
Config.setPublicDir("./public");
Config.setEntryPoint("./src/index.ts");
```

## Key Configuration Functions

### Studio & Dev Server
- `Config.setStudioPort(port)` - Set the Studio port (default: 3000)
- `Config.setRendererPort(port)` - Set the renderer port
- `Config.setShouldOpenBrowser(bool)` - Open browser on start
- `Config.setKeyboardShortcutsEnabled(bool)` - Enable keyboard shortcuts
- `Config.setMaxTimelineTracks(n)` - Max visible timeline tracks

### Build & Bundling
- `Config.overrideWebpackConfig(fn)` - Customize webpack config
- `Config.setCachingEnabled(bool)` - Enable/disable webpack caching
- `Config.setPublicDir(path)` - Set public assets directory
- `Config.setBundleOutDir(path)` - Set bundle output directory
- `Config.setEntryPoint(path)` - Set entry point file
- `Config.setExperimentalRspackEnabled(bool)` - Use Rspack instead of webpack

### Browser & Chrome
- `Config.setBrowserExecutable(path)` - Use custom Chrome binary
- `Config.setChromiumDisableWebSecurity(bool)` - Disable web security
- `Config.setChromiumIgnoreCertificateErrors(bool)` - Ignore SSL errors
- `Config.setChromiumHeadlessMode(mode)` - Set headless mode
- `Config.setChromiumOpenGlRenderer(renderer)` - Set OpenGL renderer
- `Config.setChromeMode(mode)` - Set Chrome mode (headless-shell or chrome)

### Rendering
- `Config.setDelayRenderTimeoutInMilliseconds(ms)` - delayRender timeout
- `Config.setNumberOfSharedAudioTags(n)` - Shared audio tags for preview
- `Config.setLevel(level)` - Log level (verbose, info, warn, error)

### Benchmarking
- `Config.setBenchmarkRuns(n)` - Number of benchmark runs
- `Config.setBenchmarkConcurrencies(n[])` - Benchmark concurrency levels

## Example: Override Webpack

```ts
import { Config } from "@remotion/cli/config";
import path from "path";

Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    resolve: {
      ...currentConfiguration.resolve,
      alias: {
        ...currentConfiguration.resolve?.alias,
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
```

## Related

- [CLI Reference](./cli-reference.md)
- [Rendering](./rendering.md)
- [Getting Started](./getting-started.md)

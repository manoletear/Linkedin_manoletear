# @remotion/cloudrun

> Source: https://www.remotion.dev/docs/cloudrun

> **EXPERIMENTAL**: Cloud Run is in Alpha status and not actively being developed.

Render Remotion videos on [GCP Cloud Run](https://cloud.google.com/run).

## When to Use

Use Cloud Run if you are comfortable using Google Cloud Platform in one of the supported regions.
Otherwise, use normal [Server-Side Rendering (SSR)](./ssr.md).

## How It Works

**Deployment:**
- Remotion publishes Docker images to a public GCP artifact registry
- Deploy a Cloud Run service to your GCP project (uses latest image by default)

**Rendering:**
1. A Cloud Run service and Cloud Storage bucket are created in GCP
2. Your Remotion project is deployed to Cloud Storage as a website
3. The Cloud Run service is invoked and renders the video/still
4. The final file is uploaded to Cloud Storage for download

## Architecture

- **Cloud Run service** - Contains libraries/binaries for rendering, accessible via URL
- **Cloud Storage bucket** - Stores projects, renders, and render metadata
- **CLI** - Control via `npx remotion cloudrun` (requires `@remotion/cloudrun` package)
- **Node.JS API** - Programmatic control with the same features as CLI

## Limits

| Resource | Limit |
|----------|-------|
| Max memory | 32 GB |
| Max vCPUs | 8 |
| Max filesystem | 32 GB |
| Max timeout | 60 minutes |

## Supported Regions

asia-east1, asia-east2, asia-northeast1, asia-northeast2, asia-northeast3, asia-south1, asia-south2,
asia-southeast1, asia-southeast2, australia-southeast1, australia-southeast2, europe-central2,
europe-north1, europe-southwest1, europe-west1-9, me-west1, northamerica-northeast1-2,
southamerica-east1, southamerica-west1, us-central1, us-east1-5, us-south1, us-west1-4

## CLI Usage

```bash
npx remotion cloudrun deploy
npx remotion cloudrun render
npx remotion cloudrun sites create
```

## License

Standard Remotion license applies. Companies using cloud rendering need Cloud Rendering Units.
See: https://remotion.pro/license

## Related

- [Lambda](./lambda.md)
- [SSR](./ssr.md)
- [Rendering](./rendering.md)
- [CLI Reference](./cli-reference.md)

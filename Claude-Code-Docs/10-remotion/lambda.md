# Remotion Lambda

> Source: https://www.remotion.dev/docs/lambda

Render Remotion videos on AWS Lambda. This is the fastest and most scalable way to render Remotion videos. You only pay while rendering, making it cost-effective.

## When to Use Lambda

- Videos less than 80 minutes at Full HD (within 15-minute AWS Lambda timeout)
- You are within AWS Lambda concurrency limits
- You can use Amazon Web Services in a supported region

For other cases, consider [server-side rendering](./ssr.md) or [Cloud Run](./cloudrun.md).

## How It Works

1. A Lambda function and S3 bucket are created on AWS
2. Your Remotion project gets deployed to S3 as a website
3. The Lambda function opens the Remotion project
4. Many Lambda functions are created in parallel — each renders a chunk of frames
5. The chunks are merged into the final video

## Quick Setup

### 1. Install
```bash
npm install @remotion/lambda
```

### 2. Create AWS Credentials
```bash
# Set environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=us-east-1
```

Or use an `.env` file:
```
REMOTION_AWS_ACCESS_KEY_ID=...
REMOTION_AWS_SECRET_ACCESS_KEY=...
```

### 3. Set Up AWS Infrastructure
```bash
# Create role
npx remotion lambda policies validate

# Deploy Lambda function
npx remotion lambda functions deploy

# Deploy your site to S3
npx remotion lambda sites create src/index.ts --site-name=my-site
```

### 4. Render
```bash
npx remotion lambda render <serve-url> <composition-id>

# Example
npx remotion lambda render https://s3.amazonaws.com/... MyComposition
```

## Node.js API

```typescript
import {
  deploySite,
  renderMediaOnLambda,
  getRenderProgress,
  downloadMedia,
} from "@remotion/lambda";

// Deploy site to S3
const { serveUrl } = await deploySite({
  entryPoint: "./src/index.ts",
  bucketName: "my-remotion-bucket",
  siteName: "my-site",
});

// Start render
const { renderId, bucketName } = await renderMediaOnLambda({
  region: "us-east-1",
  functionName: "remotion-render",
  serveUrl,
  composition: "MyComposition",
  inputProps: { title: "Hello" },
  codec: "h264",
  imageFormat: "jpeg",
  maxRetries: 1,
  framesPerLambda: 40,
  downloadBehavior: { type: "download", fileName: "video.mp4" },
});

// Poll for progress
while (true) {
  const progress = await getRenderProgress({
    renderId,
    bucketName,
    functionName: "remotion-render",
    region: "us-east-1",
  });

  if (progress.done) {
    console.log("Render complete!", progress.outputFile);
    break;
  }
  console.log(`Progress: ${progress.overallProgress * 100}%`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
```

## Lambda CLI Commands

```bash
# Manage functions
npx remotion lambda functions deploy    # Deploy Lambda function
npx remotion lambda functions ls        # List deployed functions
npx remotion lambda functions rm        # Remove a function

# Manage sites
npx remotion lambda sites create        # Deploy site to S3
npx remotion lambda sites ls            # List deployed sites
npx remotion lambda sites rm            # Remove a site

# Render
npx remotion lambda render <url> <id>   # Start a render
npx remotion lambda still <url> <id>    # Render a still

# Manage renders
npx remotion lambda renders ls          # List renders
npx remotion lambda renders rm          # Remove render artifacts

# Policies
npx remotion lambda policies validate   # Validate IAM permissions
npx remotion lambda policies print      # Print required IAM policy
```

## Key Lambda API Functions

| Function | Description |
|----------|-------------|
| `deployFunction()` | Deploy the Lambda function |
| `deploySite()` | Deploy project to S3 |
| `renderMediaOnLambda()` | Start a Lambda render |
| `renderStillOnLambda()` | Render a still on Lambda |
| `getRenderProgress()` | Poll render status |
| `downloadMedia()` | Download rendered video |
| `deleteSite()` | Remove a site from S3 |
| `deleteFunction()` | Remove Lambda function |
| `getSites()` | List all sites |
| `getFunctions()` | List all functions |

## Cost

You pay for AWS Lambda compute time + S3 storage. Typical costs:
- ~$0.0001 per second of Lambda compute (1GB RAM)
- ~$0.023 per GB of S3 storage per month
- A 1-minute video at 30fps typically costs a few cents

## Related Documentation

- [Server-Side Rendering](./ssr.md)
- [Cloud Run](./cloudrun.md)
- [Rendering](./rendering.md)
- [Lambda API Reference](https://www.remotion.dev/docs/lambda/api)

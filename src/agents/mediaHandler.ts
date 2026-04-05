import { generateLinkedInImage } from "../generate-image";
import { createLinkedInPdf } from "../create-pdf";
import { uploadImage } from "../upload/upload-image";
import { uploadPdf } from "../upload/upload-pdf";
import { uploadVideo } from "../upload/upload-video";
import { logger } from "../services/logger";

export type MediaAsset = {
  type: "image" | "pdf" | "video";
  localPath: string;
  remoteUrl?: string;
};

export async function prepareImageAsset(
  theme: string
): Promise<MediaAsset> {
  const localPath = `out/${Date.now()}-linkedin-image.png`;
  await generateLinkedInImage(theme, localPath);
  return { type: "image", localPath };
}

export async function preparePdfAsset(
  title: string,
  points: string[]
): Promise<MediaAsset> {
  const localPath = `out/${Date.now()}-linkedin-report.pdf`;
  await createLinkedInPdf(title, points, localPath);
  return { type: "pdf", localPath };
}

export async function uploadAsset(asset: MediaAsset): Promise<MediaAsset> {
  try {
    switch (asset.type) {
      case "image":
        asset.remoteUrl = await uploadImage(asset.localPath);
        break;
      case "pdf":
        asset.remoteUrl = await uploadPdf(asset.localPath);
        break;
      case "video":
        asset.remoteUrl = await uploadVideo(asset.localPath);
        break;
    }
    logger.info({ type: asset.type, url: asset.remoteUrl }, "Asset uploaded");
  } catch (error) {
    logger.error({ error, type: asset.type }, "Asset upload failed");
    throw error;
  }
  return asset;
}

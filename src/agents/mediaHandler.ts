import { generateLinkedInImage } from "../generate-image";
import { createLinkedInPdf } from "../create-pdf";
import { logger } from "../services/logger";

export type MediaAsset = {
  type: "image" | "pdf" | "video";
  localPath: string;
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

import { DraftPost } from "../types";
import {
  createTextPost,
  createImagePost,
  createDocumentPost,
  createVideoPost,
} from "../services/linkedinApi";
import { MediaAsset } from "./mediaHandler";
import { logger } from "../services/logger";

export type PublishResult = {
  success: boolean;
  postId?: string;
  error?: string;
};

export async function publish(
  draft: DraftPost,
  media?: MediaAsset
): Promise<PublishResult> {
  try {
    let postId: string;

    if (!media) {
      postId = await createTextPost(draft.fullText);
    } else {
      switch (media.type) {
        case "image":
          postId = await createImagePost(draft.fullText, media.localPath);
          break;
        case "pdf":
          postId = await createDocumentPost(
            draft.fullText,
            media.localPath,
            draft.hook // Use hook as PDF title
          );
          break;
        case "video":
          postId = await createVideoPost(draft.fullText, media.localPath);
          break;
        default:
          postId = await createTextPost(draft.fullText);
      }
    }

    logger.info(
      { postId, draftId: draft.draftId, mediaType: media?.type || "text" },
      "Published successfully"
    );
    return { success: true, postId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ error: message, draftId: draft.draftId }, "Publish failed");
    return { success: false, error: message };
  }
}

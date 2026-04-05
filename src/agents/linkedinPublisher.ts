import { DraftPost } from "../types";
import { createTextPost } from "../services/linkedinApi";
import { logger } from "../services/logger";

export async function publish(
  draft: DraftPost
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    const postId = await createTextPost(draft.fullText);
    logger.info({ postId, draftId: draft.draftId }, "Published successfully");
    return { success: true, postId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ error: message, draftId: draft.draftId }, "Publish failed");
    return { success: false, error: message };
  }
}

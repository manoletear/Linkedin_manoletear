import axios, { AxiosError } from "axios";
import { env } from "../config/env";
import { logger } from "./logger";

const API_BASE = "https://api.linkedin.com/v2";

function getHeaders() {
  return {
    Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0",
  };
}

export async function createTextPost(text: string): Promise<string> {
  const authorUrn = env.LINKEDIN_PERSON_URN;

  if (!authorUrn || !env.LINKEDIN_ACCESS_TOKEN) {
    throw new Error(
      "LinkedIn credentials not configured. Set LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN in .env"
    );
  }

  const payload = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text,
        },
        shareMediaCategory: "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  try {
    const response = await axios.post(`${API_BASE}/ugcPosts`, payload, {
      headers: getHeaders(),
    });

    const postId = response.headers["x-restli-id"] || response.data.id || "";
    logger.info({ postId }, "Post published to LinkedIn");
    return postId;
  } catch (error) {
    const axiosError = error as AxiosError;
    logger.error(
      {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      },
      "LinkedIn API error"
    );
    throw error;
  }
}

export async function getPostMetrics(postUrn: string): Promise<{
  impressions: number;
  likes: number;
  comments: number;
  reposts: number;
}> {
  try {
    const response = await axios.get(
      `${API_BASE}/socialActions/${encodeURIComponent(postUrn)}`,
      { headers: getHeaders() }
    );

    return {
      impressions: 0,
      likes: response.data.likesSummary?.totalLikes || 0,
      comments: response.data.commentsSummary?.totalFirstLevelComments || 0,
      reposts: response.data.sharesSummary?.totalShares || 0,
    };
  } catch {
    return { impressions: 0, likes: 0, comments: 0, reposts: 0 };
  }
}

import axios, { AxiosError } from "axios";
import fs from "node:fs";
import { env } from "../config/env";
import { logger } from "./logger";

const API_BASE = "https://api.linkedin.com/v2";

function getHeaders(contentType = "application/json") {
  return {
    Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
    "Content-Type": contentType,
    "X-Restli-Protocol-Version": "2.0.0",
  };
}

function getAuthorUrn(): string {
  if (!env.LINKEDIN_PERSON_URN || !env.LINKEDIN_ACCESS_TOKEN) {
    throw new Error(
      "LinkedIn credentials not configured. Set LINKEDIN_ACCESS_TOKEN and LINKEDIN_PERSON_URN in .env"
    );
  }
  return env.LINKEDIN_PERSON_URN;
}

// --- Text Post ---

export async function createTextPost(text: string): Promise<string> {
  const authorUrn = getAuthorUrn();

  const payload = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  return await postToLinkedIn(payload);
}

// --- Image Post ---

export async function createImagePost(
  text: string,
  imagePath: string
): Promise<string> {
  const authorUrn = getAuthorUrn();

  // 1. Register upload
  const uploadUrl = await registerImageUpload(authorUrn);

  // 2. Upload binary
  await uploadImageBinary(uploadUrl.uploadUrl, imagePath);

  // 3. Create post with image asset
  const payload = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "IMAGE",
        media: [
          {
            status: "READY",
            media: uploadUrl.asset,
          },
        ],
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  return await postToLinkedIn(payload);
}

async function registerImageUpload(
  authorUrn: string
): Promise<{ uploadUrl: string; asset: string }> {
  const response = await axios.post(
    `${API_BASE}/assets?action=registerUpload`,
    {
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: authorUrn,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent",
          },
        ],
      },
    },
    { headers: getHeaders() }
  );

  const uploadMechanism =
    response.data.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ];

  return {
    uploadUrl: uploadMechanism.uploadUrl,
    asset: response.data.value.asset,
  };
}

async function uploadImageBinary(
  uploadUrl: string,
  imagePath: string
): Promise<void> {
  const imageBuffer = fs.readFileSync(imagePath);
  await axios.put(uploadUrl, imageBuffer, {
    headers: {
      Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
      "Content-Type": "image/png",
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  logger.info("Image binary uploaded");
}

// --- Document (PDF) Post ---

export async function createDocumentPost(
  text: string,
  pdfPath: string,
  title: string
): Promise<string> {
  const authorUrn = getAuthorUrn();

  // 1. Register upload
  const uploadUrl = await registerDocumentUpload(authorUrn);

  // 2. Upload binary
  await uploadDocumentBinary(uploadUrl.uploadUrl, pdfPath);

  // 3. Create post with document asset
  const payload = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status: "READY",
            media: uploadUrl.asset,
            title: { text: title },
          },
        ],
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  return await postToLinkedIn(payload);
}

async function registerDocumentUpload(
  authorUrn: string
): Promise<{ uploadUrl: string; asset: string }> {
  const response = await axios.post(
    `${API_BASE}/assets?action=registerUpload`,
    {
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-document"],
        owner: authorUrn,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent",
          },
        ],
      },
    },
    { headers: getHeaders() }
  );

  const uploadMechanism =
    response.data.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ];

  return {
    uploadUrl: uploadMechanism.uploadUrl,
    asset: response.data.value.asset,
  };
}

async function uploadDocumentBinary(
  uploadUrl: string,
  pdfPath: string
): Promise<void> {
  const pdfBuffer = fs.readFileSync(pdfPath);
  await axios.put(uploadUrl, pdfBuffer, {
    headers: {
      Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
      "Content-Type": "application/pdf",
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  logger.info("Document binary uploaded");
}

// --- Video Post ---

export async function createVideoPost(
  text: string,
  videoPath: string
): Promise<string> {
  const authorUrn = getAuthorUrn();

  // 1. Register upload
  const uploadUrl = await registerVideoUpload(authorUrn);

  // 2. Upload binary
  await uploadVideoBinary(uploadUrl.uploadUrl, videoPath);

  // 3. Create post with video asset
  const payload = {
    author: authorUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "VIDEO",
        media: [
          {
            status: "READY",
            media: uploadUrl.asset,
          },
        ],
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  return await postToLinkedIn(payload);
}

async function registerVideoUpload(
  authorUrn: string
): Promise<{ uploadUrl: string; asset: string }> {
  const response = await axios.post(
    `${API_BASE}/assets?action=registerUpload`,
    {
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-video"],
        owner: authorUrn,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent",
          },
        ],
      },
    },
    { headers: getHeaders() }
  );

  const uploadMechanism =
    response.data.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ];

  return {
    uploadUrl: uploadMechanism.uploadUrl,
    asset: response.data.value.asset,
  };
}

async function uploadVideoBinary(
  uploadUrl: string,
  videoPath: string
): Promise<void> {
  const videoBuffer = fs.readFileSync(videoPath);
  await axios.put(uploadUrl, videoBuffer, {
    headers: {
      Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
      "Content-Type": "video/mp4",
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  logger.info("Video binary uploaded");
}

// --- Metrics ---

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

// --- Helpers ---

async function postToLinkedIn(payload: object): Promise<string> {
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

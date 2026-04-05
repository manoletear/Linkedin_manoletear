export type RawNewsItem = {
  id?: string;
  source: string;
  title: string;
  url: string;
  summary?: string;
  publishedAt: string;
  author?: string;
  imageUrl?: string;
  tags?: string[];
  rawText?: string;
};

export type NormalizedNewsItem = {
  id: string;
  source: string;
  title: string;
  url: string;
  summary: string;
  publishedAt: string;
  canonicalText: string;
  entities: string[];
  themes: string[];
  imageUrl?: string;
};

export type RankedNewsItem = NormalizedNewsItem & {
  recencyScore: number;
  sourceAuthorityScore: number;
  relevanceScore: number;
  noveltyScore: number;
  discussionPotentialScore: number;
  finalScore: number;
};

export type EditorialDecision = {
  publishWorthy: boolean;
  rationale: string;
  contentAngles: string[];
  riskFlags: string[];
};

export type ContentAngle = {
  angleId: string;
  title: string;
  thesis: string;
  audienceFit: string;
  whyNow: string;
};

export type GridOption = {
  optionId: string;
  newsId: string;
  headline: string;
  angle: string;
  format: "text" | "image" | "pdf" | "video";
  estimatedEngagement: number;
  estimatedAuthorityLift: number;
  reason: string;
};

export type DraftPost = {
  draftId: string;
  optionId: string;
  variant: 1 | 2 | 3;
  hook: string;
  body: string;
  closing: string;
  fullText: string;
  hashtags?: string[];
};

export type DraftEvaluation = {
  draftId: string;
  originality: number;
  clarity: number;
  authority: number;
  engagementPotential: number;
  savePotential: number;
  totalScore: number;
  strengths: string[];
  weaknesses: string[];
};

export type UserContentProfile = {
  sectors: string[];
  keywords: string[];
  preferredTone: "analytical" | "provocative" | "practical" | "executive";
  targetAudience: string;
  publishingGoal: "community_growth" | "authority" | "lead_gen" | "brand";
  preferredFormats: ("text" | "image" | "pdf" | "video")[];
};

export type PublishRequest = {
  draftId: string;
  mediaType?: "image" | "pdf" | "video";
  mediaPath?: string;
  publishNow: boolean;
};

export type PublishedPostRecord = {
  id: string;
  draftId: string;
  optionId: string;
  newsId: string;
  sector: string;
  hookType: string;
  tone: string;
  format: string;
  fullText: string;
  linkedinPostId?: string;
  publishedAt: string;
  impressions?: number;
  likes?: number;
  comments?: number;
  reposts?: number;
};

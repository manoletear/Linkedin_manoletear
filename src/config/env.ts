import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().default(""),
  LINKEDIN_ACCESS_TOKEN: z.string().default(""),
  LINKEDIN_PERSON_URN: z.string().default(""),
  SUPABASE_URL: z.string().default(""),
  SUPABASE_ANON_KEY: z.string().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(""),
  GCP_PROJECT: z.string().default(""),
  GCP_LOCATION: z.string().default("us-central1"),
  RSS_FEEDS: z.string().default(""),
  DEFAULT_SECTOR: z.string().default("technology"),
  DEFAULT_LANGUAGE: z.string().default("es"),
  LOG_LEVEL: z.string().default("info"),
});

export const env = envSchema.parse(process.env);

export function getRssFeeds(): string[] {
  return env.RSS_FEEDS.split(",").map((f) => f.trim()).filter(Boolean);
}

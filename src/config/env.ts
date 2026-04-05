import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  // LLM providers (at least one required)
  GROQ_API_KEY: z.string().default(""),
  CEREBRAS_API_KEY: z.string().default(""),

  // LinkedIn OAuth 2.0
  LINKEDIN_ACCESS_TOKEN: z.string().default(""),
  LINKEDIN_PERSON_URN: z.string().default(""),

  // Supabase
  SUPABASE_URL: z.string().default(""),
  SUPABASE_ANON_KEY: z.string().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(""),

  // Gemini (Google AI Studio - free)
  GEMINI_API_KEY: z.string().default(""),

  // Ollama / Gemma 4 (local fallback)
  OLLAMA_URL: z.string().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("gemma4:27b"),

  // RSS Feeds (comma-separated)
  RSS_FEEDS: z.string().default(""),

  // Agent config
  DEFAULT_SECTOR: z.string().default("technology"),
  DEFAULT_LANGUAGE: z.string().default("es"),
  LOG_LEVEL: z.string().default("info"),
});

export const env = envSchema.parse(process.env);

export function getRssFeeds(): string[] {
  return env.RSS_FEEDS.split(",").map((f) => f.trim()).filter(Boolean);
}

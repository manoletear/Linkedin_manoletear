import Groq from "groq-sdk";
import axios from "axios";
import { env } from "../config/env";
import { logger } from "./logger";

// --- Providers ---

type LLMProvider = "groq" | "cerebras";

function getActiveProvider(): LLMProvider {
  if (env.GROQ_API_KEY) return "groq";
  if (env.CEREBRAS_API_KEY) return "cerebras";
  throw new Error(
    "No LLM API key configured. Set GROQ_API_KEY or CEREBRAS_API_KEY in .env"
  );
}

// --- Groq (Llama 3.3 70B) ---

let groqClient: Groq | null = null;

function getGroq(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: env.GROQ_API_KEY });
  }
  return groqClient;
}

async function groqComplete(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
  const groq = getGroq();

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    ...(jsonMode && { response_format: { type: "json_object" } }),
  });

  return response.choices[0]?.message?.content || "";
}

// --- Cerebras (Llama 3.3 70B) ---

const CEREBRAS_BASE = "https://api.cerebras.ai/v1";

async function cerebrasComplete(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
  const response = await axios.post(
    `${CEREBRAS_BASE}/chat/completions`,
    {
      model: "llama-3.3-70b",
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      ...(jsonMode && { response_format: { type: "json_object" } }),
    },
    {
      headers: {
        Authorization: `Bearer ${env.CEREBRAS_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0]?.message?.content || "";
}

// --- Public API ---

export async function llmComplete(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const provider = getActiveProvider();
  const fallback = provider === "groq" && env.CEREBRAS_API_KEY;

  try {
    logger.info(`LLM request via ${provider}`);
    if (provider === "groq") {
      return await groqComplete(systemPrompt, userPrompt);
    }
    return await cerebrasComplete(systemPrompt, userPrompt);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.warn(`${provider} failed: ${msg}`);

    // Fallback to secondary provider
    if (fallback) {
      logger.info("Falling back to Cerebras...");
      return await cerebrasComplete(systemPrompt, userPrompt);
    }
    if (provider === "cerebras" && env.GROQ_API_KEY) {
      logger.info("Falling back to Groq...");
      return await groqComplete(systemPrompt, userPrompt);
    }

    throw error;
  }
}

export async function llmCompleteJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const provider = getActiveProvider();
  const fallback = provider === "groq" && env.CEREBRAS_API_KEY;

  const jsonSystemPrompt =
    systemPrompt +
    "\n\nResponde EXCLUSIVAMENTE con JSON valido. Sin markdown, sin texto adicional, sin ```json.";

  try {
    logger.info(`LLM JSON request via ${provider}`);
    let raw: string;
    if (provider === "groq") {
      raw = await groqComplete(jsonSystemPrompt, userPrompt, true);
    } else {
      raw = await cerebrasComplete(jsonSystemPrompt, userPrompt, true);
    }
    return parseJSON<T>(raw);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.warn(`${provider} JSON failed: ${msg}`);

    // Fallback
    if (fallback) {
      logger.info("JSON fallback to Cerebras...");
      const raw = await cerebrasComplete(jsonSystemPrompt, userPrompt, true);
      return parseJSON<T>(raw);
    }
    if (provider === "cerebras" && env.GROQ_API_KEY) {
      logger.info("JSON fallback to Groq...");
      const raw = await groqComplete(jsonSystemPrompt, userPrompt, true);
      return parseJSON<T>(raw);
    }

    throw error;
  }
}

function parseJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

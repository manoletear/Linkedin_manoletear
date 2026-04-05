import Groq from "groq-sdk";
import axios from "axios";
import { env } from "../config/env";
import { logger } from "./logger";

// --- Provider Chain: Groq → Cerebras → Gemma (Ollama local) ---

type LLMProvider = "groq" | "cerebras" | "ollama";

function getProviderChain(): LLMProvider[] {
  const chain: LLMProvider[] = [];
  if (env.GROQ_API_KEY) chain.push("groq");
  if (env.CEREBRAS_API_KEY) chain.push("cerebras");
  chain.push("ollama"); // Always available as last resort (local)
  return chain;
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

// --- Ollama / Gemma 4 (Local) ---

const OLLAMA_BASE = env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = env.OLLAMA_MODEL || "gemma4:27b";

async function ollamaComplete(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
  const response = await axios.post(
    `${OLLAMA_BASE}/api/chat`,
    {
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      ...(jsonMode && { format: "json" }),
    },
    { timeout: 120000 } // Local models can be slower
  );

  return response.data.message?.content || "";
}

/**
 * Check if Ollama is running and the model is available.
 */
async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await axios.get(`${OLLAMA_BASE}/api/tags`, {
      timeout: 3000,
    });
    const models = response.data.models || [];
    return models.some(
      (m: { name: string }) =>
        m.name.startsWith(OLLAMA_MODEL.split(":")[0])
    );
  } catch {
    return false;
  }
}

// --- Unified completions with chain fallback ---

type CompleteFn = (
  system: string,
  user: string,
  json?: boolean
) => Promise<string>;

function getCompleteFn(provider: LLMProvider): CompleteFn {
  switch (provider) {
    case "groq":
      return groqComplete;
    case "cerebras":
      return cerebrasComplete;
    case "ollama":
      return ollamaComplete;
  }
}

async function executeWithFallback(
  systemPrompt: string,
  userPrompt: string,
  jsonMode: boolean = false
): Promise<string> {
  const chain = getProviderChain();

  for (let i = 0; i < chain.length; i++) {
    const provider = chain[i];

    // Skip ollama if not running (don't wait for timeout)
    if (provider === "ollama" && !(await isOllamaAvailable())) {
      logger.info("Ollama not available, skipping");
      continue;
    }

    try {
      logger.info(`LLM request via ${provider}${jsonMode ? " (JSON)" : ""}`);
      const fn = getCompleteFn(provider);
      return await fn(systemPrompt, userPrompt, jsonMode);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.warn(`${provider} failed: ${msg}`);

      if (i === chain.length - 1) {
        throw new Error(
          `All LLM providers failed. Last error (${provider}): ${msg}`
        );
      }
    }
  }

  throw new Error("No LLM providers available. Set GROQ_API_KEY, CEREBRAS_API_KEY, or install Ollama.");
}

// --- Public API ---

export async function llmComplete(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  return executeWithFallback(systemPrompt, userPrompt, false);
}

export async function llmCompleteJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const jsonSystemPrompt =
    systemPrompt +
    "\n\nResponde EXCLUSIVAMENTE con JSON valido. Sin markdown, sin texto adicional, sin ```json.";

  const raw = await executeWithFallback(jsonSystemPrompt, userPrompt, true);
  return parseJSON<T>(raw);
}

function parseJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

/**
 * Returns info about available LLM providers.
 */
export async function getProviderStatus(): Promise<
  { provider: LLMProvider; available: boolean }[]
> {
  const ollamaOk = await isOllamaAvailable();
  return [
    { provider: "groq", available: !!env.GROQ_API_KEY },
    { provider: "cerebras", available: !!env.CEREBRAS_API_KEY },
    { provider: "ollama", available: ollamaOk },
  ];
}

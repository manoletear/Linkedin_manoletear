import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env";

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export async function llmComplete(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = response.content[0];
  if (block.type === "text") {
    return block.text;
  }
  throw new Error("Unexpected response type from LLM");
}

export async function llmCompleteJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const response = await llmComplete(
    systemPrompt + "\n\nResponde EXCLUSIVAMENTE con JSON válido, sin markdown ni texto adicional.",
    userPrompt
  );

  const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
}

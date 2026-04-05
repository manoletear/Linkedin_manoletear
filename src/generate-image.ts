import "dotenv/config";
import fs from "node:fs";
import { GoogleGenAI } from "@google/genai";
import { env } from "./config/env";

function getClient(): GoogleGenAI {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured. Get one free at https://aistudio.google.com");
  }
  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

export async function generateLinkedInImage(
  theme: string,
  outputPath: string = "out/linkedin-image.png"
): Promise<string> {
  const ai = getClient();

  const prompt = `Create a clean LinkedIn editorial image.
Theme: ${theme}.
Style: sharp, minimal, modern B2B.
Aspect ratio: 1.91:1.
No logos. No watermarks. No readable UI text.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["image", "text"],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData?.data) {
      fs.mkdirSync("out", { recursive: true });
      const buffer = Buffer.from(part.inlineData.data, "base64");
      fs.writeFileSync(outputPath, buffer);
      console.log(`Imagen guardada en ${outputPath}`);
      return outputPath;
    }
  }

  throw new Error("No se recibio imagen del modelo");
}

if (require.main === module) {
  const theme = process.argv[2] || "AI in enterprise operations";
  generateLinkedInImage(theme).catch(console.error);
}

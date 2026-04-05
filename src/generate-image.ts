import "dotenv/config";
import fs from "node:fs";
import { VertexAI } from "@google-cloud/vertexai";
import { env } from "./config/env";

export async function generateLinkedInImage(
  theme: string,
  outputPath: string = "out/linkedin-image.png"
): Promise<string> {
  const vertexAI = new VertexAI({
    project: env.GCP_PROJECT,
    location: env.GCP_LOCATION || "us-central1",
  });

  const model = vertexAI.getGenerativeModel({
    model: "gemini-2.5-flash-image",
  });

  const prompt = `
Create a clean LinkedIn editorial image.
Theme: ${theme}.
Style: sharp, minimal, modern B2B.
Aspect ratio: 1.91:1.
No logos. No watermarks. No readable UI text.
`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const parts = result.response.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    const inlineData = (part as any).inlineData;
    if (inlineData?.data) {
      fs.mkdirSync("out", { recursive: true });
      const buffer = Buffer.from(inlineData.data, "base64");
      fs.writeFileSync(outputPath, buffer);
      console.log(`Imagen guardada en ${outputPath}`);
      return outputPath;
    }
  }

  throw new Error("No se recibió imagen del modelo");
}

if (require.main === module) {
  const theme = process.argv[2] || "AI in enterprise operations";
  generateLinkedInImage(theme).catch(console.error);
}

import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";
import { env } from "../config/env";
import { logger } from "./logger";

function getClient(): GoogleGenAI | null {
  if (!env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

/**
 * Analiza una pagina web o articulo scrapeado usando Gemini vision.
 * Extrae entidades, temas, puntos clave y sentimiento.
 */
export async function analyzeArticle(content: string): Promise<{
  entities: string[];
  themes: string[];
  keyPoints: string[];
  sentiment: string;
  editorialAngle: string;
}> {
  const ai = getClient();
  if (!ai) {
    return {
      entities: [],
      themes: [],
      keyPoints: [],
      sentiment: "neutral",
      editorialAngle: "",
    };
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analiza este articulo y responde SOLO con JSON valido:

${content.slice(0, 8000)}

Formato de respuesta:
{
  "entities": ["empresa1", "persona1", "tecnologia1"],
  "themes": ["tema1", "tema2"],
  "keyPoints": ["punto clave 1", "punto clave 2", "punto clave 3"],
  "sentiment": "positive|negative|neutral|mixed",
  "editorialAngle": "una frase con el angulo editorial mas interesante para LinkedIn"
}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  try {
    return JSON.parse(text);
  } catch {
    logger.warn("Gemini JSON parse failed, returning defaults");
    return {
      entities: [],
      themes: [],
      keyPoints: [],
      sentiment: "neutral",
      editorialAngle: "",
    };
  }
}

/**
 * Analiza una imagen (screenshot de LinkedIn, grafico, etc.)
 * y extrae informacion relevante.
 */
export async function analyzeImage(imagePath: string): Promise<{
  description: string;
  textContent: string[];
  metrics?: { likes?: number; comments?: number; reposts?: number };
}> {
  const ai = getClient();
  if (!ai) {
    return { description: "", textContent: [] };
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString("base64");
  const mimeType = imagePath.endsWith(".png") ? "image/png" : "image/jpeg";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: { data: base64, mimeType },
          },
          {
            text: `Analiza esta imagen. Si es un screenshot de LinkedIn, extrae metricas visibles.
Responde SOLO con JSON:
{
  "description": "descripcion breve de la imagen",
  "textContent": ["texto visible 1", "texto visible 2"],
  "metrics": { "likes": number_or_null, "comments": number_or_null, "reposts": number_or_null }
}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  try {
    return JSON.parse(text);
  } catch {
    return { description: "", textContent: [] };
  }
}

/**
 * Analiza un PDF (reporte, whitepaper) y extrae insights clave.
 */
export async function analyzePdf(pdfPath: string): Promise<{
  title: string;
  summary: string;
  keyFindings: string[];
  editorialAngles: string[];
}> {
  const ai = getClient();
  if (!ai) {
    return { title: "", summary: "", keyFindings: [], editorialAngles: [] };
  }

  const pdfBuffer = fs.readFileSync(pdfPath);
  const base64 = pdfBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: { data: base64, mimeType: "application/pdf" },
          },
          {
            text: `Analiza este PDF y extrae insights para crear contenido editorial en LinkedIn.
Responde SOLO con JSON:
{
  "title": "titulo del documento",
  "summary": "resumen en 2-3 frases",
  "keyFindings": ["hallazgo 1", "hallazgo 2", "hallazgo 3"],
  "editorialAngles": ["angulo editorial 1 para LinkedIn", "angulo editorial 2"]
}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  try {
    return JSON.parse(text);
  } catch {
    return { title: "", summary: "", keyFindings: [], editorialAngles: [] };
  }
}

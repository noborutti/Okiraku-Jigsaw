import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// We use a singleton pattern for the AI client but re-instantiate if key changes or for safety
const getAiClient = () => new GoogleGenAI({ apiKey });

/**
 * Generates an image based on a text prompt using Gemini.
 * Uses the 'gemini-2.5-flash-image' model.
 */
export const generatePuzzleImage = async (prompt: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Create a vivid, high-quality, colorful illustration suitable for a jigsaw puzzle. Subject: ${prompt}`,
          },
        ],
      },
      config: {
        // We can request a specific aspect ratio or let it be default (1:1)
        // Since we want a nice puzzle, square is usually safe, or we adapt UI.
        // gemini-2.5-flash-image supports 'aspectRatio' in 'imageConfig' if needed, 
        // but often standard generation is fine.
      },
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("No content returned from Gemini.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in the response.");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};
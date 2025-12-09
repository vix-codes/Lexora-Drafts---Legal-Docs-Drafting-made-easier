import { genkit } from "genkit";
import { googleAI, gemini } from "@genkit-ai/google-genai";

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  // No default model because we switch models manually
});

/**
 * Returns best available model.
 * flash → flash-lite → fallback.
 */
export async function chooseModel() {
  const models = [
    "googleai/gemini-2.5-flash",
    "googleai/gemini-2.5-flash-lite",
  ];

  for (const model of models) {
    try {
      // Simple quota test
      await gemini(model).generateContent("ping");
      return model;
    } catch (_) {
      continue;
    }
  }

  return "QUOTA_OVER";
}

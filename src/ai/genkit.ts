// src/ai/genkit.ts
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";

/**
 * MAIN AI INSTANCE
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY!,
    }),
  ],
  // No default model — we pass model dynamically
});

/**
 * Try primary model → then backup → otherwise quota over.
 * • Never caches state
 * • Recovers when quota resets
 */
export async function chooseModel(): Promise<string> {
  const testPrompt = {
    input: "ping", // tiny request to check quota
  };

  const primary = "googleai/gemini-2.5-flash";
  const backup = "googleai/gemini-2.5-flash-lite";

  // 1. Test PRIMARY
  try {
    await ai.run({ model: primary, ...testPrompt });
    return primary;
  } catch (err) {
    console.warn("Primary unavailable:", err);
  }

  // 2. Test BACKUP
  try {
    await ai.run({ model: backup, ...testPrompt });
    return backup;
  } catch (err) {
    console.warn("Backup unavailable:", err);
  }

  // 3. Both failed
  return "QUOTA_OVER";
}

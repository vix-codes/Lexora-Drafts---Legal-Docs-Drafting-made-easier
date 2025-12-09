import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Try multiple models in priority order.
 * Returns the first one that is available.
 */
export async function chooseModel(): Promise<string> {
  const models = [
    'googleai/gemini-2.5-flash',
    'googleai/gemini-2.5-flash-lite',
  ];

  for (const m of models) {
    try {
      // cheap dry-run check (model metadata fetch)
      await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}?key=${process.env.GEMINI_API_KEY}`);
      return m;
    } catch (e) {
      continue;
    }
  }

  return 'QUOTA_OVER';
}

/** Main AI instance for all flows */
export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: 'googleai/gemini-2.5-flash', // default
});

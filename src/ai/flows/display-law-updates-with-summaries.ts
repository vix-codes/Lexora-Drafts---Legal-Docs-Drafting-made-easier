'use server';

import { ai, chooseModel } from '@/ai/genkit';
import { z } from 'zod';
import { lawUpdates as mockLawUpdates } from '@/lib/data';

/** -----------------------------
 *  ZOD SCHEMAS
 * ----------------------------- */
const LawUpdateSchema = z.object({
  title: z.string().describe('The title of the law update.'),
  summary: z.string().describe('A concise summary of the law update.'),
  link: z.string().url().describe('A URL to the full article or source.'),
  timestamp: z.number().describe('The Unix timestamp of when the update was published.'),
});

export type LawUpdate = z.infer<typeof LawUpdateSchema>;

const LawUpdatesOutputSchema = z.object({
  summaries: z.array(LawUpdateSchema),
});

/** -----------------------------
 *  PROMPT
 * ----------------------------- */
const lawUpdateSummaryPrompt = ai.definePrompt({
  name: 'lawUpdateSummaryPrompt',
  input: { schema: z.object({ lawUpdates: z.array(LawUpdateSchema) }) },
  output: { schema: LawUpdatesOutputSchema },
  prompt: `
You are a legal news editor. You will be given a list of recent law updates from India in JSON format.

Your task:
- Provide a concise, one-sentence summary for each update.
- Do NOT modify title, link, or timestamp.

Return the full list of updates with your new summaries in JSON format.

Law Updates:
{{{json lawUpdates}}}
`,
});

/** -----------------------------
 *  MAIN EXPORT FUNCTION
 * ----------------------------- */
export async function displayLawUpdatesWithSummaries(): Promise<LawUpdate[]> {
  const lawUpdates = mockLawUpdates;

  try {
    // pick best available model
    const selectedModel = await chooseModel();

    if (selectedModel === 'QUOTA_OVER') {
      // return fallback if quota exceeded
      return lawUpdates.map(update => ({
        ...update,
        summary: update.summary || 'Summary not available due to daily quota limit.'
      }));
    }

    // call the LLM prompt with the selected model
    const { output } = await lawUpdateSummaryPrompt(
      { lawUpdates },
      { model: selectedModel }
    );

    if (!output?.summaries) {
      return lawUpdates.map(update => ({
        ...update,
        summary: update.summary || 'Summary not available.'
      }));
    }

    return output.summaries;

  } catch (err) {
    console.error('AI summarization failed:', err);

    return lawUpdates.map(update => ({
      ...update,
      summary: update.summary || 'Summary not available.'
    }));
  }
}

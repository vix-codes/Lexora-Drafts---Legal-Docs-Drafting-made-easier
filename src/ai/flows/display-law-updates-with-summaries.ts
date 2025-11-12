'use server';

/**
 * @fileOverview This file defines a Genkit flow for fetching and summarizing recent law updates.
 *
 * It simulates fetching data from a source and then uses an LLM to generate concise summaries for each update.
 *
 * @exports displayLawUpdatesWithSummaries - An async function that returns a list of law updates with summaries.
 * @exports LawUpdate - The type for a single law update object.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { lawUpdates as mockLawUpdates } from '@/lib/data';

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

const lawUpdateSummaryPrompt = ai.definePrompt({
  name: 'lawUpdateSummaryPrompt',
  input: { schema: z.object({ lawUpdates: z.array(LawUpdateSchema) }) },
  output: { schema: LawUpdatesOutputSchema },
  prompt: `You are a legal news editor. You will be given a list of recent law updates from India in JSON format.
  Your task is to provide a concise, one-sentence summary for each update.
  Do not change the title, link, or timestamp. Only add a better summary.
  Return the full list of updates with your new summaries in JSON format.

  Law Updates:
  {{{json lawUpdates}}}
  `,
});

export async function displayLawUpdatesWithSummaries(): Promise<LawUpdate[]> {
  // In a real application, this would fetch data from a database or external API.
  const lawUpdates = mockLawUpdates;

  try {
    const {output} = await lawUpdateSummaryPrompt({lawUpdates});

    if (!output || !output.summaries) {
      // If the AI fails, return the original updates with their default summaries.
      return lawUpdates.map(update => ({
        ...update,
        summary: update.summary || 'Summary not available.'
      }));
    }

    return output.summaries;
  } catch (error) {
    console.error('Error generating law update summaries:', error);
    // On error, fall back to the original mock data without AI summaries.
    return lawUpdates.map(update => ({
        ...update,
        summary: update.summary || 'Summary not available.'
      }));
  }
}

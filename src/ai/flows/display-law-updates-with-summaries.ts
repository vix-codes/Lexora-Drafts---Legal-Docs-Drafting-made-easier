'use server';

/**
 * @fileOverview Retrieves law updates and generates summaries using GenAI.
 *
 * - displayLawUpdatesWithSummaries - A function that retrieves law updates and adds GenAI-generated summaries.
 * - LawUpdate - The type representing a single law update.
 * - LawUpdateWithSummary - The return type for the displayLawUpdatesWithSummaries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LawUpdateSchema = z.object({
  title: z.string().describe('Title of the legal update'),
  summary: z.string().describe('Summary of the legal update'),
  link: z.string().url().describe('Link to the full legal update'),
  timestamp: z.number().describe('Timestamp of the legal update'),
});

export type LawUpdate = z.infer<typeof LawUpdateSchema>;

const LawUpdateWithSummarySchema = LawUpdateSchema.extend({
  aiSummary: z.string().describe('GenAI-generated summary of the legal update'),
});

export type LawUpdateWithSummary = z.infer<typeof LawUpdateWithSummarySchema>;

const DisplayLawUpdatesWithSummariesOutputSchema = z.array(LawUpdateWithSummarySchema);

export type DisplayLawUpdatesWithSummariesOutput = z.infer<typeof DisplayLawUpdatesWithSummariesOutputSchema>;

export async function displayLawUpdatesWithSummaries(lawUpdates: LawUpdate[]): Promise<DisplayLawUpdatesWithSummariesOutput> {
  return displayLawUpdatesWithSummariesFlow(lawUpdates);
}

const lawUpdateSummaryPrompt = ai.definePrompt({
  name: 'lawUpdateSummaryPrompt',
  input: {schema: LawUpdateSchema},
  output: {schema: z.string().describe('A concise summary of the law update.')},
  prompt: `Summarize the following legal update in a single sentence:

Title: {{{title}}}
Summary: {{{summary}}}
Link: {{{link}}}
`,
});

const displayLawUpdatesWithSummariesFlow = ai.defineFlow(
  {
    name: 'displayLawUpdatesWithSummariesFlow',
    inputSchema: z.array(LawUpdateSchema),
    outputSchema: DisplayLawUpdatesWithSummariesOutputSchema,
  },
  async lawUpdates => {
    const updatesWithSummaries: LawUpdateWithSummary[] = [];

    for (const update of lawUpdates) {
      const {output: aiSummary} = await lawUpdateSummaryPrompt(update);
      updatesWithSummaries.push({
        ...update,
        aiSummary: aiSummary!,
      });
    }

    return updatesWithSummaries;
  }
);

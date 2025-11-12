
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

const LawUpdateSummariesOutputSchema = z.object({
  summaries: z.array(
    z.object({
      original_timestamp: z.number().describe('The timestamp of the original law update this summary corresponds to.'),
      summary: z.string().describe('A concise summary of the law update.'),
    })
  ),
});

const lawUpdateSummaryPrompt = ai.definePrompt({
  name: 'lawUpdateSummaryPrompt',
  input: {schema: z.object({lawUpdates: z.array(LawUpdateSchema)})},
  output: {schema: LawUpdateSummariesOutputSchema},
  prompt: `Summarize each of the following legal updates in a single sentence. For each summary, you must include the original_timestamp of the update it corresponds to.

{{#each lawUpdates}}
Law Update (timestamp: {{{timestamp}}}):
Title: {{{title}}}
Summary: {{{summary}}}
---
{{/each}}
`,
});

const displayLawUpdatesWithSummariesFlow = ai.defineFlow(
  {
    name: 'displayLawUpdatesWithSummariesFlow',
    inputSchema: z.array(LawUpdateSchema),
    outputSchema: DisplayLawUpdatesWithSummariesOutputSchema,
  },
  async lawUpdates => {
    if (lawUpdates.length === 0) {
      return [];
    }

    try {
      const {output} = await lawUpdateSummaryPrompt({lawUpdates});

      if (!output || !output.summaries) {
        throw new Error('No summaries returned from AI.');
      }

      const summaryMap = new Map(output.summaries.map(s => [s.original_timestamp, s.summary]));

      const updatesWithSummaries = lawUpdates.map(update => {
        const aiSummary = summaryMap.get(update.timestamp) || update.summary;
        return {
          ...update,
          aiSummary,
        };
      });

      return updatesWithSummaries;
    } catch (error) {
      console.error('Failed to generate AI summaries, falling back to original summaries:', error);
      // Fallback to original summaries if the AI call fails
      return lawUpdates.map(update => ({
        ...update,
        aiSummary: update.summary,
      }));
    }
  }
);

'use server';

/**
 * @fileOverview A Genkit flow for answering legal questions with high clarity and structure.
 *
 * This flow responds to legal questions by providing informational guidance, not official legal advice.
 * It follows a strict set of rules to ensure responses are structured, accurate, and jurisdiction-aware.
 *
 * @exports answerLegalQuery - An async function that takes a user's query and returns a structured legal answer.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const LegalQueryInputSchema = z.object({
  query: z.string().describe("The user's legal question."),
  history: z.array(z.any()).optional().describe("The conversation history."),
});

const LegalQueryOutputSchema = z.object({
  answer: z.string().describe('A structured, clear, and accurate answer to the legal question.'),
});

export type LegalQueryInput = z.infer<typeof LegalQueryInputSchema>;
export type LegalQueryOutput = z.infer<typeof LegalQueryOutputSchema>;

const legalQueryPrompt = ai.definePrompt({
  name: 'legalQueryPrompt',
  input: {
    schema: z.object({
      query: z.string(),
      history: z.array(z.any()).optional(),
    }),
  },
  output: { schema: LegalQueryOutputSchema },
  prompt: `You are an AI assistant providing informational legal guidance. You are not a lawyer and you do not provide legal advice.

Response Formatting Rules:
1. Use short paragraphs with a blank line between each.
2. Never merge sentences without spacing.
3. Use simple section labels like:
   Legal Issue:
   General Rule:
   Practical Steps:
4. For steps or lists, use numbered points without bold or markdown.
5. Keep lines short and avoid long blocks of text.
6. Do not use markdown formatting symbols like ** or ##.
7. Always end with a clear question if more information is needed.

Operational Rules:
1. All answers must be based on Indian law unless the user explicitly specifies another country or state.
2. Identify the legal domain before answering: criminal law, property law, contract law, copyright, etc.
3. If the user does not mention their jurisdiction and the context isn't implicitly India, ask for it before giving any legal explanation. Remember the jurisdiction for the current session unless the user changes it.
4. If the user gives conflicting jurisdiction details, ask which one to use.
5. Do not guess or invent statutes, case names, numbers, fines, or deadlines. If information is missing, clearly state what is needed.
6. When a harmful or illegal question is asked, redirect into a legal explanation without judgment.

Conversation History:
{{{json history}}}

User question:
{{{query}}}
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const answerLegalQueryFlow = ai.defineFlow(
  {
    name: 'answerLegalQueryFlow',
    inputSchema: LegalQueryInputSchema,
    outputSchema: LegalQueryOutputSchema,
  },
  async ({ query, history }) => {
    const { output } = await legalQueryPrompt({
      query,
      history: history ?? [],
    });
    return output!;
  }
);

export async function answerLegalQuery(input: LegalQueryInput): Promise<LegalQueryOutput> {
  return answerLegalQueryFlow(input);
}

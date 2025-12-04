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
  query: z.string().describe('The user\'s legal question.'),
});

const LegalQueryOutputSchema = z.object({
  answer: z.string().describe('A structured, clear, and accurate answer to the legal question.'),
});

export type LegalQueryInput = z.infer<typeof LegalQueryInputSchema>;
export type LegalQueryOutput = z.infer<typeof LegalQueryOutputSchema>;

export async function answerLegalQuery(input: LegalQueryInput): Promise<LegalQueryOutput> {
  return answerLegalQueryFlow(input);
}

const legalQueryPrompt = ai.definePrompt({
  name: 'legalQueryPrompt',
  input: { schema: LegalQueryInputSchema },
  output: { schema: LegalQueryOutputSchema },
  prompt: `You answer legal questions with clear, structured, and concise informational guidance.
You are not a lawyer and you do not provide legal advice.

Rules:
1. If the user does not mention their jurisdiction (country or state), ask for it before giving any legal explanation.
2. Use correct legal categories such as contract law, criminal law, property law, copyright, company law, and police powers.
3. Provide answers in this structure:
   - Identify the legal issue.
   - Request missing context (especially jurisdiction).
   - Explain the general rule in simple language.
   - Provide practical steps or checklists.
4. Do not guess or invent statutes, case names, numbers, fines, or deadlines.
5. If information is missing, clearly state what is needed.
6. Keep answers short unless the user asks for detailed explanation.
7. Your responses are informational only and not legal advice.

User question:
{{{query}}}
  `,
});


const answerLegalQueryFlow = ai.defineFlow(
  {
    name: 'answerLegalQueryFlow',
    inputSchema: LegalQueryInputSchema,
    outputSchema: LegalQueryOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await legalQueryPrompt(input);
      if (!output) {
        throw new Error('AI response was empty.');
      }
      return output;
    } catch (error: any) {
      console.error('AI legal query failed with error:', error);
      let errorMessage = "I am sorry, but I encountered an error while processing your request. The service may be temporarily unavailable. Please try again later.";
      if (error.message.includes('overloaded')) {
        errorMessage = "The AI service is currently experiencing high traffic. Please try your request again in a few moments.";
      } else if (error.message.includes('blocked')) {
        errorMessage = "Your query could not be processed due to the content policy. Please try rephrasing your question.";
      }
      return { answer: errorMessage };
    }
  }
);

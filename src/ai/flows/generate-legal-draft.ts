'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating legal drafts based on user input.
 *
 * The flow takes in a document type and form data, and returns a formatted legal draft.
 * It uses a prompt to instruct the LLM to generate a well-structured legal document under Indian law.
 *
 * @exports generateLegalDraft - An async function that takes GenerateLegalDraftInput and returns GenerateLegalDraftOutput.
 * @exports GenerateLegalDraftInput - The input type for generateLegalDraft.
 * @exports GenerateLegalDraftOutput - The output type for generateLegalDraft.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLegalDraftInputSchema = z.object({
  documentType: z.string().describe('The type of legal document to generate (e.g., rental agreement, NDA).'),
  formData: z.record(z.any()).describe('A record of form data to use when generating the legal document.'),
});
export type GenerateLegalDraftInput = z.infer<typeof GenerateLegalDraftInputSchema>;

const GenerateLegalDraftOutputSchema = z.object({
  legalDraft: z.string().describe('The generated legal draft, formatted for readability.'),
});
export type GenerateLegalDraftOutput = z.infer<typeof GenerateLegalDraftOutputSchema>;

export async function generateLegalDraft(input: GenerateLegalDraftInput): Promise<GenerateLegalDraftOutput> {
  return generateLegalDraftFlow(input);
}

const generateLegalDraftPrompt = ai.definePrompt({
  name: 'generateLegalDraftPrompt',
  input: {schema: GenerateLegalDraftInputSchema},
  output: {schema: GenerateLegalDraftOutputSchema},
  prompt: `Generate a well-structured legal document of type {{{documentType}}} under Indian law using these details: {{{formData}}}. Include subject line, clauses, parties involved, and signature sections. After each major clause or section, add a brief, simple one-sentence explanation in parentheses, like this: (This clause explains...). Format the entire output as a single block of plain text, with clean formatting for legal readability.`,
});

const generateLegalDraftFlow = ai.defineFlow(
  {
    name: 'generateLegalDraftFlow',
    inputSchema: GenerateLegalDraftInputSchema,
    outputSchema: GenerateLegalDraftOutputSchema,
  },
  async input => {
    const {output} = await generateLegalDraftPrompt(input);
    return output!;
  }
);

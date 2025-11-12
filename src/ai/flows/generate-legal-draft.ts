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
  input: {schema: z.object({
    documentType: z.string(),
    formDataString: z.string(),
  })},
  output: {schema: GenerateLegalDraftOutputSchema},
  prompt: `Generate a well-structured legal document of type {{{documentType}}} under Indian law using these details: {{{formDataString}}}. Include subject line, clauses, parties involved, and signature sections. After each major clause or section, add a brief, simple one-sentence explanation in parentheses, like this: (This clause explains...). Format the entire output as a single block of plain text, with clean formatting for legal readability.`,
  config: {
    safetySettings: [
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
    ]
  }
});

const generateLegalDraftFlow = ai.defineFlow(
  {
    name: 'generateLegalDraftFlow',
    inputSchema: GenerateLegalDraftInputSchema,
    outputSchema: GenerateLegalDraftOutputSchema,
  },
  async ({ documentType, formData }) => {
    // Sanitize the formData by removing fields that are not part of the legal document itself.
    const relevantFormData = { ...formData };
    delete relevantFormData.documentType;
    delete relevantFormData.userId;

    const formDataString = Object.entries(relevantFormData)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`)
      .join('\n');

    try {
      const {output} = await generateLegalDraftPrompt({
        documentType,
        formDataString,
      });
      return output!;
    } catch (error) {
      console.error('AI draft generation failed with error:', error);
      
      // Fallback mechanism to generate a basic draft if the AI fails.
      const fallbackDraft = `
DOCUMENT TYPE: ${documentType.toUpperCase()}
      
---
      
DETAILS:
${formDataString}
      
---
      
DISCLAIMER:
This is a basic, non-legally binding draft generated as a fallback. The AI service may be temporarily unavailable or encountered an error. Please review and consult with a legal professional.
      `;
      
      return { legalDraft: fallbackDraft.trim() };
    }
  }
);

'use server';

import { ai, chooseModel } from '@/ai/genkit';
import { z } from 'genkit';

/** ------------------------------
 *  ZOD SCHEMAS
 * ------------------------------ */
const GenerateLegalDraftInputSchema = z.object({
  documentType: z.string().describe('The type of legal document to generate (e.g., rental agreement, NDA).'),
  formData: z.record(z.any()).describe('A record of form data to use when generating the legal document.'),
});
export type GenerateLegalDraftInput = z.infer<typeof GenerateLegalDraftInputSchema>;

const GenerateLegalDraftOutputSchema = z.object({
  legalDraft: z.string().describe('The generated legal draft, formatted for readability.'),
});
export type GenerateLegalDraftOutput = z.infer<typeof GenerateLegalDraftOutputSchema>;

/** ------------------------------
 *  PROMPT
 * ------------------------------ */
const generateLegalDraftPrompt = ai.definePrompt({
  name: 'generateLegalDraftPrompt',
  input: {
    schema: z.object({
      documentType: z.string(),
      formDataString: z.string(),
    }),
  },
  output: { schema: GenerateLegalDraftOutputSchema },
  prompt: `
Generate a well-structured legal document of type {{{documentType}}} under Indian law using these details:

{{{formDataString}}}

Rules:
- Include subject line, clauses, parties involved, and signature sections.
- After each major clause, add a one-sentence explanation in parentheses.
- Format as a single block of plain text.
- Do not use markdown symbols like ** or ##.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

/** ------------------------------
 *  FLOW
 * ------------------------------ */
const generateLegalDraftFlow = ai.defineFlow(
  {
    name: 'generateLegalDraftFlow',
    inputSchema: GenerateLegalDraftInputSchema,
    outputSchema: GenerateLegalDraftOutputSchema,
  },
  async ({ documentType, formData }) => {
    // Clean formData: remove backend-only fields
    const relevant = { ...formData };
    delete relevant.documentType;
    delete relevant.userId;

    const formDataString = Object.entries(relevant)
      .map(([key, value]) =>
        `${key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}: ${value}`
      )
      .join('\n');

    try {
      /** 1. Pick best available model */
      const selectedModel = await chooseModel();

      if (selectedModel === 'QUOTA_OVER') {
        // Hard-fallback: both flash & flash-lite are exhausted
        return {
          legalDraft: `
DOCUMENT TYPE: ${documentType.toUpperCase()}

------------------------------------

DETAILS:
${formDataString}

------------------------------------

NOTICE:
Daily AI usage quota is exhausted. Showing a basic fallback draft.
Please try again after quota resets.
          `.trim(),
        };
      }

      /** 2. Run the model with the chosen model name */
      const { output } = await generateLegalDraftPrompt(
        {
          documentType,
          formDataString,
        },
        { model: selectedModel }
      );

      return output!;

    } catch (err) {
      console.error('AI draft generation failed:', err);

      /** 3. Error fallback */
      const fallbackDraft = `
DOCUMENT TYPE: ${documentType.toUpperCase()}

------------------------------------

DETAILS:
${formDataString}

------------------------------------

DISCLAIMER:
This is a basic, non-legally binding draft generated due to AI unavailability.
Please review manually or consult a legal professional.
      `.trim();

      return { legalDraft: fallbackDraft };
    }
  }
);

/** ------------------------------
 *  EXPORT
 * ------------------------------ */
export async function generateLegalDraft(
  input: GenerateLegalDraftInput
): Promise<GenerateLegalDraftOutput> {
  return await generateLegalDraftFlow(input);
}

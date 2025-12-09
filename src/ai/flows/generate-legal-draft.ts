'use server';

import { ai, chooseModel } from '@/ai/genkit';
import { z } from 'genkit';

/* ----------------------------------------------
   ZOD SCHEMAS
---------------------------------------------- */
const GenerateLegalDraftInputSchema = z.object({
  documentType: z.string(),
  formData: z.record(z.any()),
});
export type GenerateLegalDraftInput = z.infer<typeof GenerateLegalDraftInputSchema>;

const GenerateLegalDraftOutputSchema = z.object({
  legalDraft: z.string(),
});
export type GenerateLegalDraftOutput = z.infer<typeof GenerateLegalDraftOutputSchema>;

/* ----------------------------------------------
   PROMPT (FIXED FORMATTING VERSION)
---------------------------------------------- */
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
Generate a well-structured, clearly spaced legal document of type "{{{documentType}}}" under Indian law.

Use these details:
{{{formDataString}}}

Formatting Rules:
1. Each clause must start on a new line.
2. Add a blank line between major sections.
3. Use simple section headers such as:
   PARTIES
   BACKGROUND
   TERMS AND CONDITIONS
   SIGNATURES
4. Keep text plain. NO markdown symbols (*, **, ##).
5. After each major clause, add a brief explanation in parentheses.
6. The output must look like a real legal draft, not a single paragraph.

Produce clean spacing and readable legal formatting.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

/* ----------------------------------------------
   FLOW
---------------------------------------------- */
const generateLegalDraftFlow = ai.defineFlow(
  {
    name: 'generateLegalDraftFlow',
    inputSchema: GenerateLegalDraftInputSchema,
    outputSchema: GenerateLegalDraftOutputSchema,
  },

  async ({ documentType, formData }) => {
    // Remove backend-only values
    const cleaned = { ...formData };
    delete cleaned.userId;
    delete cleaned.documentType;

    const formDataString = Object.entries(cleaned)
      .map(([key, value]) =>
        `${key.replace(/([A-Z])/g, ' $1').replace(/^./, x => x.toUpperCase())}: ${value}`
      )
      .join('\n');

    try {
      /* 1. Auto-select model */
      const selectedModel = await chooseModel();

      if (selectedModel === 'QUOTA_OVER') {
        return {
          legalDraft: `
DOCUMENT TYPE: ${documentType.toUpperCase()}

--------------------------------------

DETAILS:
${formDataString}

--------------------------------------

NOTICE:
Daily AI quota is exhausted. Showing a basic fallback draft.
Try again tomorrow.
        `.trim(),
        };
      }

      /* 2. Run the model */
      const { output } = await generateLegalDraftPrompt(
        {
          documentType,
          formDataString,
        },
        { model: selectedModel }
      );

      return output!;

    } catch (error) {
      console.error('AI draft generation failed:', error);

      /* 3. Fallback */
      return {
        legalDraft: `
DOCUMENT TYPE: ${documentType.toUpperCase()}

--------------------------------------

DETAILS:
${formDataString}

--------------------------------------

DISCLAIMER:
AI service unavailable. This fallback draft was automatically generated.
Please review manually or consult a legal expert.
        `.trim(),
      };
    }
  }
);

/* ----------------------------------------------
   EXPORT
---------------------------------------------- */
export async function generateLegalDraft(
  input: GenerateLegalDraftInput
): Promise<GenerateLegalDraftOutput> {
  return generateLegalDraftFlow(input);
}

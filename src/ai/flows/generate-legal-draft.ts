'use server';

import { ai, chooseModel } from '@/ai/genkit';
import { z } from 'zod';
import { gemini } from "@genkit-ai/google-genai";

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
   PROMPT (Legal Draft Generator)
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
6. The output must look like a real legal draft with clean spacing.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

/* ----------------------------------------------
   FLOW IMPLEMENTATION WITH MODEL SWITCHING
---------------------------------------------- */
const FALLBACK_DRAFT = `
AI service unavailable. This fallback draft was automatically generated.
Please review manually or consult a legal expert.
`;

export const generateLegalDraftFlow = ai.defineFlow(
  {
    name: 'generateLegalDraftFlow',
    inputSchema: GenerateLegalDraftInputSchema,
    outputSchema: GenerateLegalDraftOutputSchema,
  },
  async ({ documentType, formData }) => {
    const selectedModel = await chooseModel();

    // Quota fully exhausted
    if (selectedModel === "QUOTA_OVER") {
      return { legalDraft: FALLBACK_DRAFT };
    }

    const formDataString = JSON.stringify(formData, null, 2);

    // Try primary model
    try {
      console.log("Generating draft using:", selectedModel);

      const { output } = await generateLegalDraftPrompt(
        {
          documentType,
          formDataString,
        },
        {
          model: selectedModel,
        }
      );

      if (!output?.legalDraft) {
        throw new Error("Empty response from primary model");
      }

      return output;
    } catch (err) {
      console.error("Primary model failed:", err);
    }

    // Try backup model if first was not lite
    if (selectedModel !== "googleai/gemini-2.5-flash-lite") {
      try {
        console.log("Trying backup model: gemini-2.5-flash-lite");

        const { output } = await generateLegalDraftPrompt(
          {
            documentType,
            formDataString,
          },
          {
            model: "googleai/gemini-2.5-flash-lite",
          }
        );

        if (output?.legalDraft) return output;
      } catch (err2) {
        console.error("Backup model also failed:", err2);
      }
    }

    // Final fallback
    return { legalDraft: FALLBACK_DRAFT };
  }
);

/* ----------------------------------------------
   EXPORT FUNCTION
---------------------------------------------- */
export async function generateLegalDraft(
  input: GenerateLegalDraftInput
): Promise<GenerateLegalDraftOutput> {
  return generateLegalDraftFlow(input);
}

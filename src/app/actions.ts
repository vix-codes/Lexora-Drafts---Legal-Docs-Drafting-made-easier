'use server';

import { generateLegalDraft } from '@/ai/flows/generate-legal-draft';
import { z } from 'zod';

const DraftStateSchema = z.object({
  draft: z.string().optional(),
  error: z.string().optional(),
});

type DraftState = z.infer<typeof DraftStateSchema>;

export async function generateDraftAction(
  prevState: DraftState,
  formData: FormData
): Promise<DraftState> {
  const documentType = formData.get('documentType') as string;

  if (!documentType) {
    return { error: 'Please select a document type.' };
  }
  
  const rawFormData: { [key: string]: FormDataEntryValue } = {};
  for (const [key, value] of formData.entries()) {
    if (key !== 'documentType') {
      rawFormData[key] = value;
    }
  }

  try {
    const result = await generateLegalDraft({
      documentType,
      formData: rawFormData,
    });
    return { draft: result.legalDraft };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate draft. Please try again.' };
  }
}

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
import { generate, generateStream, streamToAsyncIterator } from 'genkit/generate';

const LegalQueryInputSchema = z.object({
  query: z.string().describe("The user's legal question."),
  history: z.array(z.any()).optional().describe("The conversation history."),
});

const LegalQueryOutputSchema = z.object({
  answer: z.string().describe('A structured, clear, and accurate answer to the legal question.'),
});

export type LegalQueryInput = z.infer<typeof LegalQueryInputSchema>;
export type LegalQueryOutput = z.infer<typeof LegalQueryOutputSchema>;

export async function answerLegalQuery(input: LegalQueryInput): Promise<AsyncIterable<string>> {
    const { stream } = await generateStream({
      model: ai.model('gemini-2.5-flash'),
      prompt: {
        role: 'user',
        content: `You answer legal questions with clear, structured, and concise informational guidance. 
You are not a lawyer and you do not provide legal advice.

Rules:
1. Identify the legal domain before answering: criminal law, property law, contract law, copyright, etc.
2. If the user does not mention their jurisdiction (country or state), ask for it before giving any legal explanation. Remember the jurisdiction for the current session unless the user changes it.
3. If the user gives conflicting jurisdiction details, ask which one to use.
4. Provide answers in this structure:
   - Identify the legal issue.
   - Request missing context (especially jurisdiction).
   - Explain the general rule in simple language.
   - Provide practical steps or checklists.
5. Keep the default answer short unless the user asks for more detail. Use short paragraphs for readability.
6. Do not guess or invent statutes, case names, numbers, fines, or deadlines. If information is missing, clearly state what is needed.
7. Your responses are informational only and not legal advice.
8. When a harmful or illegal question is asked, redirect into a legal explanation without judgment.

Conversation History:
${JSON.stringify(input.history ?? [])}

User question:
${input.query}
`,
      },
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      },
    });

    // Transform the Genkit stream into a simple async iterator of strings.
    async function* transformStream(): AsyncIterable<string> {
        for await (const chunk of stream) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    }

    return transformStream();
}

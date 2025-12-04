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
  prompt: `
    You are an AI assistant designed to respond to legal questions with high clarity, accuracy, and structure. You provide informational guidance, not official legal advice.

    ## Core Rules:
    1.  **Jurisdiction First**: If the user's question is missing a jurisdiction (country, state, etc.), your first step MUST be to ask for it. Do not proceed without this context.
    2.  **Use Real Legal Categories**: Frame your answers using proper legal categories like Contract Law, Criminal Law, Property Law, Copyright Law, Company Law, Police Powers, etc.
    3.  **Structured & Actionable Responses**: Provide clear, structured, and actionable responses. Explain rules, conditions, required documents, step-by-step processes, and available options.
    4.  **No Hallucination**: Do NOT invent or guess statute names, case law titles, or specific legal metrics (e.g., exact fines, timelines) unless you are certain they are correct.
    5.  **State Missing Information**: Clearly state what extra information you need from the user to provide a more precise and tailored answer.
    6.  **Concise by Default**: Keep answers brief and to the point. Only provide detailed explanations if the user asks for more information.
    7.  **Avoid Vague Opinions**: Stick to legally relevant reasoning. Do not provide personal opinions or vague advice.
    8.  **Disclaimer**: Always clarify that your guidance is for informational purposes only and does not constitute official legal advice.

    ## Answer Style:
    1.  **Identify the Issue**: Start by re-stating the core legal issue in the user's query.
    2.  **Ask for Context**: If necessary, ask for the missing jurisdiction or other key details.
    3.  **Explain the Rule**: In simple terms, explain the relevant legal rule or principle.
    4.  **Provide Steps**: Give step-by-step actions the user can take.
    5.  **Use Checklists**: When appropriate, provide checklists for required documents, evidence, or procedures.

    ## Example Behaviors:

    **Query 1**: “Is my landlord allowed to increase rent mid-lease?”
    **Your Answer Style**: Identify jurisdiction is missing. Cite relevant statutory logic. Give actionable steps.
    **Sample Answer**: “Under most lease laws, rent cannot be changed until the lease term ends unless the contract explicitly allows mid-term increases. Share your city so I can check the exact statute. If the clause isn't present, the increase is invalid and you can issue a written ‘objection to unilateral variation’ notice.”

    **Query 2**: “Police stopped me without reason. Is that legal?”
    **Your Answer Style**: Distinguish between ‘stop and question’ vs ‘stop and search’. Give a rights checklist.
    **Sample Answer**: “Legality depends on whether the officer had ‘reasonable suspicion’. A casual stop is allowed; a search requires a specific legal basis. You can ask: ‘Am I free to leave?’ If they refuse, they must state the legal ground. Tell me your country so I can map the exact police-powers code.”

    **Query 3**: “I want to start a company. What docs do I need?”
    **Your Answer Style**: Generate a jurisdiction-specific checklist. Avoid vague fluff. Map required filings to registrar rules.
    **Sample Answer**: “For a private limited company, you need: Name reservation, Memorandum of Association, Articles of Association, Director KYC, Registered office proof, and a Capital structure statement. Give me your country and state; I’ll generate a filing-ready checklist with submission portals and deadlines.”

    **Query 4**: “Someone stole my content online. What action can I take?”
    **Your Answer Style**: Instantly distinguish copyright vs trademark issues. Prepare structured enforcement steps.
    **Sample Answer**: “This is a copyright violation if your work is original and fixed in a medium. Evidence needed: timestamps, originals, screenshots. Next steps: 1. Draft a Digital Takedown Notice (I can format it). 2. File a platform-specific IP complaint. 3. If commercial harm is present, escalate to a statutory damages claim. Share the platform and country so I can map the exact legal route.”

    **Query 5**: “I signed a contract without reading it. Can I cancel?”
    **Your Answer Style**: Break down void vs voidable grounds. Evaluate coercion, fraud, mistake, capacity.
    **Sample Answer**: “A contract isn’t void just because you didn’t read it. It becomes voidable only if you can show misrepresentation, absence of free consent, or mistake of material fact. Tell me the contract type and how the agreement was presented; I’ll identify which cancellation grounds (if any) apply.”

    ## User's Query:
    "{{{query}}}"
  `,
  config: {
    model: 'googleai/gemini-2.5-flash',
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
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

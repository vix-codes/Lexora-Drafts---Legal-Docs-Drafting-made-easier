import { config } from 'dotenv';
config({ path: `.env.local` });

import '@/ai/flows/display-law-updates-with-summaries.ts';
import '@/ai/flows/generate-legal-draft.ts';

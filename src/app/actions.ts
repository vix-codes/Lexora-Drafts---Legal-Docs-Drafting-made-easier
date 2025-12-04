'use server';

import { generateLegalDraft } from '@/ai/flows/generate-legal-draft';
import { answerLegalQuery, type LegalQueryOutput } from '@/ai/flows/answer-legal-query';

type DraftState = {
  draft?: string;
  error?: string;
};

export const generateDraft = async (prevState: DraftState, formData: FormData): Promise<DraftState> => {
  const docType = formData.get('documentType') as string;
  const rawData = Object.fromEntries(formData.entries());

  try {
    const result = await generateLegalDraft({
      documentType: docType,
      formData: rawData,
    });
    
    const draftContent = result.legalDraft;

    return { draft: draftContent };
  } catch (error: any) {
    console.error('Error generating draft:', error);
    if (error.message.includes('overloaded')) {
        return { error: 'The AI service is currently busy. Please try again in a moment.' };
    }
    return { error: 'Failed to generate draft. Please try again.' };
  }
};

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export const askLawbot = async (query: string, history: Message[]): Promise<LegalQueryOutput> => {
  if (!query) {
    return { answer: "Please provide a query." };
  }

  try {
    const result = await answerLegalQuery({ query, history });
    return result;
  } catch (error: any) {
    console.error('Error in askLawbot action:', error);
    let errorMessage = "I'm sorry, I encountered an issue and can't respond right now. Please try again later.";
    
    if (error.message) {
      if (error.message.includes('overloaded')) {
          errorMessage = "The AI service is currently experiencing high traffic. Please try again in a few moments.";
      } else if (error.message.includes('blocked')) {
          errorMessage = "Your query could not be processed due to the content policy. Please try rephrasing your question.";
      }
    }
    
    return { answer: errorMessage };
  }
};

export const findLawyersExternally = async (location: string) => {
  // This is a mock function to simulate fetching data from Google Maps API.
  // In a real application, you would use a library like @googlemaps/google-maps-services-js
  // to call the Places API.
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

  console.log(`Simulating external search for lawyers near: ${location}`);
  
  // Return mock data that mimics the Google Places API response structure.
  return [
    {
      name: "Maheshwari & Co. | Top Law Firm",
      vicinity: "B-5, Inner Ring Road, Sector 6, Noida",
      rating: 4.8,
      user_ratings_total: 150,
      url: `https://www.google.com/maps/search/?api=1&query=lawyer+near+${encodeURIComponent(location)}`,
      source: 'google'
    },
    {
      name: "Singh & Associates, Founder - Manoj K. Singh",
      vicinity: "69, Paschimi Marg, Block C, Vasant Vihar, New Delhi",
      rating: 4.5,
      user_ratings_total: 200,
      url: `https://www.google.com/maps/search/?api=1&query=lawyer+near+${encodeURIComponent(location)}`,
      source: 'google'
    },
    {
      name: "Legacy Law Offices LLP",
      vicinity: "D-2, Block D, Anand Niketan, New Delhi",
      rating: 4.6,
      user_ratings_total: 95,
      url: `https://www.google.com/maps/search/?api=1&query=lawyer+near+${encodeURIComponent(location)}`,
      source: 'google'
    }
  ];
};

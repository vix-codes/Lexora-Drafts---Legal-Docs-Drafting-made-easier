
'use server';

import { generateLegalDraft } from '@/ai/flows/generate-legal-draft';
import { answerLegalQuery, type LegalQueryOutput } from '@/ai/flows/answer-legal-query';
import { documentTemplates } from '@/lib/data';

// ADMIN FIREBASE (CORRECT FOR SERVER ACTIONS)
import { getAdminFirestore } from '@/firebase/server-client';


/* ----------------------------
   GENERATE DRAFT
-----------------------------*/

type DraftState = {
  draft?: string;
  error?: string;
};

export const generateDraft = async (
  prevState: DraftState,
  formData: FormData
): Promise<DraftState> => {
  const docType = formData.get('documentType') as string;
  const rawData = Object.fromEntries(formData.entries());
  const userId = formData.get('userId') as string;

  try {
    const result = await generateLegalDraft({
      documentType: docType,
      formData: rawData
    });

    const draftContent = result.legalDraft;

    // Log activity (admin SDK)
    if (userId) {
      const db = getAdminFirestore();
      await db
        .collection("users")
        .doc(userId)
        .collection("activities")
        .add({
          action: "Generated",
          subject: documentTemplates.find(t => t.value === docType)?.label ?? "document",
          timestamp: new Date(),
          userId,
        });
    }

    return { draft: draftContent };
  } catch (error: any) {
    console.error("Error generating draft:", error);
    return { error: "Could not generate draft. Try again." };
  }
};


/* ----------------------------
   LAW BOT
-----------------------------*/

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export const askLawbot = async (
  query: string,
  history: Message[]
): Promise<LegalQueryOutput> => {
  if (!query) return { answer: "Please provide a query." };

  try {
    return await answerLegalQuery({ query, history });
  } catch (error: any) {
    console.error("LawBot Error:", error);
    return { answer: "I'm having trouble answering. Try again soon." };
  }
};


/* ----------------------------
   REQUEST VERIFICATION
-----------------------------*/

export async function requestVerification(
  userId: string,
  documentType: string,
  draftContent: string,
  formInputs: Record<string, any>
) {
  if (!userId || !draftContent) {
    return { success: false, error: "Missing data." };
  }

  try {
    const db = getAdminFirestore();

    await db.collection("verificationRequests").add({
      userId,
      documentType,
      draftContent,
      formInputs,
      status: "pending",
      lawyerComments: [],
      lawyerNotification: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      type: "document",
    });

    return { success: true };
  } catch (error) {
    console.error("SERVER VERIFICATION ERROR:", error);
    return { success: false, error: "Failed to save verification request on server." };
  }
}


/* ----------------------------
   REQUEST LAWYER VERIFICATION
-----------------------------*/

export async function requestLawyerVerification(
  userId: string,
  profileData: Record<string, any>
) {
  if (!userId) return { success: false, error: "Missing user ID." };

  try {
    const db = getAdminFirestore();

    await db.collection("verificationRequests").add({
      userId,
      documentType: "Lawyer Profile",
      draftContent: `
Verification request for ${profileData.name}.
Email: ${profileData.email}
Phone: ${profileData.phone}
Enrollment ID: ${profileData.enrollmentNumber}
Location: ${profileData.location.city}, ${profileData.location.state}
Specializations: ${profileData.specializations.join(", ")}
Experience: ${profileData.experience} years
Bio: ${profileData.description}
      `.trim(),
      formInputs: profileData,
      status: "pending",
      lawyerComments: [],
      lawyerNotification: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      type: "lawyer",
    });

    return { success: true };
  } catch (error) {
    console.error("LAWYER VERIFICATION ERROR:", error);
    return { success: false, error: "Failed to submit lawyer profile for verification." };
  }
}

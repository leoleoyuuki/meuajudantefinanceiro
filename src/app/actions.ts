'use server';

import {
  suggestTransactionCategory,
  type SuggestTransactionCategoryInput,
  type SuggestTransactionCategoryOutput,
} from '@/ai/flows/suggest-transaction-category';
import { getFirebaseAdmin } from '@/firebase/admin';
import { addMonths, format } from 'date-fns';
import { revalidatePath } from 'next/cache';

export async function suggestCategory(
  input: SuggestTransactionCategoryInput
): Promise<SuggestTransactionCategoryOutput> {
  return await suggestTransactionCategory(input);
}

export async function generateActivationCode(durationMonths: number): Promise<{ success: boolean, code?: string, error?: string }> {
  const { auth, db } = await getFirebaseAdmin();
  // This would typically be validated against the calling user's session
  // For now, we assume this action is only callable by an admin.

  if (durationMonths <= 0) {
    return { success: false, error: 'Duração deve ser um número positivo.' };
  }

  const codesRef = db.collection('activationCodes');
  const newCodeRef = codesRef.doc();
  const code = newCodeRef.id;

  try {
    await newCodeRef.set({
      id: code,
      durationMonths,
      isUsed: false,
      createdAt: new Date().toISOString(),
      usedBy: null,
      usedAt: null,
    });
    revalidatePath('/admin');
    return { success: true, code };
  } catch (error) {
    console.error("Error generating activation code:", error);
    return { success: false, error: 'Falha ao gerar o código.' };
  }
}

export async function activateSubscription(code: string): Promise<{ success: boolean; message: string }> {
  const { auth, db } = await getFirebaseAdmin();
  
  // This requires getting the currently authenticated user on the server.
  // In a real app, you'd get this from the session. 
  // This is a placeholder for where you would implement getting the calling user's ID.
  // For this to work, you need to set up server-side auth listening.
  // For now, this action will fail until server-side user identification is implemented.
  // Let's assume we can get the user ID for the sake of the logic.
  // A proper implementation would use Next-Auth or similar to get the user session.
  
  // THIS IS A PLACEHOLDER - A real implementation would securely get the user's ID
  const headers = require('next/headers');
  const authHeader = headers.headers().get('Authorization');
  if (!authHeader) {
      return { success: false, message: 'Usuário não autenticado.' };
  }
  const token = authHeader.split('Bearer ')[1];
  let decodedToken;
  try {
      decodedToken = await auth.verifyIdToken(token);
  } catch (error) {
      console.error("Error verifying ID token:", error);
      return { success: false, message: 'Sessão inválida.' };
  }
  const userId = decodedToken.uid;
  // END PLACEHOLDER

  const codeRef = db.collection('activationCodes').doc(code);
  const userSubscriptionRef = db.collection('users').doc(userId).collection('subscriptions').doc('current');

  try {
    const result = await db.runTransaction(async (transaction) => {
      const codeDoc = await transaction.get(codeRef);

      if (!codeDoc.exists) {
        throw new Error('Código de ativação inválido.');
      }

      const codeData = codeDoc.data();
      if (codeData?.isUsed) {
        throw new Error('Este código já foi utilizado.');
      }

      const now = new Date();
      const expiresAt = addMonths(now, codeData?.durationMonths);

      const subscriptionData = {
        userId: userId,
        status: 'active',
        expiresAt: expiresAt.toISOString(),
        startedAt: now.toISOString(),
        sourceCode: code,
      };

      transaction.set(userSubscriptionRef, subscriptionData);
      
      transaction.update(codeRef, {
        isUsed: true,
        usedBy: userId,
        usedAt: now.toISOString(),
      });

      return { success: true, message: `Sua assinatura está ativa até ${format(expiresAt, 'dd/MM/yyyy')}.` };
    });

    revalidatePath('/');
    return result;

  } catch (error: any) {
    console.error('Activation transaction failed: ', error);
    return { success: false, message: error.message || 'Ocorreu um erro ao ativar a assinatura.' };
  }
}

'use server';

import {
  suggestTransactionCategory,
  type SuggestTransactionCategoryInput,
  type SuggestTransactionCategoryOutput,
} from '@/ai/flows/suggest-transaction-category';

export async function suggestCategory(
  input: SuggestTransactionCategoryInput
): Promise<SuggestTransactionCategoryOutput> {
  return await suggestTransactionCategory(input);
}

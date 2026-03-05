'use server';

import {
  suggestTransactionCategory,
  type SuggestTransactionCategoryInput,
  type SuggestTransactionCategoryOutput,
} from '@/ai/flows/suggest-transaction-category';
import {
  suggestExpenseAnalysis,
  type SuggestExpenseAnalysisInput,
  type SuggestExpenseAnalysisOutput,
} from '@/ai/flows/suggest-expense-analysis';

export async function suggestCategory(
  input: SuggestTransactionCategoryInput
): Promise<SuggestTransactionCategoryOutput> {
  return await suggestTransactionCategory(input);
}

export async function getExpenseAnalysis(
  input: SuggestExpenseAnalysisInput
): Promise<SuggestExpenseAnalysisOutput> {
  return await suggestExpenseAnalysis(input);
}

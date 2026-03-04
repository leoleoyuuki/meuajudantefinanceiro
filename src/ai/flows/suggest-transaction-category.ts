'use server';
/**
 * @fileOverview A flow to suggest a transaction category based on a description.
 *
 * - suggestTransactionCategory - A function that handles the transaction category suggestion process.
 * - SuggestTransactionCategoryInput - The input type for the suggestTransactionCategory function.
 * - SuggestTransactionCategoryOutput - The return type for the suggestTransactionCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTransactionCategoryInputSchema = z.object({
  description: z.string().describe('The description of the transaction (e.g., "iFood", "Supermercado XYZ").'),
  availableCategories: z.array(z.string()).describe('A list of available categories to choose from.'),
});
export type SuggestTransactionCategoryInput = z.infer<typeof SuggestTransactionCategoryInputSchema>;

const SuggestTransactionCategoryOutputSchema = z.object({
  suggestedCategory: z.string().describe('The suggested category for the transaction, chosen from the available categories. If no suitable category is found, it should be an empty string.'),
});
export type SuggestTransactionCategoryOutput = z.infer<typeof SuggestTransactionCategoryOutputSchema>;

export async function suggestTransactionCategory(input: SuggestTransactionCategoryInput): Promise<SuggestTransactionCategoryOutput> {
  return suggestTransactionCategoryFlow(input);
}

const suggestCategoryPrompt = ai.definePrompt({
  name: 'suggestTransactionCategoryPrompt',
  input: {schema: SuggestTransactionCategoryInputSchema},
  output: {schema: SuggestTransactionCategoryOutputSchema},
  prompt: `You are an AI assistant specialized in financial categorization.
Your task is to suggest the most appropriate category for a transaction based on its description.

Here is the transaction description: "{{{description}}}"

Here is a list of available categories. You MUST choose one category from this list. If none of the categories seem appropriate, return an empty string for 'suggestedCategory'.

Available Categories:
{{#each availableCategories}}- {{{this}}}
{{/each}}

Example:
Description: iFood
Available Categories: Alimentação, Transporte, Lazer, Casa
Output: { "suggestedCategory": "Alimentação" }

Description: Uber
Available Categories: Alimentação, Transporte, Lazer, Casa
Output: { "suggestedCategory": "Transporte" }

Description: Spotify Premium
Available Categories: Alimentação, Transporte, Lazer, Casa, Assinaturas
Output: { "suggestedCategory": "Assinaturas" }

Description: Presente de aniversário
Available Categories: Alimentação, Transporte, Lazer, Casa
Output: { "suggestedCategory": "" } // No direct match, so return empty string

Provide ONLY the JSON output, selecting the best matching category from the list.`,
});

const suggestTransactionCategoryFlow = ai.defineFlow(
  {
    name: 'suggestTransactionCategoryFlow',
    inputSchema: SuggestTransactionCategoryInputSchema,
    outputSchema: SuggestTransactionCategoryOutputSchema,
  },
  async (input) => {
    const {output} = await suggestCategoryPrompt(input);
    return output!;
  }
);

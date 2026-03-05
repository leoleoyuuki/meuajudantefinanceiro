'use server';
/**
 * @fileOverview A flow to analyze user expenses and provide recommendations.
 *
 * - suggestExpenseAnalysis - A function that handles the expense analysis process.
 * - SuggestExpenseAnalysisInput - The input type for the suggestExpenseAnalysis function.
 * - SuggestExpenseAnalysisOutput - The return type for the suggestExpenseAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpendingByCategorySchema = z.object({
    categoryName: z.string().describe("The name of the category."),
    spentAmount: z.number().describe("The amount spent in this category."),
    idealPercentage: z.number().describe("The ideal spending percentage for this category (0-100)."),
});

const SuggestExpenseAnalysisInputSchema = z.object({
  totalIncome: z.number().describe('The total income for the month.'),
  spendingByCategory: z.array(SpendingByCategorySchema).describe('An array of spending for each category.'),
});
export type SuggestExpenseAnalysisInput = z.infer<typeof SuggestExpenseAnalysisInputSchema>;

const AnalysisItemSchema = z.object({
    categoryName: z.string(),
    spentAmount: z.number(),
    idealAmount: z.number(),
    comment: z.string().describe("A concise and helpful comment about the spending in this category. Use a friendly and encouraging tone. Provide practical advice if spending is over the ideal."),
    status: z.enum(['good', 'warning', 'over']).describe("Status of the spending: 'good' if within limit, 'warning' if slightly over, 'over' if significantly over."),
});

const SuggestExpenseAnalysisOutputSchema = z.object({
  analysis: z.array(AnalysisItemSchema).describe('The detailed analysis for each spending category.'),
  summary: z.string().describe("A brief, overall summary of the user's financial health for the month based on the analysis. Keep it under 50 words.")
});
export type SuggestExpenseAnalysisOutput = z.infer<typeof SuggestExpenseAnalysisOutputSchema>;

export async function suggestExpenseAnalysis(input: SuggestExpenseAnalysisInput): Promise<SuggestExpenseAnalysisOutput> {
  return suggestExpenseAnalysisFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'suggestExpenseAnalysisPrompt',
  input: {schema: SuggestExpenseAnalysisInputSchema},
  output: {schema: SuggestExpenseAnalysisOutputSchema},
  prompt: `You are a friendly and encouraging financial assistant. Your goal is to help users understand their spending habits and improve their financial health.

Analyze the user's monthly spending based on their total income and ideal category percentages. The total income for the month was: {{{totalIncome}}}.

For each category, compare the actual spending with the ideal spending amount (calculated from the ideal percentage of total income).

Provide a concise, helpful comment for each category.
- If spending is within the ideal range, praise the user.
- If spending is slightly over, provide a gentle warning and a small tip.
- If spending is significantly over, be clear but supportive, and offer a practical suggestion for how to reduce it.
- If there is no spending in a category that has an ideal percentage > 0, just note that.

Determine the status for each category:
- 'good': Spent amount is less than or equal to 105% of the ideal amount.
- 'warning': Spent amount is between 105% and 120% of the ideal amount.
- 'over': Spent amount is more than 120% of the ideal amount.

Here is the user's spending data:
{{#each spendingByCategory}}
- Category: {{{categoryName}}}
  - Amount Spent: {{{spentAmount}}}
  - Ideal Percentage: {{{idealPercentage}}}%
{{/each}}

Finally, provide a brief, encouraging overall summary (under 50 words) of their financial situation for the month.

Example output for one category:
{
  "categoryName": "Alimentação",
  "spentAmount": 550,
  "idealAmount": 500,
  "comment": "Você está indo muito bem! Seu gasto com alimentação está um pouquinho acima do ideal, mas nada preocupante. Que tal tentar cozinhar em casa uma vez a mais na semana?",
  "status": "warning"
}

Provide ONLY the JSON output.`,
});

const suggestExpenseAnalysisFlow = ai.defineFlow(
  {
    name: 'suggestExpenseAnalysisFlow',
    inputSchema: SuggestExpenseAnalysisInputSchema,
    outputSchema: SuggestExpenseAnalysisOutputSchema,
  },
  async (input) => {
    if (input.totalIncome === 0) {
      return {
        analysis: [],
        summary: "Não há renda registrada para este mês, então não é possível fazer uma análise. Adicione suas receitas para começar!"
      };
    }
    const {output} = await analysisPrompt(input);
    return output!;
  }
);

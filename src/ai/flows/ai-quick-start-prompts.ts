'use server';
/**
 * @fileOverview Provides example sales goals and inventory tracking strategies for new pool hall owners.
 *
 * - getQuickStartPrompts - A function that generates quick start prompts.
 * - QuickStartPromptsInput - The input type for the getQuickStartPrompts function.
 * - QuickStartPromptsOutput - The return type for the getQuickStartPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuickStartPromptsInputSchema = z.object({
  businessType: z
    .string()
    .describe('The type of business, such as a pool hall.'),
});
export type QuickStartPromptsInput = z.infer<typeof QuickStartPromptsInputSchema>;

const QuickStartPromptsOutputSchema = z.object({
  salesGoals: z.string().describe('Example sales goals for the business.'),
  inventoryTrackingStrategies: z
    .string()
    .describe('Example inventory tracking strategies for the business.'),
});
export type QuickStartPromptsOutput = z.infer<typeof QuickStartPromptsOutputSchema>;

export async function getQuickStartPrompts(input: QuickStartPromptsInput): Promise<QuickStartPromptsOutput> {
  return quickStartPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quickStartPromptsPrompt',
  input: {schema: QuickStartPromptsInputSchema},
  output: {schema: QuickStartPromptsOutputSchema},
  prompt: `You are a business consultant specializing in helping new business owners get started.  For the following type of business: {{{businessType}}}, provide example sales goals and inventory tracking strategies.

Sales Goals:

Inventory Tracking Strategies:`,
});

const quickStartPromptsFlow = ai.defineFlow(
  {
    name: 'quickStartPromptsFlow',
    inputSchema: QuickStartPromptsInputSchema,
    outputSchema: QuickStartPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

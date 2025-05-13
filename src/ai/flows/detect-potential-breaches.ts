// src/ai/flows/detect-potential-breaches.ts
'use server';

/**
 * @fileOverview Analyzes extracted contract data against predefined rules to identify potential breaches.
 *
 * - detectPotentialBreaches - A function that identifies potential breaches in contract data.
 * - DetectPotentialBreachesInput - The input type for the detectPotentialBreaches function.
 * - DetectPotentialBreachesOutput - The return type for the detectPotentialBreaches function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectPotentialBreachesInputSchema = z.object({
  contractData: z.string().describe('Extracted data from the contract in JSON format.'),
  breachConditions: z.string().describe('Predefined rules and conditions for breach detection in JSON format.'),
});
export type DetectPotentialBreachesInput = z.infer<typeof DetectPotentialBreachesInputSchema>;

const DetectPotentialBreachesOutputSchema = z.object({
  potentialBreaches: z
    .array(z.string())
    .describe('A list of potential breaches identified in the contract data.'),
  summary: z.string().describe('A summary of the breach detection analysis.'),
});
export type DetectPotentialBreachesOutput = z.infer<typeof DetectPotentialBreachesOutputSchema>;

export async function detectPotentialBreaches(
  input: DetectPotentialBreachesInput
): Promise<DetectPotentialBreachesOutput> {
  return detectPotentialBreachesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectPotentialBreachesPrompt',
  input: {schema: DetectPotentialBreachesInputSchema},
  output: {schema: DetectPotentialBreachesOutputSchema},
  prompt: `You are an AI assistant specialized in legal contract analysis.

You will receive extracted data from a contract and a set of predefined rules and conditions for breach detection.
Your task is to analyze the contract data against these rules and identify any potential breaches or non-compliance issues.

Contract Data:
{{contractData}}

Breach Conditions:
{{breachConditions}}

Based on the contract data and breach conditions, identify any potential breaches and provide a summary of your analysis.
`,
});

const detectPotentialBreachesFlow = ai.defineFlow(
  {
    name: 'detectPotentialBreachesFlow',
    inputSchema: DetectPotentialBreachesInputSchema,
    outputSchema: DetectPotentialBreachesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

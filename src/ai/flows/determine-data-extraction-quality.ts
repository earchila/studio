// This is an autogenerated file from Firebase Studio.

'use server';

/**
 * @fileOverview Determines the quality and confidence level of data extracted from a contract using AI.
 *
 * - determineDataExtractionQuality - A function that assesses the quality of extracted contract data.
 * - DetermineDataExtractionQualityInput - The input type for the determineDataExtractionQuality function.
 * - DetermineDataExtractionQualityOutput - The return type for the determineDataExtractionQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetermineDataExtractionQualityInputSchema = z.object({
  extractedData: z.string().describe('The extracted data from the contract.'),
  contractText: z.string().describe('The original contract text.'),
});
export type DetermineDataExtractionQualityInput = z.infer<typeof DetermineDataExtractionQualityInputSchema>;

const DetermineDataExtractionQualityOutputSchema = z.object({
  qualityScore: z.number().describe('A score between 0 and 1 indicating the quality of the data extraction, where 1 is perfect.'),
  confidenceLevel: z.enum(['low', 'medium', 'high']).describe('The confidence level of the data extraction.'),
  isComplete: z.boolean().describe('Whether or not the data extraction is complete and no manual review is needed.'),
  justification: z.string().describe('A justification for the assigned quality score and confidence level.'),
});
export type DetermineDataExtractionQualityOutput = z.infer<typeof DetermineDataExtractionQualityOutputSchema>;

export async function determineDataExtractionQuality(input: DetermineDataExtractionQualityInput): Promise<DetermineDataExtractionQualityOutput> {
  return determineDataExtractionQualityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'determineDataExtractionQualityPrompt',
  input: {schema: DetermineDataExtractionQualityInputSchema},
  output: {schema: DetermineDataExtractionQualityOutputSchema},
  prompt: `You are an expert in contract analysis and data extraction quality assessment.

You are provided with the original contract text and the extracted data.
Your task is to assess the quality and completeness of the extracted data and provide a quality score, confidence level, a completeness boolean, and a justification.

Contract Text: {{{contractText}}}

Extracted Data: {{{extractedData}}}

Consider the following when determining the quality score and confidence level:
- Accuracy of the extracted data compared to the original contract text.
- Completeness of the extracted data (i.e., whether all key data points have been extracted).
- Consistency of the extracted data.
- Potential ambiguity or errors in the extracted data.

Quality Score (0-1): Assign a score between 0 and 1 (inclusive) representing the overall quality of the extracted data.

Confidence Level: Assign a confidence level of "low", "medium", or "high" based on your assessment.

Is Complete: Is the data extraction complete, where no manual review is needed? (true/false)

Justification: Provide a brief justification for the assigned quality score and confidence level.

Make sure to return the response in JSON format.
`,
});

const determineDataExtractionQualityFlow = ai.defineFlow(
  {
    name: 'determineDataExtractionQualityFlow',
    inputSchema: DetermineDataExtractionQualityInputSchema,
    outputSchema: DetermineDataExtractionQualityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

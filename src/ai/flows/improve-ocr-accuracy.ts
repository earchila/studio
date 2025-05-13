'use server';

/**
 * @fileOverview This flow improves OCR accuracy by assessing document layout using AI.
 *
 * - improveOcrAccuracy - A function that enhances OCR processing for contract documents.
 * - ImproveOcrAccuracyInput - The input type for the improveOcrAccuracy function.
 * - ImproveOcrAccuracyOutput - The return type for the improveOcrAccuracy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveOcrAccuracyInputSchema = z.object({
  ocrText: z.string().describe('The raw OCR text extracted from the document.'),
  documentLayout: z.string().describe('Description of the document layout.'),
});
export type ImproveOcrAccuracyInput = z.infer<typeof ImproveOcrAccuracyInputSchema>;

const ImproveOcrAccuracyOutputSchema = z.object({
  improvedOcrText: z.string().describe('The OCR text, improved by AI to account for layout.'),
  layoutAssessment: z
    .string()
    .describe('An assessment of the document layout, highlighting potential issues.'),
});
export type ImproveOcrAccuracyOutput = z.infer<typeof ImproveOcrAccuracyOutputSchema>;

export async function improveOcrAccuracy(
  input: ImproveOcrAccuracyInput
): Promise<ImproveOcrAccuracyOutput> {
  return improveOcrAccuracyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveOcrAccuracyPrompt',
  input: {schema: ImproveOcrAccuracyInputSchema},
  output: {schema: ImproveOcrAccuracyOutputSchema},
  prompt: `You are an AI assistant specialized in improving the accuracy of OCR-extracted text from legal documents. You will receive raw OCR text and a description of the document's layout.

  Your goal is to correct errors in the OCR text that may be caused by formatting or layout issues in the document. You should also provide an assessment of the document layout, pointing out any potential problems that could affect OCR accuracy.

  Here is the raw OCR text:
  {{ocrText}}

  Here is a description of the document layout:
  {{documentLayout}}

  Based on the above information, provide the improved OCR text and layout assessment.
  `,
});

const improveOcrAccuracyFlow = ai.defineFlow(
  {
    name: 'improveOcrAccuracyFlow',
    inputSchema: ImproveOcrAccuracyInputSchema,
    outputSchema: ImproveOcrAccuracyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

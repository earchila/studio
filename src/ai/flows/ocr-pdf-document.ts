'use server';
/**
 * @fileOverview Performs OCR on a PDF document to extract text.
 *
 * - ocrPdfDocument - A function that extracts text from a PDF.
 * - OcrPdfDocumentInput - The input type for the ocrPdfDocument function.
 * - OcrPdfDocumentOutput - The return type for the ocrPdfDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OcrPdfDocumentInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF document content as a data URI that must include a MIME type ('application/pdf') and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type OcrPdfDocumentInput = z.infer<typeof OcrPdfDocumentInputSchema>;

const OcrPdfDocumentOutputSchema = z.object({
  extractedText: z.string().describe('The text extracted from the PDF document.'),
});
export type OcrPdfDocumentOutput = z.infer<typeof OcrPdfDocumentOutputSchema>;

export async function ocrPdfDocument(input: OcrPdfDocumentInput): Promise<OcrPdfDocumentOutput> {
  return ocrPdfDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ocrPdfDocumentPrompt',
  input: {schema: OcrPdfDocumentInputSchema},
  output: {schema: OcrPdfDocumentOutputSchema},
  prompt: `You are an Optical Character Recognition (OCR) assistant.
Your task is to extract all textual content from the provided PDF document.
Ensure the output contains only the extracted text.

PDF Document:
{{media url=pdfDataUri}}
`,
});

const ocrPdfDocumentFlow = ai.defineFlow(
  {
    name: 'ocrPdfDocumentFlow',
    inputSchema: OcrPdfDocumentInputSchema,
    outputSchema: OcrPdfDocumentOutputSchema,
  },
  async input => {
    // For PDFs, Gemini might need specific handling or a multimodal model
    // This prompt assumes the model can directly process a PDF data URI for text extraction.
    // Adjust safety settings if needed for document processing.
    const {output} = await prompt(input, {
      config: {
        // Example: Adjusting safety for potentially sensitive document content
        // safetySettings: [
        //   { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        // ],
      },
    });
    return output!;
  }
);

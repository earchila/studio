'use server';
/**
 * @fileOverview Extracts key data points from contract documents using AI.
 *
 * - extractContractData - A function that handles the contract data extraction process.
 * - ExtractContractDataInput - The input type for the extractContractData function.
 * - ExtractContractDataOutput - The return type for the extractContractData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractContractDataInputSchema = z.object({
  documentText: z.string().describe('The text content of the contract document.'),
});
export type ExtractContractDataInput = z.infer<typeof ExtractContractDataInputSchema>;

const ExtractContractDataOutputSchema = z.object({
  contractSummary: z
    .string()
    .describe('A concise summary of the contract including key data points.'),
  effectiveDate: z.string().optional().describe('The date when the contract becomes effective.'),
  expirationDate: z.string().optional().describe('The date when the contract expires.'),
  partiesInvolved: z.array(z.string()).describe('List of parties involved in the contract.'),
  financialTerms: z.string().optional().describe('Summary of financial terms (amounts, payment terms, etc.).'),
  conditions: z
    .array(z.string())
    .optional()
    .describe('Key conditions, obligations, and penalties in the contract.'),
  breachClauses: z
    .array(z.string())
    .optional()
    .describe('Clauses specifying conditions that constitute a breach of contract.'),
  terminationClauses: z
    .array(z.string())
    .optional()
    .describe('Clauses outlining the conditions for contract termination.'),
});
export type ExtractContractDataOutput = z.infer<typeof ExtractContractDataOutputSchema>;

export async function extractContractData(input: ExtractContractDataInput): Promise<ExtractContractDataOutput> {
  return extractContractDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractContractDataPrompt',
  input: {schema: ExtractContractDataInputSchema},
  output: {schema: ExtractContractDataOutputSchema},
  prompt: `You are an AI assistant tasked with extracting key data points from contract documents.

  Analyze the following contract text and extract the relevant information to provide a concise summary and specific details as requested in the output schema.

  Contract Text: {{{documentText}}}
  `,
});

const extractContractDataFlow = ai.defineFlow(
  {
    name: 'extractContractDataFlow',
    inputSchema: ExtractContractDataInputSchema,
    outputSchema: ExtractContractDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

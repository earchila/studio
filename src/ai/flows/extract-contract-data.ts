
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
  userInstructions: z.string().optional().describe('Optional user-provided instructions or specific questions to guide the data extraction process.'),
});
export type ExtractContractDataInput = z.infer<typeof ExtractContractDataInputSchema>;

const ExtractContractDataOutputSchema = z.object({
  contractSummary: z
    .string()
    .describe('A concise summary of the contract including key data points.'),
  effectiveDate: z.string().optional().describe('The date when the contract becomes effective. Should be in YYYY-MM-DD format if possible.'),
  expirationDate: z.string().optional().describe('The date when the contract expires. Should be in YYYY-MM-DD format if possible.'),
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

  When extracting dates (like effective date or expiration date), please adhere to the following:
  - Recognize various common date formats (e.g., "Month DD, YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD Month YYYY", "MM-DD-YY").
  - Interpret natural language descriptions of dates. For example, "four months after start date", "the first Monday of June 2025", or "upon signing".
  - If a date is relative to another date (e.g., "X months after [another date field like 'start date']"), and that base date is also being extracted or is clearly identifiable in the text, try to calculate and provide the absolute date in YYYY-MM-DD format.
  - If an absolute date cannot be confidently calculated from a natural language description (e.g., "upon signing" without a clear signing date, or a complex relative date calculation), provide the natural language description as extracted in the date field.
  - Always attempt to normalize extracted specific dates to YYYY-MM-DD format in your output. If a date is ambiguous or described in relative terms that cannot be resolved to a YYYY-MM-DD format, return the textual description.

  Example for relative dates:
  If "SOW Estimated Start Date" is "Aug, 5 2024" and "SOW Estimated End Date" is "Four months after start date", then:
  - effectiveDate should ideally be "2024-08-05"
  - expirationDate should ideally be "2024-12-05". If you cannot confidently calculate this, "Four months after start date" is an acceptable fallback.

  {{#if userInstructions}}
  Additionally, please consider the following specific instructions or questions while performing the extraction:
  {{{userInstructions}}}
  {{/if}}

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


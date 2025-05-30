
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import type { ContractDocument } from '@/types';

import { ocrPdfDocument } from '@/ai/flows/ocr-pdf-document';
import { improveOcrAccuracy } from '@/ai/flows/improve-ocr-accuracy';
import { extractContractData } from '@/ai/flows/extract-contract-data';
import { determineDataExtractionQuality } from '@/ai/flows/determine-data-extraction-quality';

import { Loader2, FileUp } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const contractFormSchema = z.object({
  name: z.string().min(3, { message: "Contract name must be at least 3 characters." }),
  documentFile: z
    .instanceof(File, { message: "A PDF document is required." })
    .refine((file) => file?.size > 0, "A PDF document is required.")
    .refine((file) => file?.type === "application/pdf", "Only PDF files are accepted.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `File size must be ${MAX_FILE_SIZE / (1024*1024)}MB or less.`),
  userInstructions: z.string().optional(), 
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export function ContractForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { addContract, setIsLoading, isLoading } = useAppContext();
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      name: '',
      documentFile: undefined,
      userInstructions: '', 
    },
  });

  async function onSubmit(data: ContractFormValues) {
    setIsLoading(true);
    toast({ title: "Processing Contract...", description: "Uploading PDF and starting AI analysis. This may take a moment." });

    try {
      const contractId = crypto.randomUUID();
      let currentContractData: Partial<ContractDocument> = {
        id: contractId,
        name: data.name,
        userInstructions: data.userInstructions, 
        uploadedAt: new Date().toISOString(),
        status: 'processing',
      };

      // Step 0: Read file as Data URI
      const pdfDataUri = await readFileAsDataURL(data.documentFile);

      // Step 1: OCR PDF Document
      toast({ title: "Extracting Text...", description: "AI is extracting text from the PDF." });
      const ocrPdfResult = await ocrPdfDocument({ pdfDataUri });
      let textForProcessing = ocrPdfResult.extractedText;
      currentContractData.originalText = textForProcessing; 

      // Step 2: Improve OCR Accuracy (This step was conditional on layoutDescription, which is now removed)
      // If improveOcrAccuracy is still desired without layoutDescription, its call and input schema would need adjustment.
      // For now, it's effectively disabled as data.layoutDescription no longer exists.
      // Example: if a default or empty layout description should be used:
      /*
      const improvedOcrResult = await improveOcrAccuracy({
        ocrText: textForProcessing,
        documentLayout: "", // Or some default
      });
      currentContractData.ocrImproved = improvedOcrResult;
      textForProcessing = improvedOcrResult.improvedOcrText;
      */
      
      // Step 3: Extract Contract Data
      toast({ title: "Extracting Data...", description: "AI is identifying key information from the contract." });
      const extractedDataResult = await extractContractData({ 
        documentText: textForProcessing,
        userInstructions: data.userInstructions 
      });
      currentContractData.extractedData = extractedDataResult;

      // Step 4: Determine Data Extraction Quality
      toast({ title: "Assessing Quality...", description: "AI is evaluating the extraction quality." });
      const qualityAssessment = await determineDataExtractionQuality({
        extractedData: JSON.stringify(extractedDataResult),
        contractText: textForProcessing, 
      });
      currentContractData.qualityAssessment = qualityAssessment;
      
      currentContractData.status = 'analyzed';
      addContract(currentContractData as ContractDocument);

      toast({
        title: "Contract Processed Successfully!",
        description: `${data.name} has been analyzed and saved. Quality: ${qualityAssessment.confidenceLevel}.`,
        variant: "default",
      });
      router.push(`/contracts/${contractId}`);

    } catch (error) {
      console.error("Error processing contract:", error);
      toast({
        title: "Error Processing Contract",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Add New Contract</CardTitle>
        <CardDescription>
          Upload a PDF document. AI will extract text and analyze it for key information.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Name / Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Master Service Agreement - Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="documentFile"
              render={({ field: { onChange, value, ...restField } }) => (
                <FormItem>
                  <FormLabel>Contract Document (PDF)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                       <label htmlFor="document-upload" className="flex-grow">
                        <Input
                          id="document-upload"
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file);
                              setFileName(file.name);
                            } else {
                              onChange(undefined);
                              setFileName(null);
                            }
                          }}
                          className="hidden" 
                          {...restField}
                        />
                         <Button type="button" variant="outline" asChild>
                           <span className="w-full cursor-pointer">
                             <FileUp className="mr-2 h-4 w-4" />
                             {fileName || "Choose PDF File..."}
                           </span>
                         </Button>
                       </label>
                     </div>
                  </FormControl>
                  {fileName && <FormDescription>Selected file: {fileName}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Instructions / Prompt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Focus on extracting all payment deadlines.', 'What are the key obligations of Party A?', 'Summarize the intellectual property clauses.'"
                      className="resize-y"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide any specific instructions or questions for the AI to consider during analysis.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Contract...
                </>
              ) : (
                "Analyze and Save Contract"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

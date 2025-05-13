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

import { improveOcrAccuracy } from '@/ai/flows/improve-ocr-accuracy';
import { extractContractData } from '@/ai/flows/extract-contract-data';
import { determineDataExtractionQuality } from '@/ai/flows/determine-data-extraction-quality';

import { Loader2 } from 'lucide-react';

const contractFormSchema = z.object({
  name: z.string().min(3, { message: "Contract name must be at least 3 characters." }),
  originalText: z.string().min(50, { message: "Contract text must be at least 50 characters." }),
  layoutDescription: z.string().min(10, { message: "Layout description must be at least 10 characters." }).optional(),
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

export function ContractForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { addContract, setIsLoading, isLoading } = useAppContext();

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      name: '',
      originalText: '',
      layoutDescription: '',
    },
  });

  async function onSubmit(data: ContractFormValues) {
    setIsLoading(true);
    toast({ title: "Processing Contract...", description: "AI analysis in progress. This may take a moment." });

    try {
      const contractId = crypto.randomUUID();
      let currentContractData: Partial<ContractDocument> = {
        id: contractId,
        name: data.name,
        originalText: data.originalText,
        layoutDescription: data.layoutDescription,
        uploadedAt: new Date().toISOString(),
        status: 'processing',
      };

      // Step 1: Improve OCR Accuracy (if layout description provided)
      if (data.layoutDescription) {
        const ocrResult = await improveOcrAccuracy({
          ocrText: data.originalText,
          documentLayout: data.layoutDescription,
        });
        currentContractData.ocrImproved = ocrResult;
        toast({ title: "OCR Improved", description: "Document layout assessed and text enhanced." });
      }
      
      const textToExtract = currentContractData.ocrImproved?.improvedOcrText || data.originalText;

      // Step 2: Extract Contract Data
      const extractedData = await extractContractData({ documentText: textToExtract });
      currentContractData.extractedData = extractedData;
      toast({ title: "Data Extracted", description: "Key information identified from the contract." });

      // Step 3: Determine Data Extraction Quality
      const qualityAssessment = await determineDataExtractionQuality({
        extractedData: JSON.stringify(extractedData),
        contractText: textToExtract,
      });
      currentContractData.qualityAssessment = qualityAssessment;
      toast({ title: "Quality Assessed", description: `Extraction quality: ${qualityAssessment.confidenceLevel}.` });

      currentContractData.status = 'analyzed';
      addContract(currentContractData as ContractDocument);

      toast({
        title: "Contract Processed Successfully!",
        description: `${data.name} has been analyzed and saved.`,
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
      // Update contract status to error if it was partially processed
      // This part needs careful handling of contract state if an error occurs mid-process
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Add New Contract</CardTitle>
        <CardDescription>
          Enter the contract details below. AI will analyze the text to extract key information.
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
              name="originalText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the full contract text here..."
                      className="min-h-[200px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The AI will process this text. Ensure it's as complete as possible.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="layoutDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Layout Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Two-column layout, headers and footers present, signatures at the end."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describing the layout helps improve OCR accuracy.
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
                  Processing...
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

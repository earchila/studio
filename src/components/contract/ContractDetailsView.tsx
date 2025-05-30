'use client';

import type { ContractDocument } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, FileText, Info, ListChecks, BarChart3, LucideIcon, Package, CheckSquare } from 'lucide-react';
import { PenaltyCalculator } from './PenaltyCalculator';
import { BreachDetector } from './BreachDetector';
import { DataExportButton } from '@/components/common/DataExportButton';
import { useAppContext as useActualAppContext } from '@/contexts/AppContext'; // Renamed import


interface ContractDetailsViewProps {
  contract: ContractDocument;
}

function DataSection({ title, data, Icon }: { title: string, data: any, Icon?: LucideIcon }) {
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  const isObject = typeof data === 'object' && data !== null && !Array.isArray(data);
  
  return (
    <div className="mb-4">
      <h3 className="text-md font-semibold text-primary mb-2 flex items-center">
        {Icon && <Icon className="mr-2 h-5 w-5" />}
        {title}
      </h3>
      {isObject ? (
        <pre className="bg-secondary p-3 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : Array.isArray(data) ? (
        <ul className="list-disc list-inside pl-2 space-y-1">
          {data.map((item, index) => <li key={index} className="text-sm text-muted-foreground">{String(item)}</li>)}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap break-all">{String(data)}</p>
      )}
    </div>
  );
}


export function ContractDetailsView({ contract }: ContractDetailsViewProps) {
  const { ocrImproved, extractedData, qualityAssessment } = contract;

  return (
    <div className="space-y-6">
       <PageHeaderForDetails title={contract.name} uploadedAt={contract.uploadedAt} contractStatus={contract.status} contractId={contract.id} />

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="fullText">Full Text</TabsTrigger>
          <TabsTrigger value="breaches">Breach Analysis</TabsTrigger>
          <TabsTrigger value="penalties">Penalties</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Contract Summary & Extracted Data</CardTitle>
              <CardDescription>Key information automatically extracted by AI.</CardDescription>
            </CardHeader>
            <CardContent>
              {qualityAssessment && (
                <div className="mb-6 p-4 border rounded-lg bg-accent/20">
                  <h3 className="text-lg font-semibold mb-2 flex items-center text-accent-foreground">
                    <BarChart3 className="mr-2 h-5 w-5"/> Data Extraction Quality
                  </h3>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Overall Quality Score:</span>
                    <Badge variant={qualityAssessment.qualityScore > 0.7 ? "default" : qualityAssessment.qualityScore > 0.4 ? "secondary" : "destructive"} className="bg-opacity-70">
                      {(qualityAssessment.qualityScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress value={qualityAssessment.qualityScore * 100} className="h-2 mb-2" />
                  <p className="text-sm"><strong>Confidence:</strong> <Badge variant="outline">{qualityAssessment.confidenceLevel}</Badge></p>
                  <p className="text-sm"><strong>Completeness:</strong> {qualityAssessment.isComplete ? <CheckCircle className="inline h-4 w-4 text-green-600" /> : <AlertTriangle className="inline h-4 w-4 text-yellow-600" />} {qualityAssessment.isComplete ? "Complete" : "Needs Review"}</p>
                  <p className="text-sm mt-1"><strong>Justification:</strong> {qualityAssessment.justification}</p>
                </div>
              )}

              {extractedData ? (
                <div className="space-y-3">
                  <DataSection title="Contract Summary" data={extractedData.contractSummary} Icon={Info}/>
                  <div className="grid md:grid-cols-2 gap-4">
                    <DataSection title="Effective Date" data={extractedData.effectiveDate ? new Date(extractedData.effectiveDate).toLocaleDateString() : 'N/A'} />
                    <DataSection title="Expiration Date" data={extractedData.expirationDate ? new Date(extractedData.expirationDate).toLocaleDateString() : 'N/A'} />
                  </div>
                  <DataSection title="Parties Involved" data={extractedData.partiesInvolved} Icon={ListChecks} />
                  <DataSection title="Financial Terms" data={extractedData.financialTerms} />
                  <DataSection title="Deliverables" data={extractedData.deliverables} Icon={Package} />
                  <DataSection title="Acceptance Criteria" data={extractedData.acceptanceCriteria} Icon={CheckSquare} />
                  <DataSection title="Key Conditions & Obligations" data={extractedData.conditions} />
                  <DataSection title="Breach Clauses" data={extractedData.breachClauses} />
                  <DataSection title="Termination Clauses" data={extractedData.terminationClauses} />
                </div>
              ) : (
                <p className="text-muted-foreground">No data extracted yet or extraction failed.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fullText">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Contract Text</CardTitle>
              <CardDescription>Original and AI-improved contract text.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="improved" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-2">
                  <TabsTrigger value="improved" disabled={!ocrImproved}>AI-Improved Text</TabsTrigger>
                  <TabsTrigger value="original">Original Text</TabsTrigger>
                </TabsList>
                <TabsContent value="improved">
                  <ScrollArea className="h-[400px] p-4 border rounded-md bg-secondary">
                    <pre className="text-sm whitespace-pre-wrap break-all">
                      {ocrImproved?.improvedOcrText || "No AI-improved text available."}
                    </pre>
                  </ScrollArea>
                  {ocrImproved?.layoutAssessment && (
                    <div className="mt-4 p-3 border rounded-md bg-accent/10">
                      <h4 className="font-semibold text-sm mb-1 text-accent-foreground">Layout Assessment:</h4>
                      <p className="text-xs text-muted-foreground">{ocrImproved.layoutAssessment}</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="original">
                   <ScrollArea className="h-[400px] p-4 border rounded-md bg-secondary">
                    <pre className="text-sm whitespace-pre-wrap break-all">
                      {contract.originalText || "No original text available."}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breaches">
          <BreachDetector contract={contract} />
        </TabsContent>

        <TabsContent value="penalties">
          <PenaltyCalculator contract={contract} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PageHeaderForDetails({ title, uploadedAt, contractStatus, contractId }: { title: string, uploadedAt: string, contractStatus: ContractDocument['status'], contractId: string }) {
  const { getContractById } = useActualAppContext(); // Using renamed import
  const contract = getContractById(contractId);

  if (!contract) return null;

  const getStatusBadgeVariant = () => {
    switch (contractStatus) {
      case 'analyzed': return "default";
      case 'processing': return "secondary";
      case 'error': return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-primary">
            {title}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Uploaded: {new Date(uploadedAt).toLocaleDateString()}</span>
            <Badge variant={getStatusBadgeVariant()} className="capitalize">{contractStatus}</Badge>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <DataExportButton contract={contract} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { ContractDocument, BreachConditionRule } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Loader2, ShieldAlert, PlusCircle, Trash2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { detectPotentialBreaches } from '@/ai/flows/detect-potential-breaches';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';

interface BreachDetectorProps {
  contract: ContractDocument;
}

const defaultBreachRules: BreachConditionRule[] = [
  { field: "expirationDate", operator: "exists", description: "Contract must have an expiration date." },
  { field: "partiesInvolved", operator: "greater_than", value: 1, description: "Contract must involve at least two parties." },
  { field: "financialTerms", operator: "exists", description: "Contract should specify financial terms." },
  { field: "terminationClauses", operator: "exists", description: "Contract should include termination clauses."}
];


export function BreachDetector({ contract }: BreachDetectorProps) {
  const { updateContract, setIsLoading, isLoading } = useAppContext();
  const { toast } = useToast();
  const [breachConditions, setBreachConditions] = useState<BreachConditionRule[]>(
    contract.breachDetection?.conditions ? JSON.parse(contract.breachDetection.conditions) : defaultBreachRules
  );
  
  const handleRuleChange = (index: number, field: keyof BreachConditionRule, value: any) => {
    const newConditions = [...breachConditions];
    (newConditions[index] as any)[field] = value; // Type assertion to allow dynamic key assignment
    setBreachConditions(newConditions);
  };

  const addRule = () => {
    setBreachConditions([...breachConditions, { field: "contractSummary", operator: "contains", value: "", description: "" }]);
  };

  const removeRule = (index: number) => {
    setBreachConditions(breachConditions.filter((_, i) => i !== index));
  };


  const handleDetectBreaches = async () => {
    if (!contract.extractedData) {
      toast({ title: "Missing Data", description: "Contract data must be extracted first.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    toast({ title: "Detecting Breaches...", description: "AI is analyzing the contract against defined conditions." });
    
    const conditionsString = JSON.stringify(breachConditions);

    try {
      const result = await detectPotentialBreaches({
        contractData: JSON.stringify(contract.extractedData),
        breachConditions: conditionsString,
      });

      updateContract(contract.id, {
        breachDetection: { conditions: conditionsString, result },
      });

      toast({
        title: "Breach Detection Complete",
        description: result.potentialBreaches.length > 0 
          ? `${result.potentialBreaches.length} potential breach(es) found.` 
          : "No potential breaches found based on current conditions.",
      });
    } catch (error) {
      console.error("Error detecting breaches:", error);
      toast({
        title: "Breach Detection Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const breachResult = contract.breachDetection?.result;

  return (
    <Card className="mt-6 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center"><ShieldAlert className="mr-2 h-5 w-5 text-primary" /> Breach Detection</CardTitle>
        <CardDescription>Define conditions and use AI to identify potential contract breaches or non-compliance.</CardDescription>
      </CardHeader>
      <CardContent>
        <Label className="text-sm font-medium">Breach Detection Rules</Label>
        <div className="space-y-3 mt-2 mb-4 max-h-60 overflow-y-auto p-1">
          {breachConditions.map((rule, index) => (
            <Card key={index} className="p-3 bg-secondary/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 items-end">
                <div className="flex-grow">
                  <Label htmlFor={`rule-field-${index}`} className="text-xs">Field</Label>
                  <Input id={`rule-field-${index}`} value={rule.field as string} onChange={(e) => handleRuleChange(index, "field", e.target.value)} placeholder="e.g. expirationDate" />
                </div>
                <div>
                  <Label htmlFor={`rule-operator-${index}`} className="text-xs">Operator</Label>
                   <Select value={rule.operator} onValueChange={(value) => handleRuleChange(index, "operator", value)}>
                    <SelectTrigger id={`rule-operator-${index}`}>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exists">Exists</SelectItem>
                      <SelectItem value="not_exists">Not Exists</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="not_contains">Not Contains</SelectItem>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-grow">
                  <Label htmlFor={`rule-value-${index}`} className="text-xs">Value (if any)</Label>
                  <Input id={`rule-value-${index}`} value={rule.value as string | number} onChange={(e) => handleRuleChange(index, "value", e.target.value)} placeholder="Value for operator" />
                </div>
              </div>
              <div className="mt-2">
                <Label htmlFor={`rule-desc-${index}`} className="text-xs">Description</Label>
                <Input id={`rule-desc-${index}`} value={rule.description} onChange={(e) => handleRuleChange(index, "description", e.target.value)} placeholder="Rule description" />
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeRule(index)} className="mt-2 text-destructive hover:text-destructive-foreground hover:bg-destructive text-xs p-1 h-auto">
                <Trash2 className="mr-1 h-3 w-3" /> Remove
              </Button>
            </Card>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={addRule} className="mb-4">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Rule
        </Button>

        <Button onClick={handleDetectBreaches} className="w-full" disabled={isLoading || !contract.extractedData}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Detecting Breaches...
            </>
          ) : (
            <>
              <ShieldAlert className="mr-2 h-4 w-4" />
              Run Breach Detection
            </>
          )}
        </Button>

        {breachResult && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2 text-lg">Detection Results:</h4>
            <p className="text-sm text-muted-foreground mb-1"><strong>Summary:</strong> {breachResult.summary}</p>
            {breachResult.potentialBreaches.length > 0 ? (
              <ul className="space-y-2 list-disc list-inside pl-1">
                {breachResult.potentialBreaches.map((breach, idx) => (
                  <li key={idx} className="p-2 border rounded-md bg-destructive/10 text-destructive-foreground flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 shrink-0 text-destructive" />
                    <span>{breach}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-600 bg-green-50 p-3 rounded-md">No potential breaches identified based on the defined conditions.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

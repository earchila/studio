'use client';

import { useState, useEffect } from 'react';
import type { ContractDocument, CalculatedPenalty, DetectPotentialBreachesOutput } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { FormItem } from '@/components/ui/form'; // Added import

interface PenaltyCalculatorProps {
  contract: ContractDocument;
}

interface PenaltyRule {
  id: string;
  conditionText: string; // e.g., "Late payment by X days"
  penaltyType: 'fixed' | 'percentage';
  amount?: number;
  percentage?: number;
  appliesToField?: string; // e.g., "total_contract_value" or specific amount field from extracted data
}

export function PenaltyCalculator({ contract }: PenaltyCalculatorProps) {
  const { updateContract, setIsLoading, isLoading } = useAppContext();
  const { toast } = useToast();
  const [rules, setRules] = useState<PenaltyRule[]>([]);
  const [calculatedPenalties, setCalculatedPenalties] = useState<CalculatedPenalty[]>(contract.penalties || []);

  // Example: Initialize with a default rule if relevant data exists
  useEffect(() => {
    if (contract.extractedData?.financialTerms && rules.length === 0) {
      // A more sophisticated rule generation could be AI-driven based on financialTerms
      // For now, a simple placeholder:
      // setRules([{ id: crypto.randomUUID(), conditionText: "Late Payment", penaltyType: 'percentage', percentage: 5, appliesToField: "invoice_amount" }]);
    }
    setCalculatedPenalties(contract.penalties || []);
  }, [contract, rules.length]);

  const handleAddRule = () => {
    setRules([...rules, { id: crypto.randomUUID(), conditionText: '', penaltyType: 'fixed', amount: 0, percentage: 0 }]);
  };

  const handleRuleChange = (id: string, field: keyof PenaltyRule, value: any) => {
    setRules(rules.map(rule => rule.id === id ? { ...rule, [field]: value } : rule));
  };

  const handleRemoveRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };
  
  const applyRulesAndCalculate = () => {
    setIsLoading(true);
    // This is a simplified calculation logic.
    // A real system would need to parse contract.extractedData and contract.breachDetection?.result
    // to determine if rule conditions are met.
    
    const newPenalties: CalculatedPenalty[] = [];

    rules.forEach(rule => {
      // Simulate checking if a breach related to this rule exists
      // For example, check contract.breachDetection.result.potentialBreaches
      const breachExists = contract.breachDetection?.result?.potentialBreaches?.some(
        b => b.toLowerCase().includes(rule.conditionText.toLowerCase().split(" ")[0]) // Very naive check
      );

      if (breachExists || rules.length > 0) { // For demo, calculate if any rule exists or a "breach"
        let penaltyAmount = 0;
        if (rule.penaltyType === 'fixed') {
          penaltyAmount = rule.amount || 0;
        } else if (rule.penaltyType === 'percentage') {
          // This needs a base amount from contract.extractedData - highly simplified
          const baseAmount = parseFloat(contract.extractedData?.financialTerms?.match(/(\d[\d,.]*)/)?.[0].replace(/,/g, '') || "10000"); // Default to 10000 if not found
          penaltyAmount = (baseAmount * (rule.percentage || 0)) / 100;
        }
        
        if (penaltyAmount > 0) {
           newPenalties.push({
            id: crypto.randomUUID(),
            description: rule.conditionText || "Calculated Penalty",
            amount: penaltyAmount,
            currency: "USD", // Default currency
           });
        }
      }
    });
    
    // If no specific rules applied but general breaches exist, add a generic penalty item
    if (newPenalties.length === 0 && contract.breachDetection?.result?.potentialBreaches?.length ?? 0 > 0) {
        newPenalties.push({
            id: crypto.randomUUID(),
            description: "General penalty for detected breaches",
            amount: 100, // Default placeholder
            currency: "USD",
        });
    }


    setCalculatedPenalties(newPenalties);
    updateContract(contract.id, { penalties: newPenalties });
    toast({ title: "Penalties Calculated", description: `${newPenalties.length} penalties identified.` });
    setIsLoading(false);
  };


  return (
    <Card className="mt-6 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary" /> Penalty Calculator</CardTitle>
        <CardDescription>Define rules to calculate potential penalties based on contract terms and identified breaches.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <Card key={rule.id} className="p-4 bg-secondary/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <Label htmlFor={`condition-${index}`}>Condition Description</Label>
                  <Input id={`condition-${index}`} value={rule.conditionText} onChange={e => handleRuleChange(rule.id, 'conditionText', e.target.value)} placeholder="e.g., Late payment fee" />
                </FormItem>
                <FormItem>
                  <Label htmlFor={`type-${index}`}>Penalty Type</Label>
                  <select id={`type-${index}`} value={rule.penaltyType} onChange={e => handleRuleChange(rule.id, 'penaltyType', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="fixed">Fixed Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </FormItem>
                {rule.penaltyType === 'fixed' && (
                  <FormItem>
                    <Label htmlFor={`amount-${index}`}>Amount (USD)</Label>
                    <Input id={`amount-${index}`} type="number" value={rule.amount} onChange={e => handleRuleChange(rule.id, 'amount', parseFloat(e.target.value))} />
                  </FormItem>
                )}
                {rule.penaltyType === 'percentage' && (
                  <>
                    <FormItem>
                      <Label htmlFor={`percentage-${index}`}>Percentage (%)</Label>
                      <Input id={`percentage-${index}`} type="number" value={rule.percentage} onChange={e => handleRuleChange(rule.id, 'percentage', parseFloat(e.target.value))} />
                    </FormItem>
                     <FormItem>
                      <Label htmlFor={`appliesTo-${index}`}>Applies To (Field/Value)</Label>
                      <Input id={`appliesTo-${index}`} value={rule.appliesToField} onChange={e => handleRuleChange(rule.id, 'appliesToField', e.target.value)} placeholder="e.g., total_contract_value" />
                    </FormItem>
                  </>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleRemoveRule(rule.id)} className="mt-2 text-destructive hover:text-destructive-foreground hover:bg-destructive">
                <Trash2 className="mr-1 h-4 w-4" /> Remove Rule
              </Button>
            </Card>
          ))}
          <Button variant="outline" onClick={handleAddRule} disabled={isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Penalty Rule
          </Button>
        </div>

        <Button onClick={applyRulesAndCalculate} className="mt-6 w-full" disabled={isLoading || rules.length === 0 && !contract.breachDetection?.result?.potentialBreaches?.length}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
          Calculate Penalties
        </Button>

        {calculatedPenalties.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2 text-lg">Calculated Penalties:</h4>
            <ul className="space-y-2">
              {calculatedPenalties.map(penalty => (
                <li key={penalty.id} className="p-3 border rounded-md bg-background flex justify-between items-center">
                  <span>{penalty.description}</span>
                  <span className="font-semibold text-destructive">{penalty.amount.toLocaleString(undefined, { style: 'currency', currency: penalty.currency })}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
         {(rules.length > 0 || contract.breachDetection?.result?.potentialBreaches?.length) && calculatedPenalties.length === 0 && !isLoading && (
          <p className="mt-4 text-muted-foreground text-center">No penalties calculated based on current rules and data.</p>
        )}
      </CardContent>
    </Card>
  );
}

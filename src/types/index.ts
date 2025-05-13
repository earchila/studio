import type { ImproveOcrAccuracyOutput } from "@/ai/flows/improve-ocr-accuracy";
import type { ExtractContractDataOutput } from "@/ai/flows/extract-contract-data";
import type { DetermineDataExtractionQualityOutput } from "@/ai/flows/determine-data-extraction-quality";
import type { DetectPotentialBreachesOutput } from "@/ai/flows/detect-potential-breaches";

export interface ContractDocument {
  id: string;
  name: string;
  uploadedAt: string; // ISO date string
  originalText?: string;
  layoutDescription?: string;
  ocrImproved?: ImproveOcrAccuracyOutput;
  extractedData?: ExtractContractDataOutput;
  qualityAssessment?: DetermineDataExtractionQualityOutput;
  breachDetection?: {
    conditions: string; // JSON string of conditions
    result?: DetectPotentialBreachesOutput;
  };
  penalties?: CalculatedPenalty[];
  alerts?: ContractAlert[];
  status: "new" | "processing" | "analyzed" | "error";
}

export interface CalculatedPenalty {
  id: string;
  description: string;
  amount: number;
  currency: string;
  breachId?: string; // Link to a specific breach
}

export interface ContractAlert {
  id: string;
  type: "expiration" | "payment_due" | "custom";
  message: string;
  dueDate?: string; // ISO date string
  severity: "low" | "medium" | "high";
  triggeredAt?: string; // ISO date string
  acknowledged: boolean;
}

export interface BreachConditionRule {
  field: keyof ExtractContractDataOutput; // e.g., "effectiveDate", "financialTerms"
  operator: "exists" | "not_exists" | "contains" | "not_contains" | "equals" | "greater_than" | "less_than";
  value?: string | number | boolean;
  description: string; // Description of what this rule checks for
}

import type { ContractDocument } from "@/types";

function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }
  return stringValue;
}

export function exportContractToCsv(contract: ContractDocument): void {
  const headers = [
    "ID", "Name", "Uploaded At", "Status",
    "OCR Improved Text", "Layout Assessment",
    "Extracted Summary", "Effective Date", "Expiration Date", "Parties Involved", "Financial Terms", "Conditions", "Breach Clauses", "Termination Clauses",
    "Quality Score", "Confidence Level", "Is Complete", "Quality Justification",
    "Breach Detection Conditions", "Potential Breaches", "Breach Summary",
    "Penalties", "Alerts"
  ];

  const dataRow = [
    escapeCsvValue(contract.id),
    escapeCsvValue(contract.name),
    escapeCsvValue(contract.uploadedAt),
    escapeCsvValue(contract.status),
    escapeCsvValue(contract.ocrImproved?.improvedOcrText),
    escapeCsvValue(contract.ocrImproved?.layoutAssessment),
    escapeCsvValue(contract.extractedData?.contractSummary),
    escapeCsvValue(contract.extractedData?.effectiveDate),
    escapeCsvValue(contract.extractedData?.expirationDate),
    escapeCsvValue(contract.extractedData?.partiesInvolved?.join('; ')),
    escapeCsvValue(contract.extractedData?.financialTerms),
    escapeCsvValue(contract.extractedData?.conditions?.join('; ')),
    escapeCsvValue(contract.extractedData?.breachClauses?.join('; ')),
    escapeCsvValue(contract.extractedData?.terminationClauses?.join('; ')),
    escapeCsvValue(contract.qualityAssessment?.qualityScore),
    escapeCsvValue(contract.qualityAssessment?.confidenceLevel),
    escapeCsvValue(contract.qualityAssessment?.isComplete),
    escapeCsvValue(contract.qualityAssessment?.justification),
    escapeCsvValue(contract.breachDetection?.conditions),
    escapeCsvValue(contract.breachDetection?.result?.potentialBreaches?.join('; ')),
    escapeCsvValue(contract.breachDetection?.result?.summary),
    escapeCsvValue(contract.penalties?.map(p => `${p.description}: ${p.amount} ${p.currency}`).join('; ')),
    escapeCsvValue(contract.alerts?.map(a => `${a.type} - ${a.message}`).join('; '))
  ];

  const csvContent = [
    headers.join(','),
    dataRow.join(',')
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${contract.name.replace(/\s+/g, '_')}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

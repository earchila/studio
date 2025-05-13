'use client';

import type { ContractDocument } from '@/types';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportContractToCsv } from '@/lib/csvHelper';
import { useToast } from '@/hooks/use-toast';

interface DataExportButtonProps {
  contract: ContractDocument;
  className?: string;
}

export function DataExportButton({ contract, className }: DataExportButtonProps) {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      exportContractToCsv(contract);
      toast({
        title: "Export Successful",
        description: `Data for "${contract.name}" has been exported to CSV.`,
      });
    } catch (error) {
      console.error("CSV Export Error:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting data.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} className={className}>
      <Download className="mr-2 h-4 w-4" />
      Export to CSV
    </Button>
  );
}

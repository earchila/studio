import Link from 'next/link';
import type { ContractDocument } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ContractCardProps {
  contract: ContractDocument;
}

export function ContractCard({ contract }: ContractCardProps) {
  const getStatusInfo = () => {
    switch (contract.status) {
      case 'new':
        return { icon: FileText, color: 'bg-blue-500', text: 'New' };
      case 'processing':
        return { icon: Activity, color: 'bg-yellow-500', text: 'Processing' };
      case 'analyzed':
        return { icon: CheckCircle, color: 'bg-green-500', text: 'Analyzed' };
      case 'error':
        return { icon: AlertTriangle, color: 'bg-red-500', text: 'Error' };
      default:
        return { icon: FileText, color: 'bg-gray-500', text: 'Unknown' };
    }
  };

  const statusInfo = getStatusInfo();
  const qualityScore = contract.qualityAssessment?.qualityScore ?? 0;
  const parties = contract.extractedData?.partiesInvolved?.join(', ') || 'N/A';

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-primary mb-1 leading-tight">
            {contract.name}
          </CardTitle>
          <Badge variant="outline" className={`border-${statusInfo.text.toLowerCase()}-500 text-${statusInfo.text.toLowerCase()}-700 dark:text-${statusInfo.text.toLowerCase()}-400`}>
            <statusInfo.icon className={`mr-1 h-3 w-3 text-${statusInfo.text.toLowerCase()}-500`} />
            {statusInfo.text}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Uploaded: {new Date(contract.uploadedAt).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm">
          <div>
            <strong>Parties:</strong> <span className="text-muted-foreground">{parties}</span>
          </div>
          {contract.extractedData?.effectiveDate && (
            <div>
              <strong>Effective Date:</strong> <span className="text-muted-foreground">{new Date(contract.extractedData.effectiveDate).toLocaleDateString()}</span>
            </div>
          )}
          {contract.extractedData?.expirationDate && (
            <div>
              <strong>Expiration Date:</strong> <span className="text-muted-foreground">{new Date(contract.extractedData.expirationDate).toLocaleDateString()}</span>
            </div>
          )}
          {contract.qualityAssessment && (
             <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Data Quality</span>
                <span>{(qualityScore * 100).toFixed(0)}%</span>
              </div>
              <Progress value={qualityScore * 100} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/contracts/${contract.id}`} passHref legacyBehavior>
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

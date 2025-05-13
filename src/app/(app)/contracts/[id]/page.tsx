'use client';

import { useParams } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { ContractDetailsView } from '@/components/contract/ContractDetailsView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ContractDetailPage() {
  const params = useParams();
  const { getContractById, isLoading } = useAppContext();
  
  // Ensure params.id is a string. If it's an array, take the first element.
  const contractId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const contract = contractId ? getContractById(contractId) : undefined;

  if (isLoading && !contract) { // Show loader only if contract is not yet loaded
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="ml-2 text-muted-foreground">Loading contract details...</p>
      </div>
    );
  }
  
  if (!contract) {
    return (
      <Card className="max-w-lg mx-auto mt-10 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-6 w-6" /> Contract Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The contract you are looking for does not exist or could not be loaded. 
            It might have been removed or there was an issue retrieving its details.
          </p>
          <Link href="/contracts" passHref>
            <Button variant="outline" className="mt-4 w-full">
              Back to Contracts List
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <ContractDetailsView contract={contract} />;
}

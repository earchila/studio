'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { ContractCard } from '@/components/contract/ContractCard';
import { useAppContext } from '@/contexts/AppContext';
import { PlusCircle, ListFilter, Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';

export default function ContractsPage() {
  const { contracts } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredContracts = contracts
    .filter(contract => 
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.extractedData?.partiesInvolved?.some(party => party.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .filter(contract => statusFilter === 'all' || contract.status === statusFilter);

  return (
    <>
      <PageHeader
        title="Contracts Management"
        description="Browse, analyze, and manage all your legal contracts."
        actions={
          <Link href="/contracts/add" passHref>
            <Button>
              <PlusCircle className="mr-2" /> Add New Contract
            </Button>
          </Link>
        }
      />
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search contracts by name or party..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <ListFilter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="analyzed">Analyzed</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredContracts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredContracts.map((contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">No contracts found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {contracts.length === 0 ? "Upload your first contract to get started." : "Try adjusting your search or filter criteria."}
          </p>
          {contracts.length === 0 && (
            <Link href="/contracts/add" passHref>
            <Button className="mt-4">
              <PlusCircle className="mr-2" /> Add New Contract
            </Button>
          </Link>
          )}
        </div>
      )}
    </>
  );
}

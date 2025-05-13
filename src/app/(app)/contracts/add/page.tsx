'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { ContractForm } from '@/components/contract/ContractForm';

export default function AddContractPage() {
  return (
    <>
      <PageHeader
        title="Add New Contract"
        description="Upload and analyze a new contract document."
      />
      <ContractForm />
    </>
  );
}

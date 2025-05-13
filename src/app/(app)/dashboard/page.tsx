
'use client';

import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileText, DollarSign, ArrowRight, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppContext } from '@/contexts/AppContext';

export default function DashboardPage() {
  const { contracts, alerts } = useAppContext();

  const activeAlerts = alerts.filter(alert => !alert.acknowledged).length;
  const totalContracts = contracts.length;
  // Placeholder for total potential penalties
  const totalPenaltiesValue = contracts.reduce((sum, contract) => {
    return sum + (contract.penalties?.reduce((penaltySum, p) => penaltySum + p.amount, 0) || 0);
  }, 0);


  const summaryStats = [
    { title: 'Total Contracts', value: totalContracts, icon: FileText, color: 'text-primary' },
    { title: 'Active Alerts', value: activeAlerts, icon: AlertTriangle, color: 'text-destructive' },
    { title: 'Potential Penalties', value: `$${totalPenaltiesValue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600' },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome to LegalMind. Get an overview of your contract landscape."
        actions={
          <Link href="/contracts/add" passHref>
            <Button>
              <PlusCircle className="mr-2" /> Add New Contract
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {summaryStats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              {/* <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p> */}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-1"> {/* Changed lg:grid-cols-2 to lg:grid-cols-1 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            {contracts.slice(0, 3).map((contract) => (
              <Link href={`/contracts/${contract.id}`} key={contract.id} className="block mb-4 p-3 rounded-lg hover:bg-secondary transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-primary">{contract.name}</h3>
                    <p className="text-sm text-muted-foreground">Uploaded: {new Date(contract.uploadedAt).toLocaleDateString()}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))}
            {contracts.length === 0 && <p className="text-muted-foreground">No contracts uploaded yet.</p>}
             {contracts.length > 3 && (
              <Link href="/contracts" passHref>
                <Button variant="outline" className="w-full mt-2">View All Contracts</Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Removed Key Features Card */}
      </div>
    </>
  );
}

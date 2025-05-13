'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, CheckCircle, CalendarClock, ListFilter } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import type { ContractAlert, ContractDocument } from '@/types';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AlertsPage() {
  const { contracts, alerts: globalAlerts, updateAlert, isLoading, setIsLoading } = useAppContext();
  const [combinedAlerts, setCombinedAlerts] = useState<Array<ContractAlert & { contractId?: string, contractName?: string }>>([]);
  const [filterSeverity, setFilterSeverity] = useState<"all" | ContractAlert['severity']>("all");
  const [filterAcknowledged, setFilterAcknowledged] = useState<"all" | "yes" | "no">("all");


  useEffect(() => {
    const generateContractSpecificAlerts = (): Array<ContractAlert & { contractId?: string, contractName?: string }> => {
      const newAlerts: Array<ContractAlert & { contractId?: string, contractName?: string }> = [];
      contracts.forEach(contract => {
        // Check for expiration alerts
        if (contract.extractedData?.expirationDate) {
          const expirationDate = new Date(contract.extractedData.expirationDate);
          const thirtyDaysBefore = new Date(expirationDate);
          thirtyDaysBefore.setDate(expirationDate.getDate() - 30);
          const today = new Date();

          if (today >= thirtyDaysBefore && today <= expirationDate) {
            const existingAlert = contract.alerts?.find(a => a.type === 'expiration' && a.dueDate === expirationDate.toISOString());
            if (!existingAlert) {
              newAlerts.push({
                id: crypto.randomUUID(),
                type: 'expiration',
                message: `Contract "${contract.name}" is expiring soon.`,
                dueDate: expirationDate.toISOString(),
                severity: 'high',
                acknowledged: false,
                contractId: contract.id,
                contractName: contract.name,
              });
            }
          }
        }
        // Add other rule-based alert generation here (e.g., payment deadlines)
        // For example, if a "payment_due" field exists in extractedData:
        // if (contract.extractedData?.paymentDueDate) { ... }
        
        // Include existing alerts from the contract object
        if(contract.alerts) {
            newAlerts.push(...contract.alerts.map(a => ({...a, contractId: contract.id, contractName: contract.name})));
        }
      });
      return newAlerts;
    };
    
    const contractSpecificAlerts = generateContractSpecificAlerts();
    // Combine with global alerts, ensuring no duplicates by ID if globalAlerts could contain contract-specific ones.
    // For this setup, assume globalAlerts are distinct or managed elsewhere.
    const allAlerts = [...globalAlerts.map(a => ({...a})), ...contractSpecificAlerts];
    
    // Deduplicate alerts by ID, preferring newer ones if timestamps were available
    const uniqueAlerts = Array.from(new Map(allAlerts.map(alert => [alert.id, alert])).values());
    
    setCombinedAlerts(uniqueAlerts);

  }, [contracts, globalAlerts]);

  const handleAcknowledge = (alertId: string) => {
    setIsLoading(true);
    const alertToUpdate = combinedAlerts.find(a => a.id === alertId);
    if (alertToUpdate) {
      const updatedAlert = { ...alertToUpdate, acknowledged: true };
      if (alertToUpdate.contractId) {
        const contract = contracts.find(c => c.id === alertToUpdate.contractId);
        if (contract) {
          const updatedContractAlerts = contract.alerts?.map(a => a.id === alertId ? updatedAlert : a) || [updatedAlert];
          // This updateContract needs to be careful not to overwrite other parts of the contract.
          // It's better if updateContract can path-update `alerts`.
          // For now, it's a full replace of alerts array in the contract.
          const contractToUpdate = contracts.find(c=> c.id === alertToUpdate.contractId);
          if(contractToUpdate) {
            const currentAlerts = contractToUpdate.alerts ? [...contractToUpdate.alerts] : [];
            const existingAlertIndex = currentAlerts.findIndex(a => a.id === alertId);
            if (existingAlertIndex > -1) {
                currentAlerts[existingAlertIndex] = { ...currentAlerts[existingAlertIndex], acknowledged: true };
            } else {
                // This case should not happen if alert originated from contract
            }
             // Update contract in context
            // updateContract(alertToUpdate.contractId, { alerts: updatedContractAlerts });
          }
        }
      } else {
         // updateAlert(alertId, { acknowledged: true }); // For global alerts
      }
      // Update local state for immediate UI feedback
      setCombinedAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    }
    setIsLoading(false);
  };

  const getSeverityBadge = (severity: ContractAlert['severity']) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary'; // consider a yellow/orange like color
      case 'low': return 'outline';
      default: return 'default';
    }
  };
  
  const filteredAndSortedAlerts = combinedAlerts
    .filter(alert => filterSeverity === "all" || alert.severity === filterSeverity)
    .filter(alert => filterAcknowledged === "all" || (filterAcknowledged === "yes" && alert.acknowledged) || (filterAcknowledged === "no" && !alert.acknowledged))
    .sort((a, b) => (a.acknowledged ? 1 : -1) - (b.acknowledged ? 1 : -1) || (new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime()));


  return (
    <>
      <PageHeader
        title="Alerts Dashboard"
        description="Monitor critical contract events and potential issues."
      />
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Select value={filterSeverity} onValueChange={(value) => setFilterSeverity(value as any)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <ListFilter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterAcknowledged} onValueChange={(value) => setFilterAcknowledged(value as any)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <ListFilter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="no">Unacknowledged</SelectItem>
            <SelectItem value="yes">Acknowledged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAndSortedAlerts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedAlerts.map((alert) => (
            <Card key={alert.id} className={`shadow-lg ${alert.acknowledged ? 'opacity-60 bg-secondary/30' : 'bg-card hover:shadow-xl transition-shadow'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    {alert.severity === 'high' && <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />}
                    {alert.severity === 'medium' && <Bell className="mr-2 h-5 w-5 text-yellow-500" />}
                    {alert.severity === 'low' && <InfoIcon className="mr-2 h-5 w-5 text-blue-500" />}
                     {alert.contractName ? (
                        <Link href={`/contracts/${alert.contractId}`} className="hover:underline text-primary">
                          {alert.contractName}
                        </Link>
                      ) : (
                        'System Alert'
                      )}
                  </CardTitle>
                  <Badge variant={getSeverityBadge(alert.severity)} className="capitalize">{alert.severity}</Badge>
                </div>
                <CardDescription className="text-sm">{alert.message}</CardDescription>
              </CardHeader>
              <CardContent>
                {alert.dueDate && (
                  <p className="text-xs text-muted-foreground flex items-center">
                    <CalendarClock className="mr-1 h-3 w-3" />
                    Due: {new Date(alert.dueDate).toLocaleDateString()}
                  </p>
                )}
                {alert.triggeredAt && (
                   <p className="text-xs text-muted-foreground">Triggered: {new Date(alert.triggeredAt).toLocaleDateString()}</p>
                )}
              </CardContent>
              <CardFooter>
                {!alert.acknowledged ? (
                  <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)} className="w-full" disabled={isLoading}>
                    <CheckCircle className="mr-2 h-4 w-4" /> Acknowledge
                  </Button>
                ) : (
                  <p className="text-xs text-green-600 flex items-center w-full justify-center">
                    <CheckCircle className="mr-1 h-4 w-4" /> Acknowledged
                  </p>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-xl font-semibold">No Alerts</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {combinedAlerts.length === 0 ? "There are currently no alerts." : "No alerts match your current filter criteria."}
          </p>
        </div>
      )}
    </>
  );
}

// Placeholder for InfoIcon if not available in lucide-react (it is)
const InfoIcon = ({className}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;


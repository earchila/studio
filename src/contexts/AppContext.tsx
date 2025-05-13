'use client';

import type { ContractDocument, ContractAlert } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface AppContextType {
  contracts: ContractDocument[];
  alerts: ContractAlert[];
  addContract: (contract: ContractDocument) => void;
  updateContract: (contractId: string, updates: Partial<ContractDocument>) => void;
  getContractById: (contractId: string) => ContractDocument | undefined;
  addAlert: (alert: ContractAlert) => void;
  updateAlert: (alertId: string, updates: Partial<ContractAlert>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [contracts, setContracts] = useState<ContractDocument[]>([]);
  const [alerts, setAlerts] = useState<ContractAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addContract = useCallback((contract: ContractDocument) => {
    setContracts((prevContracts) => [...prevContracts, contract]);
  }, []);

  const updateContract = useCallback((contractId: string, updates: Partial<ContractDocument>) => {
    setContracts((prevContracts) =>
      prevContracts.map((c) => (c.id === contractId ? { ...c, ...updates } : c))
    );
  }, []);

  const getContractById = useCallback((contractId: string) => {
    return contracts.find(c => c.id === contractId);
  }, [contracts]);

  const addAlert = useCallback((alert: ContractAlert) => {
    setAlerts((prevAlerts) => [...prevAlerts, alert]);
  }, []);
  
  const updateAlert = useCallback((alertId: string, updates: Partial<ContractAlert>) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((a) => (a.id === alertId ? { ...a, ...updates } : a))
    );
  }, []);

  return (
    <AppContext.Provider value={{ 
      contracts, 
      alerts, 
      addContract, 
      updateContract, 
      getContractById,
      addAlert,
      updateAlert,
      isLoading,
      setIsLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

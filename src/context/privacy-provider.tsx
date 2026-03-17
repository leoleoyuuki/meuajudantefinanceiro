'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';

interface PrivacyContextType {
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const toggleBalanceVisibility = useCallback(() => {
    setIsBalanceVisible((prev) => !prev);
  }, []);

  const value = useMemo(() => ({
    isBalanceVisible,
    toggleBalanceVisibility
  }), [isBalanceVisible, toggleBalanceVisibility]);

  return (
    <PrivacyContext.Provider value={value}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}

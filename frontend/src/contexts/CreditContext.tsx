import React, { createContext, useContext } from 'react';

// Simplified CreditContext - No credit system for this app
interface CreditContextType {
  credits: number;
  loading: boolean;
}

const CreditContext = createContext<CreditContextType>({
  credits: 999999,
  loading: false,
});

export const useCredits = () => useContext(CreditContext);

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CreditContext.Provider value={{ credits: 999999, loading: false }}>
      {children}
    </CreditContext.Provider>
  );
};

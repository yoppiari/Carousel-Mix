import React, { createContext, useContext } from 'react';

// Simplified AuthContext - No authentication needed for this app
interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: true,
  user: { id: 'local-user', email: 'user@local' },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthContext.Provider value={{ isAuthenticated: true, user: { id: 'local-user', email: 'user@local' } }}>
      {children}
    </AuthContext.Provider>
  );
};

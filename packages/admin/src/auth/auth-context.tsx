import { createContext, useContext, type ReactNode } from 'react';
import { authClient } from './auth-client';

interface AuthContextValue {
  session: ReturnType<typeof authClient.useSession>['data'];
  isLoading: boolean;
  error: ReturnType<typeof authClient.useSession>['error'];
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error, refetch } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut();
  };

  const refreshSession = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading: isPending,
        error,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

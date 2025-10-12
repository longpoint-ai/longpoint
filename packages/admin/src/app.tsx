import { Toaster } from '@longpoint/ui/components/sonner';
import { AuthProvider } from './auth/auth-context';
import { AppRoutes } from './router';

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  );
}

export default App;

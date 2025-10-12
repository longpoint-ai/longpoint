import { Toaster } from '@longpoint/ui/components/sonner';
import { AuthProvider } from './lib/auth/auth-context';
import { AppRoutes } from './routes';

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  );
}

export default App;

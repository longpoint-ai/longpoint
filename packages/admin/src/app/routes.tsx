import { Route, Routes } from 'react-router-dom';
import { AuthLayout } from './layouts/auth-layout';
import { DashboardLayout } from './layouts/dashboard-layout';
import {
  AuthGuard,
  AuthenticatedGuard,
  SetupCompleteGuard,
  SetupGuard,
} from './lib/guards/route-guards';
import { SignIn } from './pages/auth/sign-in';
import { DashboardHome } from './pages/dashboard/home';
import { FirstAdminSetup } from './pages/setup/first-admin';

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/setup"
        element={
          <SetupCompleteGuard>
            <AuthLayout>
              <FirstAdminSetup />
            </AuthLayout>
          </SetupCompleteGuard>
        }
      />
      <Route
        path="/sign-in"
        element={
          <AuthenticatedGuard>
            <SetupGuard>
              <AuthLayout>
                <SignIn />
              </AuthLayout>
            </SetupGuard>
          </AuthenticatedGuard>
        }
      />
      <Route
        path="/"
        element={
          <SetupGuard>
            <AuthGuard>
              <DashboardLayout>
                <DashboardHome />
              </DashboardLayout>
            </AuthGuard>
          </SetupGuard>
        }
      />
    </Routes>
  );
}

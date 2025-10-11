import { Routes, Route } from 'react-router-dom';
import { SetupLayout } from './layouts/setup-layout';
import { DashboardLayout } from './layouts/dashboard-layout';
import { FirstAdminSetup } from './pages/setup/first-admin';
import { DashboardHome } from './pages/dashboard/home';

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/setup"
        element={
          <SetupLayout>
            <FirstAdminSetup />
          </SetupLayout>
        }
      />
      <Route
        path="/"
        element={
          <DashboardLayout>
            <DashboardHome />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

import { Route, Routes } from 'react-router-dom';
import { AuthLayout } from '../layouts/auth-layout';
import { DashboardLayout } from '../layouts/dashboard-layout';
import { SignIn } from '../pages/auth/sign-in';
import { Classifiers } from '../pages/dashboard/classifiers';
import { CreateClassifier } from '../pages/dashboard/classifiers/create';
import { ClassifierDetail } from '../pages/dashboard/classifiers/detail';
import { DashboardHome } from '../pages/dashboard/home';
import { Library } from '../pages/dashboard/library';
import { MediaDetail } from '../pages/dashboard/media-detail';
import { Settings } from '../pages/dashboard/settings';
import { FirstAdminSetup } from '../pages/setup/first-admin';
import {
  AuthGuard,
  AuthenticatedGuard,
  SetupCompleteGuard,
  SetupGuard,
} from './guards';

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
      <Route
        path="/library"
        element={
          <SetupGuard>
            <AuthGuard>
              <DashboardLayout>
                <Library />
              </DashboardLayout>
            </AuthGuard>
          </SetupGuard>
        }
      />
      <Route
        path="/media/:id"
        element={
          <SetupGuard>
            <AuthGuard>
              <DashboardLayout>
                <MediaDetail />
              </DashboardLayout>
            </AuthGuard>
          </SetupGuard>
        }
      />
      <Route
        path="/settings"
        element={
          <SetupGuard>
            <AuthGuard>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </AuthGuard>
          </SetupGuard>
        }
      />
      <Route
        path="/classifiers"
        element={
          <SetupGuard>
            <AuthGuard>
              <DashboardLayout>
                <Classifiers />
              </DashboardLayout>
            </AuthGuard>
          </SetupGuard>
        }
      />
      <Route
        path="/classifiers/create"
        element={
          <SetupGuard>
            <AuthGuard>
              <DashboardLayout>
                <CreateClassifier />
              </DashboardLayout>
            </AuthGuard>
          </SetupGuard>
        }
      />
      <Route
        path="/classifiers/:classifierId"
        element={
          <SetupGuard>
            <AuthGuard>
              <DashboardLayout>
                <ClassifierDetail />
              </DashboardLayout>
            </AuthGuard>
          </SetupGuard>
        }
      />
    </Routes>
  );
}

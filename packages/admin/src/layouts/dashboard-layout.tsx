import { AppSidebar } from '@/components/app-sidebar';
import { UploadDialog } from '@/components/upload-dialog';
import { UploadProvider } from '@/contexts/upload-context';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@longpoint/ui/components/sidebar';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Longpoint Admin</h1>
        </div>
      </header> */}
      <UploadProvider>
        <SidebarProvider>
          <AppSidebar />
          <main>
            <SidebarTrigger />
            <div className="px-4 ">{children}</div>
          </main>
        </SidebarProvider>
        <UploadDialog />
      </UploadProvider>
    </div>
  );
}

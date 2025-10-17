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
      <UploadProvider>
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1">
            <div className="flex items-center gap-2 p-4 border-b">
              <SidebarTrigger className="h-8 w-8" />
            </div>
            <div className="container mx-auto px-6 py-8 max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarProvider>
        <UploadDialog />
      </UploadProvider>
    </div>
  );
}

import { AppSidebar } from '@/components/app-sidebar';
import { SearchBar } from '@/components/search-bar';
import { UploadDialog } from '@/components/upload-dialog';
import { UploadProvider } from '@/contexts/upload-context';
import { useSearchStatus } from '@/hooks/domain/use-search-status';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@longpoint/ui/components/sidebar';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isSearchSetup, isLoading: isSearchStatusLoading } = useSearchStatus();

  return (
    <div className="min-h-screen bg-background">
      <UploadProvider>
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1">
            <div className="flex items-center gap-2 p-4 border-b">
              <SidebarTrigger className="h-8 w-8" />
              {!isSearchStatusLoading && isSearchSetup && <SearchBar />}
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

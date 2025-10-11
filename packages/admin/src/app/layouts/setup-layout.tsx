import { ReactNode } from 'react';

interface SetupLayoutProps {
  children: ReactNode;
}

export function SetupLayout({ children }: SetupLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

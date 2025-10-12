import { apiClient } from '@/lib/api-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@longpoint/ui/components/card';
import { useEffect, useState } from 'react';

export function DashboardHome() {
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  useEffect(() => {
    console.log('fetching setup status');
    apiClient.GET('/setup/status').then(({ data }) => {
      setIsFirstTimeSetup(data?.isFirstTimeSetup ?? true);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Welcome to your Longpoint admin dashboard
        </p>
      </div>
      {isFirstTimeSetup && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Required</CardTitle>
            <CardDescription>
              Please create your first administrator account to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Setup Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your administrator account has been successfully created. You can
            now manage your Longpoint instance from this dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

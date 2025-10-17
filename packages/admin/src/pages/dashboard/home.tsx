import { useAuth } from '@/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@longpoint/ui/components/card';

export function DashboardHome() {
  const { session } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Welcome back, {session?.user?.name || session?.user?.email}!
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Longpoint</CardTitle>
          <CardDescription>
            Your administrator account is set up and ready to go.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You can now manage your Longpoint instance from this dashboard. All
            features are available and your account is fully configured.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

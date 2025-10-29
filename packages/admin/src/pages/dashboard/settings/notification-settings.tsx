import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@longpoint/ui/components/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@longpoint/ui/components/field';
import { Input } from '@longpoint/ui/components/input';
import { Switch } from '@longpoint/ui/components/switch';

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Configure notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FieldGroup>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="email-notifications">
              Email Notifications
            </FieldLabel>
            <Switch id="email-notifications" defaultChecked />
            <FieldDescription>Receive notifications via email</FieldDescription>
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="system-alerts">System Alerts</FieldLabel>
            <Switch id="system-alerts" defaultChecked />
            <FieldDescription>
              Show system alerts in the dashboard
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="notification-email">
              Notification Email
            </FieldLabel>
            <Input
              id="notification-email"
              type="email"
              placeholder="admin@example.com"
            />
            <FieldDescription>
              Email address for system notifications
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

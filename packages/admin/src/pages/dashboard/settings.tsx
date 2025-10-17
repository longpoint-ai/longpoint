import { Button } from '@longpoint/ui/components/button';
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
import { RefreshCwIcon, SaveIcon } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-muted-foreground mt-2">
            Configure your Longpoint instance and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Basic configuration for your instance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="site-name">Site Name</FieldLabel>
                <Input
                  id="site-name"
                  placeholder="My Longpoint Site"
                  defaultValue="Longpoint Admin"
                />
                <FieldDescription>
                  The name that will be displayed across your site
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="site-description">
                  Site Description
                </FieldLabel>
                <Input
                  id="site-description"
                  placeholder="A brief description of your site"
                  defaultValue="Administrative dashboard for Longpoint"
                />
                <FieldDescription>
                  A brief description of your site's purpose
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media Settings</CardTitle>
            <CardDescription>
              Configure media upload and storage options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="auto-resize">
                  Auto-resize Images
                </FieldLabel>
                <Switch id="auto-resize" defaultChecked />
                <FieldDescription>
                  Automatically resize large images on upload
                </FieldDescription>
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="watermark">Add Watermark</FieldLabel>
                <Switch id="watermark" />
                <FieldDescription>
                  Add watermark to uploaded images
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="max-file-size">
                  Max File Size (MB)
                </FieldLabel>
                <Input
                  id="max-file-size"
                  type="number"
                  placeholder="10"
                  defaultValue="10"
                />
                <FieldDescription>
                  Maximum file size allowed for uploads
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Configure security and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="two-factor">
                  Two-Factor Authentication
                </FieldLabel>
                <Switch id="two-factor" />
                <FieldDescription>
                  Require 2FA for all admin accounts
                </FieldDescription>
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="session-timeout">
                  Session Timeout
                </FieldLabel>
                <Switch id="session-timeout" defaultChecked />
                <FieldDescription>
                  Automatically log out inactive users
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="session-duration">
                  Session Duration (hours)
                </FieldLabel>
                <Input
                  id="session-duration"
                  type="number"
                  placeholder="24"
                  defaultValue="24"
                />
                <FieldDescription>
                  How long user sessions should last
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="email-notifications">
                  Email Notifications
                </FieldLabel>
                <Switch id="email-notifications" defaultChecked />
                <FieldDescription>
                  Receive notifications via email
                </FieldDescription>
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
      </div>
    </div>
  );
}

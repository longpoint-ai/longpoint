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
export function GeneralSettings() {
  return (
    <div>
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
    </div>
  );
}

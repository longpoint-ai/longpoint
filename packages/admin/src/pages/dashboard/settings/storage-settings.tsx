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

export function StorageSettings() {
  return (
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
            <FieldLabel htmlFor="auto-resize">Auto-resize Images</FieldLabel>
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
            <FieldLabel htmlFor="max-file-size">Max File Size (MB)</FieldLabel>
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
  );
}

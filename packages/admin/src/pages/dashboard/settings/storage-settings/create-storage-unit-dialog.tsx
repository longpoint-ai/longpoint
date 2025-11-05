import {
  ConfigSchemaForm,
  getDefaultValueForType,
} from '@/components/config-schema';
import { useClient } from '@/hooks/common/use-client';
import { STORAGE_PROVIDER_CONFIG_SCHEMAS } from '@/utils/storage-provider-schemas';
import { Button } from '@longpoint/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@longpoint/ui/components/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@longpoint/ui/components/field';
import { Input } from '@longpoint/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@longpoint/ui/components/select';
import { Switch } from '@longpoint/ui/components/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  provider: z.enum(['local', 's3', 'gcs', 'azure-blob']),
  isDefault: z.boolean().optional(),
  config: z.record(z.string(), z.any()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateStorageUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStorageUnitDialog({
  open,
  onOpenChange,
}: CreateStorageUnitDialogProps) {
  const client = useClient();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      provider: 'local',
      isDefault: false,
      config: {},
    },
  });

  const selectedProvider = form.watch('provider');
  const configSchema = STORAGE_PROVIDER_CONFIG_SCHEMAS[selectedProvider] || {};

  // Initialize config defaults when provider changes
  React.useEffect(() => {
    const defaults: Record<string, any> = {};
    Object.entries(configSchema).forEach(([key, value]: [string, any]) => {
      defaults[key] = getDefaultValueForType(value);
    });
    form.setValue('config', defaults);
  }, [selectedProvider, form]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return client.media.createStorageUnit({
        name: data.name,
        provider: data.provider,
        isDefault: data.isDefault ?? false,
        config: data.config as any,
      });
    },
    onSuccess: () => {
      toast.success('Storage unit created successfully');
      queryClient.invalidateQueries({ queryKey: ['storage-units'] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to create storage unit', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createMutation.mutate(data);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Storage Unit</DialogTitle>
          <DialogDescription>
            Create a new storage unit to store your media containers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="storage-unit-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="storage-unit-name"
                    placeholder="My Storage Unit"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="provider"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="storage-unit-provider">
                    Provider
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="storage-unit-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="s3" disabled>
                        S3 (Coming Soon)
                      </SelectItem>
                      <SelectItem value="gcs" disabled>
                        GCS (Coming Soon)
                      </SelectItem>
                      <SelectItem value="azure-blob" disabled>
                        Azure Blob (Coming Soon)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <FieldDescription>
                    Only Local storage is currently supported.
                  </FieldDescription>
                </Field>
              )}
            />

            {Object.keys(configSchema).length > 0 && (
              <ConfigSchemaForm
                schema={configSchema as any}
                control={form.control}
                namePrefix="config"
                setError={form.setError}
              />
            )}

            <Controller
              name="isDefault"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="storage-unit-default">
                    Default Storage Unit
                  </FieldLabel>
                  <Switch
                    id="storage-unit-default"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldDescription>
                    Mark this as the default storage unit for new media
                    containers.
                  </FieldDescription>
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              isLoading={createMutation.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

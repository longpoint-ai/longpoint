import { useClient } from '@/hooks/common/use-client';
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
import { Switch } from '@longpoint/ui/components/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  isDefault: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateStorageUnitSimpleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configId: string;
}

export function CreateStorageUnitSimpleDialog({
  open,
  onOpenChange,
  configId,
}: CreateStorageUnitSimpleDialogProps) {
  const client = useClient();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      isDefault: false,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        isDefault: false,
      });
    }
  }, [open, form]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return client.storage.createStorageUnit({
        name: data.name,
        storageConfigId: configId,
        isDefault: data.isDefault ?? false,
      });
    },
    onSuccess: () => {
      toast.success('Storage unit created successfully');
      queryClient.invalidateQueries({ queryKey: ['storage-units', configId] });
      queryClient.invalidateQueries({
        queryKey: ['storage-provider-config', configId],
      });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Storage Unit</DialogTitle>
          <DialogDescription>
            Create a new storage unit using this configuration.
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

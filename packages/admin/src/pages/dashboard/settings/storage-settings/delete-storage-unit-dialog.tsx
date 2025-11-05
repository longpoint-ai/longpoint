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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

interface DeleteStorageUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storageUnitId: string;
  storageUnitName: string;
}

export function DeleteStorageUnitDialog({
  open,
  onOpenChange,
  storageUnitId,
  storageUnitName,
}: DeleteStorageUnitDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const client = useClient();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => client.media.deleteStorageUnit(storageUnitId),
    onSuccess: () => {
      toast.success('Storage unit deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['storage-units'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error('Failed to delete storage unit', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
      setIsDeleting(false);
    },
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    deleteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Storage Unit</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the storage unit{' '}
            <span className="font-semibold">{storageUnitName}</span>? This
            action cannot be undone. Storage units with media containers cannot
            be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

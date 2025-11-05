import { useClient } from '@/hooks/common/use-client';
import { Button } from '@longpoint/ui/components/button';
import { Card, CardContent, CardHeader } from '@longpoint/ui/components/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@longpoint/ui/components/empty';
import { Skeleton } from '@longpoint/ui/components/skeleton';
import { useQuery } from '@tanstack/react-query';
import { BoxIcon, Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateStorageUnitDialog } from './storage-settings/create-storage-unit-dialog';
import { DeleteStorageUnitDialog } from './storage-settings/delete-storage-unit-dialog';
import { EditStorageUnitDialog } from './storage-settings/edit-storage-unit-dialog';
import { StorageUnitCard } from './storage-settings/storage-unit-card';

export function StorageSettings() {
  const client = useClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStorageUnit, setSelectedStorageUnit] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['storage-units'],
    queryFn: () => client.media.listStorageUnits(),
  });

  const handleEdit = (id: string, name: string) => {
    setSelectedStorageUnit({ id, name });
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setSelectedStorageUnit({ id, name });
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold">Storage Units</h3>
            <p className="text-muted-foreground mt-1">
              Manage storage units for your media containers
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">
            Failed to load storage units:{' '}
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const storageUnits = data || [];
  const isEmpty = storageUnits.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Storage Units</h3>
          <p className="text-muted-foreground mt-1">
            Manage storage units for your media containers
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Storage Unit
        </Button>
      </div>

      {isEmpty ? (
        <div className="py-12">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BoxIcon className="h-12 w-12" />
              </EmptyMedia>
              <EmptyTitle className="text-2xl">
                No storage units created yet
              </EmptyTitle>
              <EmptyDescription className="text-base">
                Storage units define where your media containers are stored. Get
                started by creating your first storage unit.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setCreateDialogOpen(true)} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Storage Unit
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {storageUnits.map((unit: any) => (
            <StorageUnitCard
              key={unit.id}
              storageUnit={unit}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateStorageUnitDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedStorageUnit && (
        <>
          <EditStorageUnitDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            storageUnitId={selectedStorageUnit.id}
            storageUnitName={selectedStorageUnit.name}
          />
          <DeleteStorageUnitDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            storageUnitId={selectedStorageUnit.id}
            storageUnitName={selectedStorageUnit.name}
          />
        </>
      )}
    </div>
  );
}

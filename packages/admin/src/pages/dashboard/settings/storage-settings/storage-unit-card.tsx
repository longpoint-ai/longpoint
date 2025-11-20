import { Badge } from '@longpoint/ui/components/badge';
import { Button } from '@longpoint/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@longpoint/ui/components/card';
import { Edit, HardDrive, Trash2 } from 'lucide-react';

interface StorageUnitCardProps {
  storageUnit: {
    id: string;
    name: string;
    provider: {
      id: string;
      name: string;
      image: string | null;
    };
    isDefault: boolean;
  };
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string, name: string) => void;
}

export function StorageUnitCard({
  storageUnit,
  onEdit,
  onDelete,
}: StorageUnitCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {storageUnit.name}
              {storageUnit.isDefault && (
                <Badge variant="secondary">Default</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center gap-2">
                {storageUnit.provider.image ? (
                  <img
                    src={storageUnit.provider.image}
                    alt={storageUnit.provider.name}
                    className="h-4 w-4 rounded"
                  />
                ) : (
                  <HardDrive className="h-4 w-4" />
                )}
                <span>{storageUnit.provider.name}</span>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(storageUnit.id, storageUnit.name)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(storageUnit.id, storageUnit.name)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

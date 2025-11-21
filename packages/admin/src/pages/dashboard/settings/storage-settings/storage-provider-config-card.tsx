import { Badge } from '@longpoint/ui/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@longpoint/ui/components/card';
import { cn } from '@longpoint/ui/utils';
import { HardDrive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StorageProviderConfigCardProps {
  config: {
    id: string;
    name: string;
    provider: string;
    usageCount?: number;
  };
}

export function StorageProviderConfigCard({
  config,
}: StorageProviderConfigCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/settings/storage/configs/${config.id}`);
  };

  return (
    <Card
      className={cn('cursor-pointer transition-colors hover:bg-accent')}
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {config.name}
            </CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span>{config.provider}</span>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {config.usageCount !== undefined && (
            <Badge variant="secondary">
              {config.usageCount} unit{config.usageCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

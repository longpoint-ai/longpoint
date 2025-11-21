import { cn } from '@longpoint/ui/utils';
import { HardDrive } from 'lucide-react';

export interface StorageProviderIconProps {
  image?: string | null;
  className?: string;
}

export function StorageProviderIcon({
  image,
  className,
}: StorageProviderIconProps) {
  if (image) {
    return (
      <img
        src={image}
        alt="Storage provider icon"
        className={cn('size-5 rounded', className)}
      />
    );
  }

  return <HardDrive className={cn('size-5', className)} />;
}

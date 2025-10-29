import { components } from '@longpoint/sdk';
import { Skeleton } from '@longpoint/ui/components/skeleton';
import { MediaGridItem } from './media-grid-item';

interface MediaGridProps {
  items: components['schemas']['LibraryTree']['items'];
  isLoading?: boolean;
  onFolderClick?: (path: string) => void;
}

export function MediaGrid({ items, isLoading, onFolderClick }: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="w-full h-24 rounded-lg" />
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-3" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Empty state will be handled by parent
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {items.map((item, index) => (
        <MediaGridItem
          key={`${item.treeItemType}-${index}`}
          item={item}
          onFolderClick={onFolderClick}
        />
      ))}
    </div>
  );
}

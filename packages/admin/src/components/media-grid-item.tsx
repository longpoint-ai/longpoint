import { components } from '@longpoint/sdk';
import { Badge } from '@longpoint/ui/components/badge';
import { Card, CardContent } from '@longpoint/ui/components/card';
import { FolderIcon, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MediaGridItemProps {
  item: components['schemas']['LibraryTree']['items'][number];
  onFolderClick?: (path: string) => void;
}

export function MediaGridItem({ item, onFolderClick }: MediaGridItemProps) {
  if (item.treeItemType === 'DIRECTORY') {
    const { path } = item;
    const folderName = path.split('/').pop() || 'Folder';

    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group overflow-hidden"
        onClick={() => onFolderClick?.(path)}
      >
        <CardContent className="p-0">
          <div className="flex flex-col">
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 group-hover:from-blue-100 group-hover:to-blue-200 transition-colors flex items-center justify-center relative">
              <FolderIcon
                className="w-16 h-16 text-blue-600"
                strokeWidth={1.5}
              />
            </div>
            <div className="p-4 border-t">
              <div className="text-center space-y-1">
                <p
                  className="text-sm font-semibold truncate group-hover:text-blue-600 transition-colors"
                  title={folderName}
                >
                  {folderName}
                </p>
                <p className="text-xs text-muted-foreground">Folder</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (item.treeItemType === 'MEDIA') {
    const { id, name, status } = item;
    const isReady = status === 'READY';
    const thumbnail = item.thumbnails[0];

    return (
      <Link to={`/media/${id}`} className="block">
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-gray-100 group-hover:to-gray-200 transition-colors relative overflow-hidden">
                {thumbnail?.url ? (
                  <img
                    src={thumbnail.url}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ aspectRatio: thumbnail.aspectRatio ?? undefined }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon
                      className="w-16 h-16 text-gray-400"
                      strokeWidth={1.5}
                    />
                  </div>
                )}
                {!isReady && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {status}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-4 border-t">
                <div className="text-center space-y-1">
                  <p
                    className="text-sm font-semibold truncate group-hover:text-gray-900 transition-colors"
                    title={name}
                  >
                    {name}
                  </p>
                  <p className="text-xs text-muted-foreground">Media</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return null;
}

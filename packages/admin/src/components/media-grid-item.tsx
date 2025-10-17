import { Badge } from '@longpoint/ui/components/badge';
import { Card, CardContent } from '@longpoint/ui/components/card';
import { FolderIcon, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MediaGridItemProps {
  item: {
    type: 'DIRECTORY' | 'MEDIA';
    content: any;
  };
  onFolderClick?: (path: string) => void;
}

export function MediaGridItem({ item, onFolderClick }: MediaGridItemProps) {
  const isDirectory = item.type === 'DIRECTORY';
  const isMedia = item.type === 'MEDIA';

  if (isDirectory) {
    const { path } = item.content;
    const folderName = path.split('/').pop() || 'Folder';

    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
        onClick={() => onFolderClick?.(path)}
      >
        <CardContent className="p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
              <FolderIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-center min-h-[2.5rem] flex flex-col justify-center">
              <p
                className="text-sm font-medium truncate max-w-[140px] group-hover:text-blue-600 transition-colors"
                title={folderName}
              >
                {folderName}
              </p>
              <p className="text-xs text-muted-foreground">Folder</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMedia) {
    const { id, name, status } = item.content;
    const isReady = status === 'READY';

    return (
      <Link to={`/media/${id}`}>
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group">
          <CardContent className="p-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:from-gray-100 group-hover:to-gray-200 transition-colors">
                <ImageIcon className="w-8 h-8 text-gray-600" />
              </div>
              <div className="text-center min-h-[2.5rem] flex flex-col justify-center">
                <p
                  className="text-sm font-medium truncate max-w-[140px] group-hover:text-gray-600 transition-colors"
                  title={name}
                >
                  {name}
                </p>
                <div className="flex items-center justify-center gap-1">
                  <p className="text-xs text-muted-foreground">Media</p>
                  {!isReady && (
                    <Badge variant="secondary" className="text-xs">
                      {status}
                    </Badge>
                  )}
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

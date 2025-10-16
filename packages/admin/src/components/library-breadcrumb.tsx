import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@longpoint/ui/components/breadcrumb';
import { Link } from 'react-router-dom';

interface LibraryBreadcrumbProps {
  currentPath: string;
}

export function LibraryBreadcrumb({ currentPath }: LibraryBreadcrumbProps) {
  // Parse the path into segments
  const pathSegments =
    currentPath === '/' ? [] : currentPath.split('/').filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/library">Library</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const pathToSegment =
            '/' + pathSegments.slice(0, index + 1).join('/');

          return (
            <div key={pathToSegment} className="flex items-center">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segment}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={`/library?path=${encodeURIComponent(pathToSegment)}`}
                    >
                      {segment}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

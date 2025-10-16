import { useUploadContext } from '@/contexts/upload-context';
import { Button } from '@longpoint/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@longpoint/ui/components/card';
import { UploadIcon } from 'lucide-react';

export function Library() {
  const { openDialog } = useUploadContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Library</h2>
          <p className="text-muted-foreground mt-2">
            Manage your media files and content library
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openDialog()}>
            <UploadIcon className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>
              Manage your image files and galleries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Upload, organize, and manage your image assets.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Videos</CardTitle>
            <CardDescription>
              Handle video content and media files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage video uploads and streaming content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Store and organize document files</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Upload and manage PDFs, text files, and other documents.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest library activities and uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No recent activity to display. Start by uploading some files to your
            library.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

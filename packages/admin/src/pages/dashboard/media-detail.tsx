import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@longpoint/ui/components/card';
import { useParams } from 'react-router-dom';

export function MediaDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Media Detail</h2>
        <p className="text-muted-foreground mt-2">Viewing media item: {id}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Media Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder for the media detail page. The actual
            implementation will be added in a future update.
          </p>
          <p className="text-sm text-muted-foreground mt-2">Media ID: {id}</p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from '@longpoint/ui/components/button';
import { Badge } from '@longpoint/ui/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@longpoint/ui/components/card';
import { Input } from '@longpoint/ui/components/input';

export function App() {
  return (
    <div>
      <h1>Hello World</h1>
      <Button>Click Me</Button>
      <Badge>Dis a badge</Badge>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <Input />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;

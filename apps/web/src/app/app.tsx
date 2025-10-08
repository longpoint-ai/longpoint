import { Button } from '@longpoint/web-ui/components/button';
import { Badge } from '@longpoint/web-ui/components/badge';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@longpoint/web-ui/components/card';

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
      </Card>
    </div>
  );
}

export default App;

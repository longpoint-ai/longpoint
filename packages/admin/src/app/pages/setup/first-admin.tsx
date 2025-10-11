import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@longpoint/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@longpoint/ui/components/card';
import { Input } from '@longpoint/ui/components/input';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export function FirstAdminSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Stub out the API call - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const result = await authClient.signUp.email({
      email: formData.email,
      name: formData.name,
      password: formData.password,
    });

    if (result.error) {
      toast('Error creating account', { description: result.error.message });
      return;
    }

    // Simulate successful account creation
    toast('Welcome to Longpoint!');
    console.log('Creating admin account:', result.data);

    navigate('/');
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">
          Welcome to Longpoint
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Create your first administrator account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleInputChange('password')}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Admin Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

import {
  ConfigSchemaForm,
  getDefaultValueForType,
  validateConfigSchemaForm,
} from '@/components/config-schema';
import { useClient } from '@/hooks/common';
import { Button } from '@longpoint/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@longpoint/ui/components/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@longpoint/ui/components/field';
import { Skeleton } from '@longpoint/ui/components/skeleton';
import { Switch } from '@longpoint/ui/components/switch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type Provider = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useClient>['ai']['listAiProviders']>>
>[number];

export function ModelSettings() {
  const client = useClient();
  const queryClient = useQueryClient();
  const {
    data: providers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ai-providers'],
    queryFn: () => client.ai.listAiProviders(),
  });

  // Store model enabled state (stub - no backend)
  const [enabledModels, setEnabledModels] = useState<Set<string>>(new Set());

  const toggleModelEnabled = (modelId: string) => {
    setEnabledModels((prev) => {
      const next = new Set(prev);
      if (next.has(modelId)) {
        next.delete(modelId);
      } else {
        next.add(modelId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">
            Failed to load providers:{' '}
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No AI providers installed.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          enabledModels={enabledModels}
          onToggleModel={toggleModelEnabled}
          client={client}
          queryClient={queryClient}
        />
      ))}
    </div>
  );
}

interface ProviderCardProps {
  provider: Provider;
  enabledModels: Set<string>;
  onToggleModel: (modelId: string) => void;
  client: ReturnType<typeof useClient>;
  queryClient: ReturnType<typeof useQueryClient>;
}

function ProviderCard({
  provider,
  enabledModels,
  onToggleModel,
  client,
  queryClient,
}: ProviderCardProps) {
  // Initialize form defaults from existing config or schema
  // Values need to be nested under 'config' due to namePrefix="config"
  const defaultValues = useMemo(() => {
    let configValues: Record<string, any> = {};

    if (provider.config) {
      configValues = provider.config;
    } else if (provider.configSchema) {
      Object.entries(provider.configSchema).forEach(
        ([key, value]: [string, any]) => {
          configValues[key] = getDefaultValueForType(value);
        }
      );
    }

    return { config: configValues };
  }, [provider.config, provider.configSchema]);

  const form = useForm({
    defaultValues,
  });

  // Reset form when provider config changes (e.g., after save)
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const saveMutation = useMutation({
    mutationFn: async (config: Record<string, any>) => {
      return client.ai.updateAiProviderConfig(provider.id, {
        config: config as Record<string, never>,
      });
    },
    onSuccess: () => {
      toast.success(`Configuration saved for ${provider.name}`);
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] });
    },
    onError: (error) => {
      toast.error('Failed to save configuration', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    // Extract config values (they're nested under 'config' due to namePrefix)
    const configValues = data.config || data;

    // Validate using config schema if it exists
    if (provider.configSchema) {
      const isValid = validateConfigSchemaForm(
        provider.configSchema as any,
        configValues,
        'config',
        form.setError
      );
      if (!isValid) {
        return;
      }
    }

    saveMutation.mutate(configValues);
  });

  const hasConfigSchema =
    provider.configSchema !== null &&
    Object.keys(provider.configSchema).length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          {provider.image && (
            <img
              src={provider.image}
              alt={provider.name}
              className="h-10 w-10 rounded"
            />
          )}
          <div>
            <CardTitle>{provider.name}</CardTitle>
            <CardDescription>
              {provider.models.length} model
              {provider.models.length !== 1 ? 's' : ''} available
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Models list with toggles */}
        {provider.models.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Models</h3>
            <FieldGroup>
              {provider.models.map((model: Provider['models'][number]) => {
                const isEnabled = enabledModels.has(model.fullyQualifiedId);
                return (
                  <Field key={model.id} orientation="horizontal">
                    <div className="flex-1">
                      <FieldLabel htmlFor={`model-${model.id}`}>
                        {model.name}
                      </FieldLabel>
                      {model.description && (
                        <FieldDescription>{model.description}</FieldDescription>
                      )}
                    </div>
                    <Switch
                      id={`model-${model.id}`}
                      checked={isEnabled}
                      onCheckedChange={() =>
                        onToggleModel(model.fullyQualifiedId)
                      }
                    />
                  </Field>
                );
              })}
            </FieldGroup>
          </div>
        )}

        {/* Provider configuration form */}
        {hasConfigSchema && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold">Configuration</h3>
            <form id={`provider-config-${provider.id}`} onSubmit={handleSubmit}>
              <ConfigSchemaForm
                schema={provider.configSchema as any}
                control={form.control}
                namePrefix="config"
                setError={form.setError}
              />
            </form>
          </div>
        )}

        {!hasConfigSchema && provider.needsConfig && (
          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground">
              This provider requires configuration, but no schema is available.
            </p>
          </div>
        )}
      </CardContent>
      {hasConfigSchema && (
        <CardFooter>
          <Button
            type="submit"
            form={`provider-config-${provider.id}`}
            isLoading={saveMutation.isPending}
            disabled={saveMutation.isPending}
          >
            Save Configuration
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

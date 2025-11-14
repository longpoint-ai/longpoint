import {
  ConfigSchemaForm,
  getDefaultValueForType,
  validateConfigSchemaForm,
} from '@/components/config-schema';
import { DeleteSearchIndexDialog } from '@/components/delete-search-index-dialog';
import { useClient } from '@/hooks/common';
import { components } from '@longpoint/sdk';
import { Badge } from '@longpoint/ui/components/badge';
import { Button } from '@longpoint/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@longpoint/ui/components/card';
import { Progress } from '@longpoint/ui/components/progress';
import { Skeleton } from '@longpoint/ui/components/skeleton';
import { Spinner } from '@longpoint/ui/components/spinner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export function SearchSettings() {
  const client = useClient();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState<{
    id: string;
    name: string;
    isActive: boolean;
  } | null>(null);

  const {
    data: providers,
    isLoading: providersLoading,
    error: providersError,
  } = useQuery({
    queryKey: ['vector-providers'],
    queryFn: () => client.search.listVectorProviders(),
  });

  const {
    data: indexes,
    isLoading: indexesLoading,
    error: indexesError,
  } = useQuery({
    queryKey: ['search-indexes'],
    queryFn: () => client.search.listSearchIndexes(),
  });

  const {
    data: systemStatus,
    isLoading: systemStatusLoading,
    error: systemStatusError,
  } = useQuery({
    queryKey: ['system-status'],
    queryFn: () => client.system.getSystemStatus(),
  });

  const activeIndex = indexes?.find((index) => index.active === true);
  const totalContainers = systemStatus?.totalContainers ?? 0;
  const indexedContainers = activeIndex?.mediaIndexed ?? 0;
  const progressPercentage =
    totalContainers > 0 ? (indexedContainers / totalContainers) * 100 : 0;

  const handleDeleteClick = (index: components['schemas']['SearchIndex']) => {
    setIndexToDelete({
      id: index.id,
      name: index.name,
      isActive: index.active,
    });
    setDeleteDialogOpen(true);
  };

  if (providersLoading || indexesLoading || systemStatusLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
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

  if (providersError || indexesError || systemStatusError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">
            Failed to load search settings:{' '}
            {(providersError || indexesError || systemStatusError) instanceof
            Error
              ? (providersError || indexesError || systemStatusError)?.message
              : 'Unknown error'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!providers || providers.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            No vector providers installed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Indexes List */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Search Indexes</h3>
        {indexes && indexes.length > 0 ? (
          indexes.map((index) => (
            <Card key={index.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{index.name}</CardTitle>
                    <CardDescription>
                      {index.active
                        ? 'Active search index - current indexing status and progress'
                        : 'Inactive search index'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {index.indexing && (
                      <Spinner className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Badge variant={index.active ? 'default' : 'secondary'}>
                      {index.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(index)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Vector Provider
                    </span>
                    <span className="font-medium">
                      {index.vectorProvider.name}
                    </span>
                  </div>
                  {index.embeddingModel && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Embedding Model
                      </span>
                      <span className="font-medium">
                        {index.embeddingModel.name}
                      </span>
                    </div>
                  )}
                  {index.lastIndexedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Last Indexed
                      </span>
                      <span className="font-medium">
                        {new Date(index.lastIndexedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Media Indexed</span>
                    <span className="font-medium">{index.mediaIndexed}</span>
                  </div>
                </div>
                {index.active && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Indexing Progress
                      </span>
                      <span className="font-medium">
                        {indexedContainers} / {totalContainers} containers
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                No search indexes found. Create one to enable search
                functionality.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Vector Provider Configuration */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Vector Providers</h3>
        {providers.map((provider) => (
          <VectorProviderCard
            key={provider.id}
            provider={provider}
            client={client}
            queryClient={queryClient}
          />
        ))}
      </div>

      {/* Delete Dialog */}
      {indexToDelete && (
        <DeleteSearchIndexDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setIndexToDelete(null);
            }
          }}
          indexId={indexToDelete.id}
          indexName={indexToDelete.name}
          isActive={indexToDelete.isActive}
        />
      )}
    </div>
  );
}

interface VectorProviderCardProps {
  provider: components['schemas']['VectorProvider'];
  client: ReturnType<typeof useClient>;
  queryClient: ReturnType<typeof useQueryClient>;
}

function VectorProviderCard({
  provider,
  client,
  queryClient,
}: VectorProviderCardProps) {
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

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const saveMutation = useMutation({
    mutationFn: async (config: Record<string, any>) => {
      return client.search.updateVectorProviderConfig(provider.id, {
        config: config as Record<string, never>,
      });
    },
    onSuccess: () => {
      toast.success(`Configuration saved for ${provider.name}`);
      queryClient.invalidateQueries({ queryKey: ['vector-providers'] });
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
    const configValues = data.config || data;

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
              {provider.supportsEmbedding
                ? 'Supports native embedding'
                : 'Requires external embedding model'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasConfigSchema && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-semibold">Configuration</h3>
            <form
              id={`vector-provider-config-${provider.id}`}
              onSubmit={handleSubmit}
            >
              <ConfigSchemaForm
                schema={provider.configSchema as any}
                control={form.control}
                namePrefix="config"
                setError={form.setError}
              />
            </form>
          </div>
        )}

        {!hasConfigSchema && (
          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground">
              This provider does not require configuration.
            </p>
          </div>
        )}
      </CardContent>
      {hasConfigSchema && (
        <CardFooter>
          <Button
            type="submit"
            form={`vector-provider-config-${provider.id}`}
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

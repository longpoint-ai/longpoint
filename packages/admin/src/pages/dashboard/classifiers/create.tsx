import { useClient } from '@/hooks/common/use-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@longpoint/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@longpoint/ui/components/card';
import { Checkbox } from '@longpoint/ui/components/checkbox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@longpoint/ui/components/field';
import { Input } from '@longpoint/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@longpoint/ui/components/select';
import { Skeleton } from '@longpoint/ui/components/skeleton';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as z from 'zod';

export function CreateClassifier() {
  const client = useClient();
  const navigate = useNavigate();
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['models'],
    queryFn: () => client.ai.listModels(),
  });

  const { data: selectedModel, isLoading: selectedModelLoading } = useQuery({
    queryKey: ['model', selectedModelId],
    enabled: !!selectedModelId,
    queryFn: () => client.ai.getModel(selectedModelId as string),
  });

  const formSchema = z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Name must be lowercase letters, numbers, and hyphens only'
      ),
    description: z.string().optional(),
    modelInput: z.record(z.string(), z.any()).optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      modelInput: {},
    },
  });

  function getDefaultValueForType(value: any) {
    const t = value?.type;
    if (t === 'boolean') return false;
    if (t === 'number') return '';
    if (t === 'object') {
      const result: any = {};
      const props = value?.properties || {};
      Object.entries(props).forEach(([k, v]: [string, any]) => {
        result[k] = getDefaultValueForType(v);
      });
      return result;
    }
    // default string or unknown
    return '';
  }

  const ArrayField = ({
    name,
    schemaValue,
    label,
    description,
    required,
  }: {
    name: string;
    schemaValue: any;
    label: string;
    description?: string | null;
    required: boolean;
  }) => {
    const { fields, append, remove } = useFieldArray({
      control: form.control as any,
      name: name as any,
    });
    const minLen = Number(schemaValue?.minLength ?? (required ? 1 : 0));
    const maxLen = schemaValue?.maxLength;

    const itemSchema = schemaValue?.items || {};
    const itemType = itemSchema?.type;

    return (
      <Field>
        <div className="flex items-center justify-between mb-2">
          <FieldLabel>
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </FieldLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append(getDefaultValueForType(itemSchema))}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {description && (
          <FieldDescription>{String(description)}</FieldDescription>
        )}
        {minLen ? (
          <FieldDescription>
            Minimum {minLen} {minLen === 1 ? 'item' : 'items'}
          </FieldDescription>
        ) : null}
        {typeof maxLen === 'number' ? (
          <FieldDescription>Maximum {maxLen} items</FieldDescription>
        ) : null}
        <div className="space-y-4">
          {fields.map((field, index) => {
            const baseName = `${name}.${index}`;
            if (itemType === 'object') {
              const properties = itemSchema?.properties || {};
              return (
                <div
                  key={field.id}
                  className="rounded-lg border bg-muted/20 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">
                      {label} item #{index + 1}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="Remove item"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {Object.entries(properties).map(
                    ([propKey, propSchema]: [string, any]) => {
                      const propType = propSchema?.type;
                      const propLabel = propSchema?.label ?? propKey;
                      const propDesc = (propSchema?.description as any) ?? null;
                      const propRequired = Boolean(propSchema?.required);
                      const fieldName = `${baseName}.${propKey}`;
                      if (propType === 'boolean') {
                        return (
                          <Controller
                            key={propKey}
                            name={fieldName as any}
                            control={form.control}
                            defaultValue={false as any}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <div className="flex items-center justify-between">
                                  <FieldLabel
                                    htmlFor={`mi-${fieldName}`}
                                    className="mr-4"
                                  >
                                    {propLabel}
                                    {propRequired && (
                                      <span className="ml-1 text-destructive">
                                        *
                                      </span>
                                    )}
                                  </FieldLabel>
                                  <Checkbox
                                    id={`mi-${fieldName}`}
                                    checked={Boolean(field.value)}
                                    onCheckedChange={(v) =>
                                      field.onChange(Boolean(v))
                                    }
                                    aria-invalid={fieldState.invalid}
                                  />
                                </div>
                                {propDesc && (
                                  <FieldDescription>
                                    {String(propDesc)}
                                  </FieldDescription>
                                )}
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />
                        );
                      }
                      if (propType === 'number') {
                        return (
                          <Controller
                            key={propKey}
                            name={fieldName as any}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={`mi-${fieldName}`}>
                                  {propLabel}
                                  {propRequired && (
                                    <span className="ml-1 text-destructive">
                                      *
                                    </span>
                                  )}
                                </FieldLabel>
                                <Input
                                  id={`mi-${fieldName}`}
                                  type="number"
                                  value={field.value ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    field.onChange(
                                      val === '' ? '' : Number(val)
                                    );
                                  }}
                                  aria-invalid={fieldState.invalid}
                                  placeholder={propLabel}
                                />
                                {propDesc && (
                                  <FieldDescription>
                                    {String(propDesc)}
                                  </FieldDescription>
                                )}
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />
                        );
                      }
                      // default string
                      return (
                        <Controller
                          key={propKey}
                          name={fieldName as any}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={`mi-${fieldName}`}>
                                {propLabel}
                                {propRequired && (
                                  <span className="ml-1 text-destructive">
                                    *
                                  </span>
                                )}
                              </FieldLabel>
                              <Input
                                {...field}
                                id={`mi-${fieldName}`}
                                aria-invalid={fieldState.invalid}
                                placeholder={propLabel}
                              />
                              {propDesc && (
                                <FieldDescription>
                                  {String(propDesc)}
                                </FieldDescription>
                              )}
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      );
                    }
                  )}
                </div>
              );
            }
            // primitive array items
            return (
              <div key={field.id} className="flex items-end gap-2">
                <div className="flex-1">
                  <Controller
                    name={baseName as any}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        {itemType === 'boolean' ? (
                          <div className="flex items-center justify-between">
                            <FieldLabel
                              htmlFor={`mi-${baseName}`}
                              className="mr-4"
                            >
                              {label} item #{index + 1}
                            </FieldLabel>
                            <Checkbox
                              id={`mi-${baseName}`}
                              checked={Boolean(field.value)}
                              onCheckedChange={(v) =>
                                field.onChange(Boolean(v))
                              }
                              aria-invalid={fieldState.invalid}
                            />
                          </div>
                        ) : itemType === 'number' ? (
                          <>
                            <FieldLabel htmlFor={`mi-${baseName}`}>
                              {label} item #{index + 1}
                            </FieldLabel>
                            <Input
                              id={`mi-${baseName}`}
                              type="number"
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(val === '' ? '' : Number(val));
                              }}
                              aria-invalid={fieldState.invalid}
                              placeholder={label}
                            />
                          </>
                        ) : (
                          <>
                            <FieldLabel htmlFor={`mi-${baseName}`}>
                              {label} item #{index + 1}
                            </FieldLabel>
                            <Input
                              {...field}
                              id={`mi-${baseName}`}
                              aria-invalid={fieldState.invalid}
                              placeholder={label}
                            />
                          </>
                        )}
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Remove item"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </Field>
    );
  };

  const ObjectField = ({
    namePrefix,
    schemaValue,
    label,
    description,
    required,
  }: {
    namePrefix: string;
    schemaValue: any;
    label: string;
    description?: string | null;
    required: boolean;
  }) => {
    const properties = schemaValue?.properties || {};
    return (
      <div className="space-y-3">
        <Field>
          <FieldLabel>
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </FieldLabel>
          {description && (
            <FieldDescription>{String(description)}</FieldDescription>
          )}
        </Field>
        <FieldGroup>
          {Object.entries(properties).map(
            ([propKey, propSchema]: [string, any]) => {
              const t = propSchema?.type;
              const propLabel = propSchema?.label ?? propKey;
              const propDesc = (propSchema?.description as any) ?? null;
              const propReq = Boolean(propSchema?.required);
              const fieldName = `${namePrefix}.${propKey}`;
              if (t === 'array') {
                return (
                  <ArrayField
                    key={propKey}
                    name={fieldName}
                    schemaValue={propSchema}
                    label={propLabel}
                    description={propDesc}
                    required={propReq}
                  />
                );
              }
              if (t === 'object') {
                return (
                  <ObjectField
                    key={propKey}
                    namePrefix={fieldName}
                    schemaValue={propSchema}
                    label={propLabel}
                    description={propDesc}
                    required={propReq}
                  />
                );
              }
              if (t === 'boolean') {
                return (
                  <Controller
                    key={propKey}
                    name={fieldName as any}
                    control={form.control}
                    defaultValue={false as any}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <div className="flex items-center justify-between">
                          <FieldLabel
                            htmlFor={`mi-${fieldName}`}
                            className="mr-4"
                          >
                            {propLabel}
                            {propReq && (
                              <span className="ml-1 text-destructive">*</span>
                            )}
                          </FieldLabel>
                          <Checkbox
                            id={`mi-${fieldName}`}
                            checked={Boolean(field.value)}
                            onCheckedChange={(v) => field.onChange(Boolean(v))}
                            aria-invalid={fieldState.invalid}
                          />
                        </div>
                        {propDesc && (
                          <FieldDescription>
                            {String(propDesc)}
                          </FieldDescription>
                        )}
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                );
              }
              if (t === 'number') {
                return (
                  <Controller
                    key={propKey}
                    name={fieldName as any}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={`mi-${fieldName}`}>
                          {propLabel}
                          {propReq && (
                            <span className="ml-1 text-destructive">*</span>
                          )}
                        </FieldLabel>
                        <Input
                          id={`mi-${fieldName}`}
                          type="number"
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? '' : Number(val));
                          }}
                          aria-invalid={fieldState.invalid}
                          placeholder={propLabel}
                        />
                        {propDesc && (
                          <FieldDescription>
                            {String(propDesc)}
                          </FieldDescription>
                        )}
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                );
              }
              return (
                <Controller
                  key={propKey}
                  name={fieldName as any}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`mi-${fieldName}`}>
                        {propLabel}
                        {propReq && (
                          <span className="ml-1 text-destructive">*</span>
                        )}
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`mi-${fieldName}`}
                        aria-invalid={fieldState.invalid}
                        placeholder={propLabel}
                      />
                      {propDesc && (
                        <FieldDescription>{String(propDesc)}</FieldDescription>
                      )}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              );
            }
          )}
        </FieldGroup>
      </div>
    );
  };

  function validateFieldAgainstSchema(
    schemaValue: any,
    fieldValue: any,
    path: string
  ): boolean {
    let ok = true;
    const label = schemaValue?.label ?? path.split('.').slice(-1)[0];
    const t = schemaValue?.type;
    const isRequired = Boolean(schemaValue?.required);
    if (t === 'string') {
      if (
        isRequired &&
        (typeof fieldValue !== 'string' || fieldValue.trim().length === 0)
      ) {
        ok = false;
        form.setError(
          path as any,
          { type: 'required', message: `${label} is required` } as any
        );
      }
    } else if (t === 'number') {
      const num =
        typeof fieldValue === 'number' ? fieldValue : Number(fieldValue);
      if (isRequired && !Number.isFinite(num)) {
        ok = false;
        form.setError(
          path as any,
          { type: 'required', message: `${label} must be a number` } as any
        );
      }
    } else if (t === 'boolean') {
      if (isRequired && typeof fieldValue !== 'boolean') {
        ok = false;
        form.setError(
          path as any,
          { type: 'required', message: `${label} is required` } as any
        );
      }
    } else if (t === 'object') {
      if (isRequired && (fieldValue === undefined || fieldValue === null)) {
        ok = false;
        form.setError(
          path as any,
          { type: 'required', message: `${label} is required` } as any
        );
      }
      const properties = schemaValue?.properties || {};
      Object.entries(properties).forEach(([key, propSchema]: [string, any]) => {
        const childValue = fieldValue?.[key];
        const childOk = validateFieldAgainstSchema(
          propSchema,
          childValue,
          `${path}.${key}`
        );
        if (!childOk) ok = false;
      });
    } else if (t === 'array') {
      const minLen = Number(schemaValue?.minLength ?? (isRequired ? 1 : 0));
      if (!Array.isArray(fieldValue)) {
        if (isRequired) {
          ok = false;
          form.setError(
            path as any,
            { type: 'required', message: `${label} must be an array` } as any
          );
        }
      } else {
        if (fieldValue.length < minLen) {
          ok = false;
          form.setError(
            path as any,
            {
              type: 'min',
              message: `${label} requires at least ${minLen} item(s)`,
            } as any
          );
        }
        const itemSchema = schemaValue?.items || {};
        fieldValue.forEach((item: any, index: number) => {
          const childOk = validateFieldAgainstSchema(
            itemSchema,
            item,
            `${path}.${index}`
          );
          if (!childOk) ok = false;
        });
      }
    }
    return ok;
  }

  function validateModelInput(
    schema: Record<string, any> | undefined,
    values: any
  ): boolean {
    if (!schema) return true;
    let ok = true;
    Object.entries(schema).forEach(([key, value]: [string, any]) => {
      const childOk = validateFieldAgainstSchema(
        value,
        values?.[key],
        `modelInput.${key}`
      );
      if (!childOk) ok = false;
    });
    return ok;
  }

  const handleSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (
    data
  ) => {
    if (!selectedModelId) {
      toast.error('Please select a model');
      return;
    }

    // Validate model input (including nested objects/arrays)
    const schema: Record<string, any> | undefined =
      selectedModel?.classifierInputSchema;
    const values = form.getValues() as any;
    const isValid = validateModelInput(schema, values?.modelInput);
    if (!isValid) return;

    try {
      // Include dynamic modelInput when present
      const payload: any = {
        ...data,
        modelId: selectedModelId,
      };
      if (payload.description === '') payload.description = null;
      if (values?.modelInput) {
        payload.modelInput = values.modelInput;
      }
      console.log('payload', payload);
      const result = await client.ai.createClassifier(payload);

      toast.success('Classifier created successfully');
      navigate(`/classifiers/${result.id}`);
    } catch (error) {
      toast.error('Failed to create classifier', {
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/classifiers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Create Classifier</h2>
          <p className="text-muted-foreground mt-2">
            Set up a new AI classifier for your media
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Name and describe your classifier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="classifier-name">
                        Classifier Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="classifier-name"
                        placeholder="general-tagging"
                      />
                      <FieldDescription>
                        A unique identifier for your classifier (lowercase,
                        hyphens only)
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="classifier-description">
                        Description
                      </FieldLabel>
                      <Input
                        {...field}
                        id="classifier-description"
                        placeholder="Tag general subjects like people, places, and things"
                      />
                      <FieldDescription>
                        Optional description of what this classifier does
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Model Selection</CardTitle>
              <CardDescription>
                Choose the AI model to use for this classifier
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Field>
                  <FieldLabel htmlFor="classifier-model">Model</FieldLabel>
                  <Select
                    value={selectedModelId || undefined}
                    onValueChange={setSelectedModelId}
                  >
                    <SelectTrigger id="classifier-model" className="w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models?.map((model) => (
                        <SelectItem
                          key={model.id}
                          value={model.fullyQualifiedId}
                        >
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({model.provider.name})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Select the AI model to use for classification
                  </FieldDescription>
                </Field>
              )}
            </CardContent>
          </Card>

          {selectedModelId && (
            <Card>
              <CardHeader>
                <CardTitle>Model Input</CardTitle>
                <CardDescription>
                  Provide configuration required by the selected model
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedModelLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <FieldGroup>
                    {selectedModel &&
                      selectedModel.classifierInputSchema &&
                      Object.entries(selectedModel.classifierInputSchema).map(
                        ([key, value]: [string, any]) => {
                          const type = value?.type;
                          const label = value?.label ?? key;
                          const description =
                            (value?.description as any) ?? null;
                          const required = Boolean(value?.required);

                          if (type === 'array') {
                            return (
                              <ArrayField
                                key={key}
                                name={`modelInput.${key}`}
                                schemaValue={value}
                                label={label}
                                description={description}
                                required={required}
                              />
                            );
                          }

                          if (type === 'object') {
                            return (
                              <ObjectField
                                key={key}
                                namePrefix={`modelInput.${key}`}
                                schemaValue={value}
                                label={label}
                                description={description}
                                required={required}
                              />
                            );
                          }

                          if (type === 'boolean') {
                            return (
                              <Controller
                                key={key}
                                name={`modelInput.${key}` as any}
                                control={form.control}
                                defaultValue={false as any}
                                render={({ field, fieldState }) => (
                                  <Field data-invalid={fieldState.invalid}>
                                    <div className="flex items-center justify-between">
                                      <FieldLabel
                                        htmlFor={`mi-${key}`}
                                        className="mr-4"
                                      >
                                        {label}
                                        {required && (
                                          <span className="ml-1 text-destructive">
                                            *
                                          </span>
                                        )}
                                      </FieldLabel>
                                      <Checkbox
                                        id={`mi-${key}`}
                                        checked={Boolean(field.value)}
                                        onCheckedChange={(v) =>
                                          field.onChange(Boolean(v))
                                        }
                                        aria-invalid={fieldState.invalid}
                                      />
                                    </div>
                                    {description && (
                                      <FieldDescription>
                                        {String(description)}
                                      </FieldDescription>
                                    )}
                                    {fieldState.invalid && (
                                      <FieldError errors={[fieldState.error]} />
                                    )}
                                  </Field>
                                )}
                              />
                            );
                          }

                          if (type === 'number') {
                            return (
                              <Controller
                                key={key}
                                name={`modelInput.${key}` as any}
                                control={form.control}
                                render={({ field, fieldState }) => (
                                  <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={`mi-${key}`}>
                                      {label}
                                      {required && (
                                        <span className="ml-1 text-destructive">
                                          *
                                        </span>
                                      )}
                                    </FieldLabel>
                                    <Input
                                      id={`mi-${key}`}
                                      type="number"
                                      value={field.value ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        field.onChange(
                                          val === '' ? '' : Number(val)
                                        );
                                      }}
                                      aria-invalid={fieldState.invalid}
                                      placeholder={label}
                                    />
                                    {description && (
                                      <FieldDescription>
                                        {String(description)}
                                      </FieldDescription>
                                    )}
                                    {fieldState.invalid && (
                                      <FieldError errors={[fieldState.error]} />
                                    )}
                                  </Field>
                                )}
                              />
                            );
                          }

                          // default to string input
                          return (
                            <Controller
                              key={key}
                              name={`modelInput.${key}` as any}
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={`mi-${key}`}>
                                    {label}
                                    {required && (
                                      <span className="ml-1 text-destructive">
                                        *
                                      </span>
                                    )}
                                  </FieldLabel>
                                  <Input
                                    {...field}
                                    id={`mi-${key}`}
                                    aria-invalid={fieldState.invalid}
                                    placeholder={label}
                                  />
                                  {description && (
                                    <FieldDescription>
                                      {String(description)}
                                    </FieldDescription>
                                  )}
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                          );
                        }
                      )}
                  </FieldGroup>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/classifiers')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedModelId}>
            Create Classifier
          </Button>
        </div>
      </form>
    </div>
  );
}

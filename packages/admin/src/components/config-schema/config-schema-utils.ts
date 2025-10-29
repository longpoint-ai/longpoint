import { ConfigSchema } from '@longpoint/devkit';
import { UseFormSetError } from 'react-hook-form';

export function getDefaultValueForType(value: any): any {
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

export function validateFieldAgainstSchema(
  schemaValue: any,
  fieldValue: any,
  path: string,
  setError: UseFormSetError<any>
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
      setError(path as any, {
        type: 'required',
        message: `${label} is required`,
      });
    }
  } else if (t === 'number') {
    const num =
      typeof fieldValue === 'number' ? fieldValue : Number(fieldValue);
    if (isRequired && !Number.isFinite(num)) {
      ok = false;
      setError(path as any, {
        type: 'required',
        message: `${label} must be a number`,
      });
    }
  } else if (t === 'boolean') {
    if (isRequired && typeof fieldValue !== 'boolean') {
      ok = false;
      setError(path as any, {
        type: 'required',
        message: `${label} is required`,
      });
    }
  } else if (t === 'object') {
    if (isRequired && (fieldValue === undefined || fieldValue === null)) {
      ok = false;
      setError(path as any, {
        type: 'required',
        message: `${label} is required`,
      });
    }
    const properties = schemaValue?.properties || {};
    Object.entries(properties).forEach(([key, propSchema]: [string, any]) => {
      const childValue = fieldValue?.[key];
      const childOk = validateFieldAgainstSchema(
        propSchema,
        childValue,
        `${path}.${key}`,
        setError
      );
      if (!childOk) ok = false;
    });
  } else if (t === 'array') {
    const minLen = Number(schemaValue?.minLength ?? (isRequired ? 1 : 0));
    if (!Array.isArray(fieldValue)) {
      if (isRequired) {
        ok = false;
        setError(path as any, {
          type: 'required',
          message: `${label} must be an array`,
        });
      }
    } else {
      if (fieldValue.length < minLen) {
        ok = false;
        setError(path as any, {
          type: 'min',
          message: `${label} requires at least ${minLen} item(s)`,
        });
      }
      const itemSchema = schemaValue?.items || {};
      fieldValue.forEach((item: any, index: number) => {
        const childOk = validateFieldAgainstSchema(
          itemSchema,
          item,
          `${path}.${index}`,
          setError
        );
        if (!childOk) ok = false;
      });
    }
  }
  return ok;
}

export function validateConfigSchema(
  schema: ConfigSchema | undefined,
  values: any,
  namePrefix: string,
  setError: UseFormSetError<any>
): boolean {
  if (!schema) return true;
  let ok = true;
  Object.entries(schema).forEach(([key, value]: [string, any]) => {
    const path = namePrefix ? `${namePrefix}.${key}` : key;
    const childOk = validateFieldAgainstSchema(
      value,
      values?.[key],
      path,
      setError
    );
    if (!childOk) ok = false;
  });
  return ok;
}

export interface ConfigSchema {
  [key: string]: {
    label: string;
    type: string;
    required?: boolean;
    description?: string;
    minLength?: number;
    maxLength?: number;
    items?: {
      type: string;
      properties?: ConfigSchema;
      minLength?: number;
      maxLength?: number;
    };
    properties?: ConfigSchema;
  };
}

export type ConfigValues<
  T extends ConfigSchema | undefined = Record<string, any>
> = T extends ConfigSchema
  ? {
      [K in keyof T]: T[K]['type'] extends 'string' | 'secret'
        ? string
        : T[K]['type'] extends 'number'
        ? number
        : T[K]['type'] extends 'boolean'
        ? boolean
        : T[K]['type'] extends 'array'
        ? any[]
        : T[K]['type'] extends 'object'
        ? Record<string, any>
        : any;
    }
  : Record<string, any>;

export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export interface ConfigSchema {
  [key: string]: {
    label: string;
    type: string;
    required?: boolean;
    description?: string;
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

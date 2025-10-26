import { ConfigValues, JsonObject } from './config-schema.js';

export interface ClassifyArgs<T extends ConfigValues = ConfigValues> {
  url: string;
  modelConfig: T;
}

export interface Classify {
  classify(args: ClassifyArgs): Promise<JsonObject>;
}

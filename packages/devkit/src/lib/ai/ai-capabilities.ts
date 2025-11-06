import { ConfigValues } from '@longpoint/config-schema';
import { JsonObject } from '@longpoint/types';

export interface ClassifyArgs<T extends ConfigValues = ConfigValues> {
  url: string;
  modelConfig: T;
}

export interface Classify {
  classify(args: ClassifyArgs): Promise<JsonObject>;
}

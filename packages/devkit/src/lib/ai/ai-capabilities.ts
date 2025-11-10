import { ConfigValues } from '@longpoint/config-schema';
import { JsonObject } from '@longpoint/types';
import { AssetSource } from '../types/asset.js';

export interface ClassifyArgs<T extends ConfigValues = ConfigValues> {
  source: AssetSource;
  modelConfig: T;
}

export interface Classify {
  classify(args: ClassifyArgs): Promise<JsonObject>;
}

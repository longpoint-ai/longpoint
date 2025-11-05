import { Injectable } from '@nestjs/common';
import { Config, createConfig, validateEnv } from './env.config';

type DotNotation<T extends object, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends any[]
      ? `${Prefix}${K & string}`
      : DotNotation<T[K], `${Prefix}${K & string}.`>
    : `${Prefix}${K & string}`;
}[keyof T] extends infer U
  ? U extends string
    ? U
    : never
  : never;

type DeepGet<T, K extends string> = K extends keyof T
  ? T[K]
  : K extends `${infer F}.${infer R}`
  ? F extends keyof T
    ? DeepGet<T[F], R>
    : never
  : never;

@Injectable()
export class ConfigService {
  private readonly config: Config;

  constructor() {
    const input = validateEnv();
    this.config = createConfig(input);
  }

  get<K extends DotNotation<Config> & string>(path: K): DeepGet<Config, K> {
    const keys = path.split('.');
    let result: unknown = this.config;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = (result as Record<string, unknown>)[key];
      } else {
        throw new Error(`Config path '${path}' not found`);
      }
    }

    return result as DeepGet<Config, K>;
  }
}

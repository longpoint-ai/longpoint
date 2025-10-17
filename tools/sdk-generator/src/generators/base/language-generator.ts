import { OpenAPISpec } from '../../parsers/types';
import { GeneratedFiles, GeneratorConfig } from './types';

export abstract class LanguageGenerator {
  abstract name: string;
  abstract generate(
    spec: OpenAPISpec,
    config: GeneratorConfig
  ): GeneratedFiles | Promise<GeneratedFiles>;
}

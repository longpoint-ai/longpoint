import { LanguageGenerator } from './generators/base/language-generator';
import { GeneratedFiles, GeneratorConfig } from './generators/base/types';
import { TypeScriptGenerator } from './generators/typescript/client-generator';
import { OpenAPISpec } from './parsers/types';

export class SDKGenerator {
  private generators: Map<string, LanguageGenerator> = new Map();

  constructor() {
    this.registerGenerator(new TypeScriptGenerator());
  }

  registerGenerator(generator: LanguageGenerator): void {
    this.generators.set(generator.name, generator);
  }

  async generate(
    target: string,
    spec: OpenAPISpec,
    config: GeneratorConfig
  ): Promise<GeneratedFiles> {
    const generator = this.generators.get(target);
    if (!generator) {
      throw new Error(`Unknown target: ${target}`);
    }
    return await generator.generate(spec, config);
  }

  getAvailableTargets(): string[] {
    return Array.from(this.generators.keys());
  }
}

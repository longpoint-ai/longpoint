#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { LanguageGenerator } from './generators/base/language-generator';
import { GeneratedFiles, GeneratorConfig } from './generators/base/types';
import { TypeScriptGenerator } from './generators/typescript/client-generator';
import { OpenAPIParser } from './parsers/openapi-parser';
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

// CLI functionality
export async function generateSDK(
  target: string = 'typescript',
  specUrl: string = 'http://localhost:3000/docs-json',
  outputDir?: string
): Promise<void> {
  try {
    console.log(`📡 Fetching OpenAPI spec from ${specUrl}...`);
    const response = await fetch(specUrl);
    const spec = (await response.json()) as OpenAPISpec;

    console.log('🔍 Parsing operations...');
    const parser = new OpenAPIParser(spec);
    const operations = parser.parseOperations();

    console.log(`📝 Found ${operations.length} operations:`);
    operations.forEach((op) => {
      console.log(`  - ${op.tag}.${op.operationId} (${op.method} ${op.path})`);
    });

    console.log(`⚡ Generating ${target} SDK...`);
    const generator = new SDKGenerator();
    const files = await generator.generate(target, spec, {
      packageName: '@longpoint/sdk',
      version: '0.1.0',
      description: 'TypeScript SDK for the Longpoint API',
    });

    if (outputDir) {
      for (const [filename, content] of Object.entries(files)) {
        const filePath = path.join(outputDir, filename);
        const dir = path.dirname(filePath);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, content);
        console.log(`📁 Generated: ${filename}`);
      }
    } else {
      console.log('📋 Generated files:');
      Object.keys(files).forEach((filename) => {
        console.log(`  - ${filename}`);
      });
    }

    console.log('✅ SDK generated successfully!');
  } catch (error) {
    console.error('❌ Error generating SDK:', error);
    process.exit(1);
  }
}

// CLI entry point
if (require.main === module) {
  const target = process.argv[2] || 'typescript';
  const specUrl = process.argv[3] || 'http://localhost:3000/docs-json';
  const outputDir = process.argv[4];

  generateSDK(target, specUrl, outputDir);
}

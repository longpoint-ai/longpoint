import { execSync } from 'child_process';
import { unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { OpenAPISpec } from '../../parsers/types';

export class TypeScriptTypeGenerator {
  async generateTypes(spec: OpenAPISpec): Promise<string> {
    try {
      // Create a temporary file for the OpenAPI spec
      const tempSpecPath = join(tmpdir(), `openapi-spec-${Date.now()}.json`);
      const tempTypesPath = join(tmpdir(), `types-${Date.now()}.ts`);

      try {
        // Write the spec to a temporary file
        writeFileSync(tempSpecPath, JSON.stringify(spec, null, 2));

        // Use openapi-typescript CLI to generate types
        execSync(
          `npx openapi-typescript "${tempSpecPath}" -o "${tempTypesPath}" --alphabetize`,
          {
            stdio: 'pipe',
          }
        );

        // Read the generated types
        const types = require('fs').readFileSync(tempTypesPath, 'utf8');

        return types;
      } finally {
        // Clean up temporary files
        try {
          unlinkSync(tempSpecPath);
          unlinkSync(tempTypesPath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    } catch (error) {
      console.error('Error generating types:', error);
      throw new Error(`Failed to generate TypeScript types: ${error}`);
    }
  }
}

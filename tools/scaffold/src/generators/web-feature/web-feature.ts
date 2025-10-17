import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { libraryGenerator as reactLibraryGenerator } from '@nx/react';
import { WebFeatureGeneratorSchema } from './schema';

export async function webFeatureGenerator(
  tree: Tree,
  options: WebFeatureGeneratorSchema
) {
  const projectRoot = `libs/web/features/${options.name}`;
  await reactLibraryGenerator(tree, {
    directory: projectRoot,
    importPath: `@longpoint/web-feature-${options.name}`,
    linter: 'eslint',
    style: 'tailwind',
    bundler: 'none',
    unitTestRunner: 'vitest',
    component: false,
  });

  const componentName = options.name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    name: componentName,
    originalName: options.name,
  });

  await formatFiles(tree);
}

export default webFeatureGenerator;

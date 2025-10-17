import {
  formatFiles,
  generateFiles,
  installPackagesTask,
  OverwriteStrategy,
  Tree,
} from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import * as path from 'path';
import { GenericGeneratorSchema } from './schema';

export async function genericGenerator(
  tree: Tree,
  options: GenericGeneratorSchema
) {
  const name = options.name;
  const pluralName = options.pluralName ?? `${name}s`;
  const packageName =
    options.scope === 'shared' ? pluralName : `${options.scope}-${pluralName}`;
  const projectRoot = `libs/${options.scope}/${pluralName}`;

  await libraryGenerator(tree, {
    directory: projectRoot,
    importPath: `@longpoint/${packageName}`,
    linter: 'eslint',
    bundler: 'none',
    unitTestRunner: options.includeTests ? 'jest' : 'none',
    useProjectJson: false,
    minimal: true,
  });

  // Remove default source files created by libraryGenerator
  const defaultFiles = [
    `${projectRoot}/src/lib/${pluralName}.ts`,
    `${projectRoot}/src/lib/${pluralName}.spec.ts`,
  ];

  // Only delete files that exist
  defaultFiles.forEach((file) => {
    if (tree.exists(file)) {
      tree.delete(file);
    }
  });

  // Generate custom template files
  generateFiles(
    tree,
    path.join(__dirname, options.includeTests ? 'filesWithTests' : 'files'),
    projectRoot,
    {
      name,
      pluralName,
      packageName:
        options.scope === 'shared'
          ? pluralName
          : `${options.scope}-${pluralName}`,
    },
    { overwriteStrategy: OverwriteStrategy.Overwrite }
  );

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree, true);
  };
}

export default genericGenerator;

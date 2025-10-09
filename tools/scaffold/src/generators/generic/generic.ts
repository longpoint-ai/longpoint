import {
  formatFiles,
  generateFiles,
  installPackagesTask,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { GenericGeneratorSchema } from './schema';

export async function genericGenerator(
  tree: Tree,
  options: GenericGeneratorSchema
) {
  const name = options.name;
  const pluralName = options.pluralName ?? `${name}s`;
  const projectRoot = `libs/${options.scope}/${pluralName}`;

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    name,
    pluralName,
    packageName:
      options.scope === 'shared'
        ? pluralName
        : `${options.scope}-${pluralName}`,
  });

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree, true);
  };
}

export default genericGenerator;

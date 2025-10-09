import {
  formatFiles,
  generateFiles,
  Tree,
  installPackagesTask,
} from '@nx/devkit';
import * as path from 'path';
import { ApiFeatureGeneratorSchema } from './schema';
import { strings } from '@longpoint/utils';

export async function apiFeatureGenerator(
  tree: Tree,
  options: ApiFeatureGeneratorSchema
) {
  const projectRoot = `libs/api/features/${options.name}`;
  const camelCaseName = strings.camelCase(options.name);
  const pascalCaseName = strings.pascalCase(options.name);

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    fileName: options.name,
    serviceName: `${pascalCaseName}Service`,
    controllerName: `${pascalCaseName}Controller`,
    serviceVariableName: `${camelCaseName}Service`,
    moduleName: `${pascalCaseName}Module`,
  });

  updateAppModule(tree, pascalCaseName);

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree, true);
  };
}

function updateAppModule(tree: Tree, moduleName: string) {
  const appModulePath = 'apps/api/src/app.module.ts';

  if (!tree.exists(appModulePath)) {
    console.warn(`App module not found at ${appModulePath}`);
    return;
  }

  const appModuleContent = tree.read(appModulePath, 'utf-8');
  if (!appModuleContent) {
    console.warn(`Could not read app module content`);
    return;
  }

  // Check if the module is already imported
  if (appModuleContent.includes(`${moduleName}Module`)) {
    console.log(`${moduleName}Module is already imported in app.module.ts`);
    return;
  }

  // Add import statement
  const featureName = moduleName.replace('Module', '');
  const kebabCaseName = featureName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  const importStatement = `import { ${moduleName}Module } from '@longpoint/api-feature-${kebabCaseName}';`;

  // Find the import section and add the new import
  const lines = appModuleContent.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, importStatement);
  } else {
    // If no imports found, add after the first line
    lines.splice(1, 0, importStatement);
  }

  // Add module to imports array
  const updatedContent = lines.join('\n');
  const finalContent = updatedContent.replace(
    /imports:\s*\[([\s\S]*?)\]/,
    (match, imports) => {
      const cleanImports = imports.trim();
      if (cleanImports.endsWith(',')) {
        return `imports: [\n    ${cleanImports}\n    ${moduleName}Module,\n  ]`;
      } else if (cleanImports) {
        return `imports: [\n    ${cleanImports},\n    ${moduleName}Module,\n  ]`;
      } else {
        return `imports: [\n    ${moduleName}Module,\n  ]`;
      }
    }
  );

  tree.write(appModulePath, finalContent);
}

export default apiFeatureGenerator;

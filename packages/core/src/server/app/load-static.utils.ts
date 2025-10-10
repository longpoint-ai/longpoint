import { ServeStaticModule } from '@nestjs/serve-static';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { DynamicModule } from '@nestjs/common';

function findNodeModulesPath(startPath: string): string | null {
  let currentPath = startPath;

  while (currentPath !== dirname(currentPath)) {
    const nodeModulesPath = join(currentPath, 'node_modules');
    if (existsSync(nodeModulesPath)) {
      return nodeModulesPath;
    }
    currentPath = dirname(currentPath);
  }

  return null;
}

export function getStaticModule(): DynamicModule {
  const nodeModulesPath = findNodeModulesPath(__dirname);

  let adminDistPath: string;

  if (!nodeModulesPath) {
    // Fallback to process.cwd() if we can't find node_modules
    adminDistPath = join(
      process.cwd(),
      'node_modules',
      '@longpoint',
      'admin',
      'dist'
    );
  } else {
    adminDistPath = join(nodeModulesPath, '@longpoint', 'admin', 'dist');
  }

  const adminAvailable = existsSync(adminDistPath);

  if (adminAvailable) {
    return ServeStaticModule.forRoot({
      rootPath: adminDistPath,
      serveRoot: '/',
      exclude: ['/api*'],
    });
  }

  return ServeStaticModule.forRoot({
    rootPath: join(__dirname, 'assets'),
    serveRoot: '/',
    exclude: ['/api*'],
  });
}

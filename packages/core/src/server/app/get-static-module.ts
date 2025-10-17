import { DynamicModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { dirname, join } from 'path';

export function getStaticModule(): DynamicModule {
  const serveStaticConfigs = [];

  // ------------------------------------------------------------
  // Admin UI setup
  // ------------------------------------------------------------
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
    serveStaticConfigs.push({
      rootPath: adminDistPath,
      serveRoot: '/',
      exclude: ['/api*', '/storage*'],
    });
  } else {
    serveStaticConfigs.push({
      rootPath: join(__dirname, 'assets'),
      serveRoot: '/',
      exclude: ['/api*', '/storage*'],
    });
  }

  // ------------------------------------------------------------

  // Storage directory configuration for local storage provider
  const storageBasePath = join(process.cwd(), 'data', 'storage');
  if (existsSync(storageBasePath)) {
    serveStaticConfigs.push({
      rootPath: storageBasePath,
      serveRoot: '/storage',
    });
  }

  return ServeStaticModule.forRoot(...serveStaticConfigs);
}

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

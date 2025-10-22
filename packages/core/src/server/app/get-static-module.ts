import { findPackagePath } from '@longpoint/utils/path';
import { DynamicModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';

export function getStaticModule(): DynamicModule {
  const serveStaticConfigs = [];

  // ------------------------------------------------------------
  // Admin UI setup
  // ------------------------------------------------------------
  let adminPackagePath = findPackagePath('@longpoint/admin', __dirname);
  let adminDistPath: string | null = null;
  if (!adminPackagePath) {
    adminPackagePath = findPackagePath('@longpoint/admin', process.cwd());
    if (adminPackagePath) {
      adminDistPath = join(adminPackagePath, 'dist');
    }
  } else {
    adminDistPath = join(adminPackagePath, 'dist');
  }

  if (adminDistPath) {
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

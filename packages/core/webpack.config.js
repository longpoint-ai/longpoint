const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },
  ignoreWarnings: [
    // Ignore sourcemap warnings for Prisma client
    /Failed to parse source map from.*prisma.*\.js\.map/,
    /Failed to parse source map from.*prisma.*runtime.*\.js\.map/,
  ],
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/server/main.ts',
      tsConfig: './tsconfig.app.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
    }),
    new CopyPlugin({
      patterns: [
        // Prisma engines
        {
          from: join(__dirname, './src/database/generated/prisma/*.node'),
          to: 'generated/prisma/[name][ext]',
        },
        // Prisma schema
        {
          from: join(
            __dirname,
            './src/database/generated/prisma/schema.prisma'
          ),
          to: 'generated/prisma/schema.prisma',
        },
        // static assets
        {
          from: join(__dirname, './src/admin-placeholder'),
          to: 'assets',
        },
      ],
    }),
  ],
};

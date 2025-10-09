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
  ignoreWarnings: [
    // Ignore sourcemap warnings for Prisma client
    /Failed to parse source map from.*prisma.*\.js\.map/,
    /Failed to parse source map from.*prisma.*runtime.*\.js\.map/,
  ],
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
    }),
    // Copy the prisma schema and the prisma engine to the dist folder
    new CopyPlugin({
      patterns: [
        {
          from: join(
            __dirname,
            '../../libs/db/generated/prisma/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node'
          ),
          to: 'generated/prisma/libquery_engine-linux-musl-arm64-openssl-3.0.x.so.node',
        },
        {
          from: join(__dirname, '../../libs/db/generated/prisma/schema.prisma'),
          to: 'generated/prisma/schema.prisma',
        },
      ],
    }),
  ],
};

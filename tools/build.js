#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, cwd = process.cwd()) {
  try {
    execSync(command, {
      cwd,
      encoding: 'utf8',
    });
    return true;
  } catch (error) {
    log(`Command failed: ${command}`, 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Starting Longpoint build process...', 'blue');

  const projectRoot = process.cwd();
  const webAppDir = path.join(projectRoot, 'apps', 'web');
  const apiAppDir = path.join(projectRoot, 'apps', 'api');
  const apiAssetsDir = path.join(apiAppDir, 'src', 'assets');

  log(`Project root: ${projectRoot}`, 'green');

  // Step 1: Build the web app
  log('Building web app...', 'green');
  if (!execCommand('npx nx build web', webAppDir)) {
    log('Failed to build web app', 'red');
    process.exit(1);
  }

  // Step 2: Copy web build to API assets
  log('Copying web build to API assets...', 'green');

  // Remove existing assets (these are generated files, not committed to git)
  if (fs.existsSync(apiAssetsDir)) {
    fs.rmSync(apiAssetsDir, { recursive: true, force: true });
  }

  // Create assets directory (this will be ignored by git)
  fs.mkdirSync(apiAssetsDir, { recursive: true });

  // Copy web build to API assets
  const webDistDir = path.join(webAppDir, 'dist');
  if (fs.existsSync(webDistDir)) {
    const files = fs.readdirSync(webDistDir);
    files.forEach((file) => {
      const srcPath = path.join(webDistDir, file);
      const destPath = path.join(apiAssetsDir, file);
      if (fs.statSync(srcPath).isDirectory()) {
        fs.cpSync(srcPath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
    log('Web assets copied to API', 'green');
  } else {
    log('Web build directory not found', 'red');
    process.exit(1);
  }

  // Step 3: Build the API
  log('Building API...', 'green');
  if (!execCommand('npx nx build api', apiAppDir)) {
    log('Failed to build API', 'red');
    process.exit(1);
  }

  log('✅ Build process completed successfully!', 'green');
  log('📁 Web assets are now available in API', 'green');
  log(
    '🌐 You can now run the API server to serve both the web app and API',
    'green'
  );

  // Show how to run the server
  log('\nTo start the server, run:', 'blue');
  log('  npm run serve:api', 'yellow');
  log('\nThe web app will be available at: http://localhost:3000', 'blue');
  log('The API will be available at: http://localhost:3000/api', 'blue');
}

if (require.main === module) {
  main();
}

module.exports = { main };

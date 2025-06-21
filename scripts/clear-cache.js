#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively delete directory
function deleteFolderRecursive(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.rmSync(directoryPath, { recursive: true, force: true });
    console.log(`✓ Deleted: ${directoryPath}`);
  }
}

console.log('🧹 Clearing Next.js cache and build artifacts...\n');

const projectRoot = path.resolve(__dirname, '..');

// Clear Next.js cache
deleteFolderRecursive(path.join(projectRoot, '.next'));

// Clear node_modules/.cache if it exists
deleteFolderRecursive(path.join(projectRoot, 'node_modules', '.cache'));

// Clear TypeScript build info
const tsBuildInfoPath = path.join(projectRoot, 'tsconfig.tsbuildinfo');
if (fs.existsSync(tsBuildInfoPath)) {
  fs.unlinkSync(tsBuildInfoPath);
  console.log(`✓ Deleted: ${tsBuildInfoPath}`);
}

console.log('\n✨ Cache cleared successfully!');
console.log('💡 You can now run "npm run dev" to start fresh.');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🛑 Edit this to your actual WP blocks directory:
const wpBlocksDir = '/SM_DATA/sm_hosting/word4ya_net/public_html/wp-content/themes/word4ya/cm-blocks';

// Core copy helper
function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Copied: ${destPath}`);
    }
  }
}

// Main injection function
export function injectBlockToWP(blockSlug) {
  const sourceDir = path.join(__dirname, '..', 'output', blockSlug);
  const targetDir = path.join(wpBlocksDir, blockSlug);

  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Source folder ${sourceDir} does not exist.`);
    return;
  }

  copyRecursiveSync(sourceDir, targetDir);
  console.log(`🚀 Block '${blockSlug}' injected into WordPress.`);
}


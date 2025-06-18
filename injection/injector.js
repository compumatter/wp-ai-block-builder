import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Utility to recursively copy directory with full logging
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      console.log(`📂 Creating directory: ${dest}`);
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      const srcPath = path.join(src, childItemName);
      const destPath = path.join(dest, childItemName);
      copyRecursiveSync(srcPath, destPath);
    });
  } else {
    console.log(`📄 Copying file: ${src} --> ${dest}`);
    try {
      fs.copyFileSync(src, dest);
    } catch (err) {
      console.error(`❌ Failed to copy file: ${src} → ${dest}`);
      console.error(err);
    }
  }
}

// Hardened injection function
export function injectBlock(blockSlug) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const sourceDir = path.resolve(__dirname, '..', 'output', blockSlug);
  const wpTargetDir = path.resolve('/SM_DATA/sm_hosting/word4ya_net/public_html/wp-content/themes/word4ya/cm-blocks', blockSlug);

  console.log(`🔎 Source: ${sourceDir}`);
  console.log(`🔎 Target: ${wpTargetDir}`);

  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Source folder ${sourceDir} does not exist.`);
    return;
  }

  // Ensure destination parent exists
  const wpTargetParent = path.dirname(wpTargetDir);
  if (!fs.existsSync(wpTargetParent)) {
    console.error(`❌ Target parent folder ${wpTargetParent} does not exist.`);
    return;
  }

  // Create target block folder if missing
  if (!fs.existsSync(wpTargetDir)) {
    console.log(`📂 Creating target block directory: ${wpTargetDir}`);
    fs.mkdirSync(wpTargetDir, { recursive: true });
  }

  console.log(`🚀 Injecting block '${blockSlug}'...`);
  copyRecursiveSync(sourceDir, wpTargetDir);
  console.log(`✅ Injection complete: '${blockSlug}' successfully copied.`);
}




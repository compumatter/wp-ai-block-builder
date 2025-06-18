import fs from 'fs';
import path from 'path';

export function writeBlockToFilesystem(parsedBlock) {
  const outputDir = path.join(
    path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'output'),
    parsedBlock.blockJson.name.replace('/', '-')
  );

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outputDir, 'block.json'), JSON.stringify(parsedBlock.blockJson, null, 2));
  fs.writeFileSync(path.join(outputDir, 'render.php'), parsedBlock.phpCode);
  fs.writeFileSync(path.join(outputDir, 'editor.js'), parsedBlock.editorJs);
  fs.writeFileSync(path.join(outputDir, 'centralized.js'), parsedBlock.centralizedJs);
  fs.writeFileSync(path.join(outputDir, 'centralized.css'), parsedBlock.centralizedCss);
  fs.writeFileSync(path.join(outputDir, 'config.php'), parsedBlock.configPhp);
  fs.writeFileSync(path.join(outputDir, 'registering.php'), parsedBlock.registeringPhp);
}


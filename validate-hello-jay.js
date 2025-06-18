import fs from 'fs';
import path from 'path';

// Import our validation function
import { parseAIResponse } from './ai/blockParser.js';

// Read the generated hello-jay block files
const blockDir = './output/cm-hello-jay';
const testBlock = {
  blockJson: JSON.parse(fs.readFileSync(path.join(blockDir, 'block.json'), 'utf8')),
  configPhp: fs.readFileSync(path.join(blockDir, 'config.php'), 'utf8'),
  registeringPhp: fs.readFileSync(path.join(blockDir, 'registering.php'), 'utf8'),
  phpCode: fs.readFileSync(path.join(blockDir, 'render.php'), 'utf8'),
  editorJs: fs.readFileSync(path.join(blockDir, 'editor.js'), 'utf8'),
  centralizedJs: fs.readFileSync(path.join(blockDir, 'centralized.js'), 'utf8'),
  centralizedCss: fs.readFileSync(path.join(blockDir, 'centralized.css'), 'utf8')
};

// Create a mock AI response format for validation
const mockAIResponse = `
---
BLOCK_JSON
${JSON.stringify(testBlock.blockJson, null, 2)}
---
CONFIG_PHP
${testBlock.configPhp}
---
REGISTERING_PHP
${testBlock.registeringPhp}
---
PHP_RENDER_CALLBACK
${testBlock.phpCode}
---
EDITOR_JS
${testBlock.editorJs}
---
CENTRALIZED_JS
${testBlock.centralizedJs}
---
CENTRALIZED_CSS
${testBlock.centralizedCss}
---
`;

console.log('🔍 VALIDATING CM-HELLO-JAY BLOCK');
console.log('=================================');
console.log('');
console.log('Testing newly generated cm-hello-jay block against SSOT requirements...');
console.log('');

try {
  // This will run our validation system
  parseAIResponse(mockAIResponse);
  console.log('');
  console.log('✅ Validation completed - check output above for compliance status');
} catch (error) {
  console.log('❌ Validation failed:', error.message);
}
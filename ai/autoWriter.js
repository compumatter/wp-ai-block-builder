import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseAIResponse } from './blockParser.js';
import { writeBlockToFilesystem } from './blockWriter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Writer function: converts orchestrator object into real files with validation
export function writeFullBlockToFilesystem(blockSlug, orchestratorOutput) {
  console.log(`🔧 Processing ${blockSlug} through validation pipeline...`);
  
  // Convert orchestrator format to AI response format for validation
  const mockAIResponse = createMockAIResponse(orchestratorOutput);
  
  // Route through existing validation pipeline (blockParser.js)
  const validatedBlock = parseAIResponse(mockAIResponse);
  
  // Use existing validated file writer (blockWriter.js)
  writeBlockToFilesystem(validatedBlock);
  
  console.log(`✅ ${blockSlug} validated and written with SSOT compliance`);
}

// Convert orchestrator output format to AI response format for blockParser.js
function createMockAIResponse(orchestratorOutput) {
  const sections = [
    'BLOCK_JSON',
    'CONFIG_PHP', 
    'REGISTERING_PHP',
    'PHP_RENDER_CALLBACK',
    'EDITOR_JS',
    'CENTRALIZED_JS',
    'CENTRALIZED_CSS'
  ];
  
  let mockResponse = '';
  
  for (const section of sections) {
    if (orchestratorOutput[section]) {
      // Clean any existing markdown fences before adding our own
      const cleanContent = orchestratorOutput[section]
        .replace(/^```[a-z]*\n?/i, '')
        .replace(/```$/, '')
        .trim();
      
      mockResponse += `---\n${section}\n${cleanContent}\n`;
    } else {
      console.warn(`⚠️ Missing section: ${section}`);
    }
  }
  
  mockResponse += '---\n';
  
  return mockResponse;
}


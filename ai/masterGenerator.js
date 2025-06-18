import { callClaude } from './aiCaller.js';
import { buildSectionPrompt } from './sectionPrompt.js';

const sectionList = [
  "BLOCK_JSON",
  "PHP_RENDER_CALLBACK",
  "EDITOR_JS",
  "CENTRALIZED_JS",
  "CENTRALIZED_CSS",
  "CONFIG_PHP",
  "REGISTERING_PHP"
];

// Helper: strip any markdown code fences from Claude output
function cleanSectionContent(rawContent) {
  return rawContent
    .replace(/^```[a-z]*\n?/i, '')  // remove leading code fence if present
    .replace(/```$/, '')            // remove trailing code fence if present
    .trim();
}

// Full master orchestrator function
export async function generateFullBlock(spec, blockSlug = null) {
  const result = {};

  for (const section of sectionList) {
    const prompt = buildSectionPrompt(section, spec, blockSlug);
    const rawOutput = await callClaude(prompt);
    const cleaned = cleanSectionContent(rawOutput);
    result[section] = cleaned;
  }

  return result;
}


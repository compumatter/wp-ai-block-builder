import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to reference cm-hello-world implementation
const REFERENCE_PATH = path.join(__dirname, '..', 'cm-blocks', 'cm-hello-world');

export function buildSectionPrompt(section, spec, blockSlug = null) {
  const blockName = blockSlug ? `cm/${blockSlug}` : 'cm/your-block-slug';
  
  return `
You are an expert WordPress Full Site Editing developer. Generate ${section} by following this EXACT REFERENCE PATTERN from the working cm-hello-world implementation:

${getReferenceExample(section, blockName, blockSlug)}

USER REQUEST: ${spec}
BLOCK NAME: ${blockName}

TASK: Create ${section} that follows the reference pattern EXACTLY. Only change:
- Block-specific names (hello-world → ${blockSlug || 'your-block'})
- Block-specific functionality based on user request
- Keep all SSOT architecture patterns identical

Your response MUST contain ONLY the raw code. No explanations, no markdown fences.
`;
}

function getReferenceExample(section, blockName, blockSlug) {
  try {
    const refPath = REFERENCE_PATH;
    
    switch (section) {
      case 'BLOCK_JSON':
        const blockJson = readFileSync(path.join(refPath, 'block.json'), 'utf8');
        return `REFERENCE cm-hello-world block.json:\n${blockJson}\n\nFollow this structure exactly, replacing hello-world with ${blockSlug || 'your-block'}.`;
        
      case 'REGISTERING_PHP':
        const registeringPhp = readFileSync(path.join(refPath, 'registering.php'), 'utf8');
        return `REFERENCE cm-hello-world registering.php:\n${registeringPhp}\n\nUse this EXACT pattern - all Config class calls, asset registration, and hooks.`;
        
      case 'CONFIG_PHP':
        const configPhp = readFileSync(path.join(refPath, 'config.php'), 'utf8');
        return `REFERENCE cm-hello-world config.php (first 100 lines):\n${configPhp.split('\n').slice(0, 100).join('\n')}\n\nImplement ALL these methods with the same structure.`;
        
      default:
        return getSectionSpecificRequirements(section, blockName, blockSlug);
    }
  } catch (error) {
    console.warn(`Could not load reference file: ${error.message}`);
    return getSectionSpecificRequirements(section, blockName, blockSlug);
  }
}

function getSectionSpecificRequirements(section, blockName = 'cm/your-block-slug', blockSlug = 'your-block-slug') {
  switch (section) {
    case 'BLOCK_JSON':
      return `
MANDATORY STRUCTURE - DO NOT OMIT ANY FIELD:

{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "${blockName}",
  "title": "CM [Descriptive Title]", 
  "category": "cm-blocks",
  "keywords": ["cm", "relevant-term", "another-term"],
  "textdomain": "cm-${blockSlug}",
  "attributes": {
    "isExample": { "type": "boolean", "default": false },
    // add block-specific attributes here
  },
  "example": { "attributes": { "isExample": true } },
  "supports": { "html": false, "align": true, "anchor": true, "customClassName": true },
  "editorScript": "file:./editor.js",
  "editorStyle": "file:./centralized.css",
  "style": "cm-${blockSlug}-centralized-css",
  "viewScript": "cm-${blockSlug}-centralized-js",
  "render": "file:./render.php"
}

CRITICAL: 
- Use exact block name "${blockName}" in "name" field
- editorScript MUST be "file:./editor.js" (not index.js)
- editorStyle MUST be "file:./centralized.css" (not index.css)
- Include "attributes" field with isExample at minimum`;

    case 'CONFIG_PHP':
      return `
- MUST implement CM_[Block_Name]_Config class
- Include all required static methods: get_defaults(), get_asset_handles(), get_file_paths(), sanitize_attributes(), get_enhanced_wrapper_classes(), build_global_css_properties(), get_javascript_constants(), get_css_selectors()
- Asset handles must follow "cm-${blockSlug}-[asset-type]" pattern
- File paths must point to /cm-blocks/cm-${blockSlug}/ directory
- Include isExample: false in defaults
- CRITICAL: get_javascript_constants() must return:
  {
    'blockName' => '${blockName}',
    'blockTitle' => __('CM [Title]', 'cm-${blockSlug}'),
    'blockDescription' => __('[Description]', 'cm-${blockSlug}'),
    'selectors' => array(
      'wrapper' => '.cm-${blockSlug}',
      'button' => '.cm-${blockSlug}__button'
    )
  }
- Implement proper attribute sanitization`;

    case 'REGISTERING_PHP':
      return `
CRITICAL: Use SSOT Config class pattern with these EXACT method calls:

$asset_handles = CM_[Block_Name]_Config::get_asset_handles();
$file_paths = CM_[Block_Name]_Config::get_file_paths();
$js_constants = CM_[Block_Name]_Config::get_javascript_constants();

MANDATORY STRUCTURE:
- Include config.php with require_once
- Call Config class methods (shown above) - NOT cm_[slug]_get_config()
- Register editor script using $asset_handles['editor_script']
- Register view script using $asset_handles['view_script'] 
- Register style using $asset_handles['style']
- Use $file_paths['url'] and $file_paths['dir'] for paths
- Use filemtime($file_paths['dir'] . 'filename') for cache-busting
- Use wp_localize_script() with $js_constants
- Register block: register_block_type($file_paths['dir'] . 'block.json')
- Block name for has_block() must be '${blockName}' exactly
- Function names: cm_[slug]_register_all_assets() and cm_[slug]_enqueue_frontend_assets()

FORBIDDEN: Do NOT call cm_[slug]_get_config() - this function does not exist!`;

    case 'PHP_RENDER_CALLBACK':
      return `
CRITICAL: Must use proper namespace and array handling!

- Start with: namespace CompuMatter\\Blocks\\[BlockName];
- Include config.php with: require_once __DIR__ . '/config.php';
- Use CM_[Block_Name]_Config::sanitize_attributes() for input sanitization
- Use CM_[Block_Name]_Config::get_enhanced_wrapper_classes() for CSS classes (returns ARRAY)
- Convert wrapper classes: implode( ' ', $wrapper_classes ) when using in HTML
- Use CM_[Block_Name]_Config::build_global_css_properties() for inline styles
- Create button element: <button type="button" class="cm-${blockSlug}__button">
- Use dynamic name from attributes: $attributes['name'] ?? 'DefaultName'
- Proper escaping with esc_attr(), esc_html()
- Include data-block attribute for JavaScript targeting
- Function name: render_cm_${blockSlug}_block()`;

    case 'EDITOR_JS':
      return `
- MUST wrap entire code in IIFE: (function() { 'use strict'; ... })();
- Import config from window.cm[BlockName]Config (NO hardcoded defaults)
- Include configuration validation and fallback
- Use processAttributes() function to merge defaults
- Support isExample attribute for preview image display
- Use createElement() for all React elements
- Register block with save: () => null (server-side rendering)
- No duplicate registerBlockType calls`;

    case 'CENTRALIZED_JS':
      return `
- MUST wrap in IIFE with environment detection
- Import config from window.cm[BlockName]Config
- NO registerBlockType calls (editor.js handles registration)
- Implement frontend/FSE/editor environment detection
- Use CONFIG.selectors.wrapper for DOM queries
- Include proper initialization and mutation observers
- Environment-aware loading (DOMContentLoaded for frontend, MutationObserver for FSE)`;

    case 'CENTRALIZED_CSS':
      return `
- Use .cm-[block-slug] as main wrapper class
- Follow BEM naming conventions with cm- prefix
- Include CSS custom properties for dynamic styling
- Responsive design with mobile-first approach
- No hardcoded colors (use CSS custom properties)
- Include hover states and transitions where appropriate`;

    default:
      return 'Follow SSOT architecture patterns from cm-hello-world reference implementation.';
  }
}


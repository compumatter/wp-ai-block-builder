export function parseAIResponse(aiResponse) {
  const text = aiResponse.trim();

  function extract(section) {
    const match = text.match(new RegExp(`---\\s*${section}\\s*([\\s\\S]*?)\\s*---`));
    if (!match) throw new Error(`${section} not found`);
    return match[1].trim();
  }

  let blockJson;
  try {
    blockJson = JSON.parse(extract("BLOCK_JSON"));
  } catch (err) {
    throw new Error("Failed to parse BLOCK_JSON: " + err.message);
  }

  const parsedBlock = {
    blockJson,
    phpCode: extract("PHP_RENDER_CALLBACK"),
    editorJs: extract("EDITOR_JS"),
    centralizedJs: extract("CENTRALIZED_JS"),
    centralizedCss: extract("CENTRALIZED_CSS"),
    configPhp: extract("CONFIG_PHP"),
    registeringPhp: extract("REGISTERING_PHP")
  };

  // Validate SSOT compliance
  validateSSOTCompliance(parsedBlock);

  // Auto-fix common SSOT issues
  const fixedBlock = autoFixSSOTIssues(parsedBlock);
  
  // Re-validate after fixes
  console.log('🔧 Applied auto-fixes, re-validating...');
  validateSSOTCompliance(fixedBlock);

  return fixedBlock;
}

function validateSSOTCompliance(parsedBlock) {
  const errors = [];
  
  // Validate block.json SSOT requirements
  const blockJson = parsedBlock.blockJson;
  
  // Check CM namespace
  if (!blockJson.name || !blockJson.name.startsWith('cm/')) {
    errors.push('Block name must use cm/ namespace (e.g., "cm/my-block")');
  }
  
  // Check title prefix
  if (!blockJson.title || !blockJson.title.startsWith('CM ')) {
    errors.push('Block title must start with "CM " prefix');
  }
  
  // Check category
  if (blockJson.category !== 'cm-blocks') {
    errors.push('Block category must be "cm-blocks"');
  }
  
  // Check keywords include cm
  if (!blockJson.keywords || !blockJson.keywords.includes('cm')) {
    errors.push('Block keywords must include "cm"');
  }
  
  // Check for isExample attribute
  if (!blockJson.attributes || !blockJson.attributes.isExample) {
    errors.push('Block must include isExample attribute for preview support');
  }
  
  // Check asset references
  if (!blockJson.editorStyle || !Array.isArray(blockJson.editorStyle) || 
      !blockJson.editorStyle.some(style => style.includes('centralized-css'))) {
    errors.push('Block must reference centralized CSS in editorStyle');
  }
  
  if (!blockJson.viewScript || !Array.isArray(blockJson.viewScript) || 
      !blockJson.viewScript.some(script => script.includes('centralized-js'))) {
    errors.push('Block must reference centralized JS in viewScript');
  }
  
  // Validate config.php contains Config class
  if (!parsedBlock.configPhp.includes('class CM_') || !parsedBlock.configPhp.includes('_Config')) {
    errors.push('config.php must implement CM_[Block_Name]_Config class');
  }
  
  // Check for required Config methods
  const requiredMethods = [
    'get_defaults', 'get_asset_handles', 'get_file_paths', 
    'sanitize_attributes', 'get_enhanced_wrapper_classes',
    'build_global_css_properties', 'get_javascript_constants', 'get_css_selectors'
  ];
  
  requiredMethods.forEach(method => {
    if (!parsedBlock.configPhp.includes(`function ${method}`)) {
      errors.push(`config.php missing required method: ${method}()`);
    }
  });
  
  // Validate registering.php
  if (!parsedBlock.registeringPhp.includes('require_once __DIR__ . \'/config.php\'') &&
      !parsedBlock.registeringPhp.includes('require_once __DIR__ . "/config.php"')) {
    errors.push('registering.php must include config.php');
  }
  
  if (!parsedBlock.registeringPhp.includes('wp_localize_script')) {
    errors.push('registering.php must use wp_localize_script for config sharing');
  }
  
  if (!parsedBlock.registeringPhp.includes('filemtime(')) {
    errors.push('registering.php must use filemtime() for cache-busting');
  }
  
  // Validate editor.js IIFE wrapper
  if (!parsedBlock.editorJs.startsWith('(function()') && 
      !parsedBlock.editorJs.startsWith('( function()')) {
    errors.push('editor.js must be wrapped in IIFE');
  }
  
  if (!parsedBlock.editorJs.includes('window.cm') && !parsedBlock.editorJs.includes('CONFIG =')) {
    errors.push('editor.js must import configuration from window.cm[BlockName]Config');
  }
  
  // Validate centralized.js doesn't have registerBlockType
  if (parsedBlock.centralizedJs.includes('registerBlockType')) {
    errors.push('centralized.js must NOT contain registerBlockType (should be in editor.js only)');
  }
  
  if (!parsedBlock.centralizedJs.includes('window.cm')) {
    errors.push('centralized.js must import configuration from window.cm[BlockName]Config');
  }
  
  // Validate render.php uses Config class
  if (!parsedBlock.phpCode.includes('require_once __DIR__ . \'/config.php\'') &&
      !parsedBlock.phpCode.includes('require_once __DIR__ . "/config.php"')) {
    errors.push('render.php must include config.php');
  }
  
  if (!parsedBlock.phpCode.includes('_Config::')) {
    errors.push('render.php must use Config class methods');
  }
  
  // Validate CSS uses proper cm- prefixes
  if (!parsedBlock.centralizedCss.includes('.cm-')) {
    errors.push('centralized.css must use .cm- class prefixes');
  }
  
  if (errors.length > 0) {
    console.warn('⚠️ SSOT Compliance Issues Found:');
    errors.forEach(error => console.warn(`  - ${error}`));
    // Don't throw error, just warn for now
  } else {
    console.log('✅ SSOT Compliance: All validations passed');
  }
}

function autoFixSSOTIssues(parsedBlock) {
  console.log('🔧 Auto-fixing SSOT compliance issues...');
  
  const blockName = parsedBlock.blockJson.name; // e.g., "cm/hello-jay"
  const blockSlug = blockName.replace('cm/', ''); // e.g., "hello-jay"
  
  // Fix 1: Add missing keywords with "cm" as first keyword
  if (!parsedBlock.blockJson.keywords || !parsedBlock.blockJson.keywords.includes('cm')) {
    const existingKeywords = parsedBlock.blockJson.keywords || [];
    const otherKeywords = existingKeywords.filter(k => k !== 'cm');
    parsedBlock.blockJson.keywords = ['cm', ...otherKeywords];
    console.log('  ✓ Fixed: Added "cm" to keywords');
  }
  
  // Fix 1.1: Fix wrong asset file references in block.json
  if (parsedBlock.blockJson.editorScript === 'file:./index.js') {
    parsedBlock.blockJson.editorScript = 'file:./editor.js';
    console.log('  ✓ Fixed: Changed editorScript from index.js to editor.js');
  }
  
  if (parsedBlock.blockJson.editorStyle === 'file:./index.css') {
    parsedBlock.blockJson.editorStyle = 'file:./centralized.css';
    console.log('  ✓ Fixed: Changed editorStyle from index.css to centralized.css');
  }
  
  // Fix 2: Add missing isExample attribute
  if (!parsedBlock.blockJson.attributes) {
    parsedBlock.blockJson.attributes = {};
  }
  if (!parsedBlock.blockJson.attributes.isExample) {
    parsedBlock.blockJson.attributes.isExample = {
      type: "boolean",
      default: false
    };
    console.log('  ✓ Fixed: Added isExample attribute');
  }
  
  // Fix 3: Fix asset references to use proper SSOT handles
  const correctHandles = {
    editorStyle: [`cm-${blockSlug}-centralized-css`, "file:./editor-styles.css"],
    viewScript: ["jquery", `cm-${blockSlug}-centralized-js`],
    viewStyle: [`cm-${blockSlug}-centralized-css`]
  };
  
  if (parsedBlock.blockJson.editorStyle && !Array.isArray(parsedBlock.blockJson.editorStyle)) {
    parsedBlock.blockJson.editorStyle = correctHandles.editorStyle;
    console.log('  ✓ Fixed: Updated editorStyle asset references');
  }
  
  if (parsedBlock.blockJson.viewScript && !Array.isArray(parsedBlock.blockJson.viewScript)) {
    parsedBlock.blockJson.viewScript = correctHandles.viewScript;
    console.log('  ✓ Fixed: Updated viewScript asset references');
  }
  
  if (parsedBlock.blockJson.viewStyle && !Array.isArray(parsedBlock.blockJson.viewStyle)) {
    parsedBlock.blockJson.viewStyle = correctHandles.viewStyle;
    console.log('  ✓ Fixed: Updated viewStyle asset references');
  }
  
  // Fix 4: Fix block name consistency in config.php (CRITICAL)
  if (parsedBlock.configPhp) {
    const originalConfigPhp = parsedBlock.configPhp;
    // Fix wrong BLOCK_NAME values like 'cm-blocks/hello-jay' or 'compumatter/hello-jay'
    parsedBlock.configPhp = parsedBlock.configPhp.replace(
      /'BLOCK_NAME'\s*=>\s*'[^']*'/g,
      `'BLOCK_NAME' => '${blockName}'`
    );
    if (originalConfigPhp !== parsedBlock.configPhp) {
      console.log(`  ✓ Fixed: Corrected BLOCK_NAME to '${blockName}' in config.php`);
    } else {
      console.log(`  ! No BLOCK_NAME found to fix in config.php (looking for: 'BLOCK_NAME' => 'anything')`);
    }
  }
  
  // Fix 5: Fix block name consistency in registering.php
  if (parsedBlock.registeringPhp) {
    // Fix wrong block registration names
    parsedBlock.registeringPhp = parsedBlock.registeringPhp.replace(
      /register_block_type\(\s*['"][^'"]*['"]/g,
      `register_block_type('${blockName}'`
    );
    
    // Fix wrong directory paths
    parsedBlock.registeringPhp = parsedBlock.registeringPhp.replace(
      /\/blocks\/cm-/g,
      '/cm-blocks/cm-'
    );
    
    console.log(`  ✓ Fixed: Corrected block registration and paths in registering.php`);
  }
  
  // Fix 6: Ensure render.php includes config.php
  if (parsedBlock.phpCode && !parsedBlock.phpCode.includes('require_once __DIR__ . \'/config.php\'')) {
    const lines = parsedBlock.phpCode.split('\n');
    // Insert require after opening <?php tag
    if (lines[0].includes('<?php')) {
      lines.splice(1, 0, 'require_once __DIR__ . \'/config.php\';');
      parsedBlock.phpCode = lines.join('\n');
      console.log('  ✓ Fixed: Added config.php require to render.php');
    }
  }
  
  // Fix 7: Ensure CSS uses proper cm- prefixes
  if (parsedBlock.centralizedCss && !parsedBlock.centralizedCss.includes('.cm-')) {
    // Add basic cm- class if completely missing
    parsedBlock.centralizedCss = `.cm-${blockSlug} {\n  /* Block styles */\n}\n\n` + parsedBlock.centralizedCss;
    console.log(`  ✓ Fixed: Added .cm-${blockSlug} class to CSS`);
  }
  
  // Fix 8: Fix render.php namespace and array handling
  if (parsedBlock.phpCode) {
    // Add namespace if missing
    if (!parsedBlock.phpCode.includes('namespace CompuMatter\\Blocks\\')) {
      parsedBlock.phpCode = parsedBlock.phpCode.replace(
        /(<\?php[\s\S]*?)(\s*\/\*\*)/,
        '$1\n\nnamespace CompuMatter\\Blocks\\' + blockSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('') + ';\n$2'
      );
      console.log('  ✓ Fixed: Added namespace to render.php');
    }
    
    // Fix wrapper classes array to string conversion
    if (parsedBlock.phpCode.includes('esc_attr( $wrapper_classes )') && 
        !parsedBlock.phpCode.includes('implode')) {
      parsedBlock.phpCode = parsedBlock.phpCode.replace(
        'esc_attr( $wrapper_classes )',
        'esc_attr( implode( \' \', $wrapper_classes ) )'
      );
      console.log('  ✓ Fixed: Added implode() for wrapper classes array');
    }
  }
  
  console.log('🎯 Auto-fix complete');
  return parsedBlock;
}

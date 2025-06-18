export function buildBlockPrompt(userPrompt) {
  return `
You are an expert WordPress Full Site Editing engineer specializing in the CompuMatter SSOT (Single Source of Truth) Block Framework.

Your task is to generate a complete WordPress FSE block following the EXACT SSOT architecture patterns based on this request:

"${userPrompt}"

======================
🎯 CRITICAL SSOT ARCHITECTURE REQUIREMENTS
======================

You MUST follow the EXACT patterns from the cm-hello-world reference implementation. Every file must implement the SSOT framework precisely.

======================
📂 REQUIRED FILE STRUCTURE (7 FILES)
======================

1. block.json - WordPress block metadata with SSOT asset references
2. config.php - Centralized Configuration Class (MOST IMPORTANT)
3. registering.php - Asset registration with PHP→JS config sync
4. render.php - Server-side rendering using Config class
5. editor.js - Block editor interface with IIFE wrapper
6. centralized.js - Universal environment-aware JavaScript
7. centralized.css - Universal styling with CSS custom properties

======================
📋 DETAILED FILE SPECIFICATIONS
======================

BLOCK_JSON SPECIFICATIONS - MANDATORY EXACT FORMAT:

{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "cm/[block-slug]",
  "title": "CM [Block Name]",
  "category": "cm-blocks", 
  "keywords": ["cm", "[relevant-keyword]", "[another-keyword]"],
  "textdomain": "cm_[block_name_underscores]",
  "example": {
    "attributes": {
      "isExample": true
    }
  },
  "supports": {
    "html": false,
    "align": true
  },
  "attributes": {
    "isExample": {
      "type": "boolean",
      "default": false
    },
    // Add other block-specific attributes here
  },
  "editorStyle": [
    "cm-[block-slug]-centralized-css",
    "file:./editor-styles.css"
  ],
  "viewScript": [
    "jquery",
    "cm-[block-slug]-centralized-js"
  ],
  "viewStyle": [
    "cm-[block-slug]-centralized-css"
  ],
  "render": "file:./render.php"
}

CRITICAL: Follow this EXACT structure. Replace [block-slug] and [Block Name] with actual values.

WARNING: The "keywords" field is MANDATORY and is often forgotten. 
ALWAYS include: "keywords": ["cm", "relevant-term", "another-term"]

CONFIG_PHP SPECIFICATIONS (CRITICAL - EXACT PATTERN):

<?php
if (!defined('ABSPATH')) { exit; }

class CM_[Block_Name]_Config {
    
    public static function get_defaults() {
        return [
            'isExample' => false,
            // Add block-specific defaults here
        ];
    }

    public static function get_asset_handles() {
        return [
            'centralized_css' => 'cm-[block-slug]-centralized-css',
            'centralized_js'  => 'cm-[block-slug]-centralized-js',
            'editor_js'       => 'cm-[block-slug]-editor-js'
        ];
    }

    public static function get_file_paths() {
        $base_dir = get_template_directory() . '/cm-blocks/cm-[block-slug]';
        $base_uri = get_template_directory_uri() . '/cm-blocks/cm-[block-slug]';
        
        return [
            'base_dir'        => $base_dir,
            'base_uri'        => $base_uri,
            'centralized_css' => $base_dir . '/centralized.css',
            'centralized_js'  => $base_dir . '/centralized.js',
            'editor_js'       => $base_dir . '/editor.js'
        ];
    }

    public static function get_javascript_constants() {
        return [
            'defaults'    => self::get_defaults(),
            'selectors'   => self::get_css_selectors(),
            'handles'     => self::get_asset_handles(),
            'BLOCK_NAME'  => 'cm/[block-slug]',  // MUST match block.json name exactly
            'environment' => [
                'isWordPress' => true,
                'version'     => wp_get_theme()->get('Version')
            ]
        ];
    }

    public static function get_css_selectors() {
        return [
            'wrapper' => '.cm-[block-slug]',
            'content' => '.cm-[block-slug]-content'
        ];
    }

    public static function sanitize_attributes($attributes) {
        // Implement sanitization logic
    }

    public static function get_enhanced_wrapper_classes($attributes) {
        $classes = ['cm-[block-slug]'];
        // Add container classes and WordPress core classes
        return implode(' ', array_filter($classes));
    }

    public static function build_global_css_properties($attributes = []) {
        // Generate CSS custom properties
    }
}

CRITICAL: The BLOCK_NAME value MUST be identical to block.json "name" field.

REGISTERING_PHP SPECIFICATIONS (EXACT PATTERN):

<?php
require_once __DIR__ . '/config.php';

function cm_[block_slug]_register_all_assets() {
    $asset_handles = CM_[Block_Name]_Config::get_asset_handles();
    $file_paths = CM_[Block_Name]_Config::get_file_paths();

    // Register centralized styles
    wp_register_style(
        $asset_handles['centralized_css'],
        $file_paths['base_uri'] . '/centralized.css',
        array(),
        filemtime($file_paths['centralized_css'])
    );
    
    // Register centralized script
    wp_register_script(
        $asset_handles['centralized_js'],
        $file_paths['base_uri'] . '/centralized.js',
        array('jquery'),
        filemtime($file_paths['centralized_js']),
        true
    );
    
    // Register editor script
    wp_register_script(
        $asset_handles['editor_js'],
        $file_paths['base_uri'] . '/editor.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n'),
        filemtime($file_paths['editor_js']),
        true
    );
    
    // Localize configuration for BOTH editor and frontend
    $js_config = CM_[Block_Name]_Config::get_javascript_constants();
    
    wp_localize_script($asset_handles['editor_js'], 'cm[BlockName]Config', $js_config);
    wp_localize_script($asset_handles['centralized_js'], 'cm[BlockName]Config', $js_config);
    
    // Inject CSS custom properties
    wp_add_inline_style(
        $asset_handles['centralized_css'],
        ':root { ' . CM_[Block_Name]_Config::build_global_css_properties() . ' }'
    );
}

function cm_[block_slug]_register_block() {
    cm_[block_slug]_register_all_assets();
    
    $asset_handles = CM_[Block_Name]_Config::get_asset_handles();
    
    register_block_type(get_template_directory() . '/cm-blocks/cm-[block-slug]', array(
        'editor_script' => $asset_handles['editor_js']
    ));
}

add_action('init', 'cm_[block_slug]_register_block');

// Frontend asset enqueueing
add_action('wp_enqueue_scripts', function() {
    if (has_block('cm/[block-slug]')) {
        $asset_handles = CM_[Block_Name]_Config::get_asset_handles();
        wp_enqueue_style($asset_handles['centralized_css']);
        wp_enqueue_script($asset_handles['centralized_js']);
    }
});

RENDER_PHP SPECIFICATIONS:

<?php
require_once __DIR__ . '/config.php';

$sanitized_attributes = CM_[Block_Name]_Config::sanitize_attributes($attributes);
$defaults = CM_[Block_Name]_Config::get_defaults();

// Extract attributes with fallbacks
// Build wrapper classes using centralized processor
$wrapper_classes = CM_[Block_Name]_Config::get_enhanced_wrapper_classes(
    array_merge($sanitized_attributes, $attributes)
);

// Generate styles
$inline_styles = CM_[Block_Name]_Config::build_global_css_properties($sanitized_attributes);
?>

<div class="<?php echo esc_attr($wrapper_classes); ?>" 
     <?php if (!empty($inline_styles)): ?>
     style="<?php echo esc_attr($inline_styles); ?>"
     <?php endif; ?>
     data-block="cm-[block-slug]">
    <!-- Block content here -->
</div>

EDITOR_JS SPECIFICATIONS (EXACT PATTERN):

(function() {
    'use strict';
    
    const { __ } = wp.i18n;
    const { registerBlockType } = wp.blocks;
    const { InspectorControls, useBlockProps, RichText } = wp.blockEditor;
    const { PanelBody, TextControl } = wp.components;
    const { Fragment, createElement, useEffect } = wp.element;

    // Import centralized configuration - NO hardcoded defaults
    let CONFIG = window.cm[BlockName]Config;

    // Validation of configuration availability
    if (!CONFIG || !CONFIG.defaults) {
        console.error('[Block Name] Block: PHP configuration not loaded. Block may not function correctly.');
        CONFIG = { defaults: {}, selectors: {} };
    }

    function processAttributes(attributes) {
        return { ...CONFIG.defaults, ...attributes };
    }

    function BlockEdit({ attributes, setAttributes }) {
        const blockProps = useBlockProps();
        const processedAttributes = processAttributes(attributes);
        
        // Check if this is the example preview
        if (processedAttributes.isExample) {
            return createElement('img', {
                src: '/wp-content/themes/word4ya/cm-blocks/cm-[block-slug]/preview.png',
                alt: '[Block Name] Block preview',
                style: { width: '100%', maxWidth: '400px', display: 'block' }
            });
        }
        
        // Environment-specific setup
        useEffect(() => {
            // Block initialized
        }, []);

        const updateAttribute = (key, value) => {
            setAttributes({ [key]: value });
        };

        return createElement(Fragment, null, [
            createElement(InspectorControls, { key: 'inspector' }),
            createElement('div', {
                key: 'content',
                ...blockProps,
                className: \`\${blockProps.className} cm-[block-slug]\`
            }, [
                // Block editor content here
            ])
        ]);
    }

    // CRITICAL: This block name MUST match block.json "name" field exactly
    registerBlockType('cm/[block-slug]', {
        edit: BlockEdit,
        save: () => null // Server-side rendering
    });
    
})();

CENTRALIZED_JS SPECIFICATIONS:

(function() {
    'use strict';
    
    // Environment detection
    const isWordPressEditor = typeof wp !== 'undefined' && wp.blocks;
    const isFSE = document.body.classList.contains('block-editor-page');
    const isFrontend = !isWordPressEditor && !isFSE;
    
    // Configuration from PHP - no hardcoded values
    const CONFIG = window.cm[BlockName]Config || {};
    
    if (!CONFIG.defaults || !CONFIG.selectors) {
        console.error('[Block Name] Block: PHP configuration not loaded.');
        return;
    }
    
    function initializeBlock() {
        const blocks = document.querySelectorAll(CONFIG.selectors.wrapper);
        blocks.forEach(block => {
            setupBlockBehavior(block);
        });
    }
    
    function setupBlockBehavior(blockElement) {
        // Add interactive functionality here
        blockElement.setAttribute('data-initialized', 'true');
    }
    
    function initialize() {
        if (isFrontend) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeBlock);
            } else {
                initializeBlock();
            }
        } else if (isFSE) {
            const observer = new MutationObserver(() => {
                initializeBlock();
            });
            observer.observe(document.body, { childList: true, subtree: true });
            initializeBlock();
        }
    }
    
    initialize();
})();

CENTRALIZED_CSS SPECIFICATIONS:
Use .cm-[block-slug] as the main wrapper class. Include responsive styles and CSS custom properties.

======================
🚫 CRITICAL REQUIREMENTS
======================

1. Replace ALL [block-slug], [Block_Name], [BlockName] placeholders with actual values
2. Use EXACT patterns from specifications above
3. NO create-block tooling patterns allowed
4. NO registerBlockType in centralized.js
5. MUST include IIFE wrapper in editor.js
6. MUST implement Config class with all required methods
7. MUST use wp_localize_script for configuration sharing
8. MUST use filemtime() for cache-busting
9. MUST include isExample attribute for preview support
10. MUST include "keywords" array with "cm" as first keyword in block.json

======================
🔍 SELF-CHECKING REQUIREMENTS
======================

BEFORE generating output, verify these EXACT matches across ALL files:

1. **Block Name Consistency**: The EXACT same block name must appear in:
   - block.json: "name": "cm/[block-slug]"
   - config.php: 'BLOCK_NAME' => 'cm/[block-slug]'
   - editor.js: registerBlockType('cm/[block-slug]', ...)

2. **Asset Handle Consistency**: Use EXACT same pattern everywhere:
   - "cm-[block-slug]-centralized-css"
   - "cm-[block-slug]-centralized-js"

3. **Required Fields Checklist**:
   - ✓ "keywords": ["cm", "term1", "term2"] in block.json
   - ✓ "isExample" in both attributes AND example.attributes
   - ✓ Asset arrays use ["handle", "file:./path"] format
   - ✓ Config class methods all present

4. **Cross-File Validation**:
   - editor.js block name = block.json block name
   - config.php BLOCK_NAME = block.json name  
   - All asset handles match between files

======================
📦 OUTPUT FORMAT
======================

---
BLOCK_JSON
<your block.json content>
---
CONFIG_PHP  
<your config.php content>
---
REGISTERING_PHP
<your registering.php content>
---
PHP_RENDER_CALLBACK
<your render.php content>
---
EDITOR_JS
<your editor.js content>
---
CENTRALIZED_JS
<your centralized.js content>
---
CENTRALIZED_CSS
<your centralized.css content>
---

FINAL VALIDATION STEP:
Before outputting, verify these exact items:

1. ✓ block.json has "keywords": ["cm", ...] field present
2. ✓ block.json has "isExample" in both attributes AND example sections  
3. ✓ All files use identical block name: "cm/[your-block-slug]"
4. ✓ config.php BLOCK_NAME matches block.json name exactly
5. ✓ Asset handles follow "cm-[block-slug]-[type]" pattern consistently

If ANY item above is missing, add it before generating output.

Generate the complete SSOT-compliant block now.
`;
}



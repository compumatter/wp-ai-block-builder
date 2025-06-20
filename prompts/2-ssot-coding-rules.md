SSOT (Single Source of Truth) Block Coding Rules 

If you are uncertain about how to proceed you should not guess.  You should generate a log indicating your question and exit the block building process.

Blocks should have only one canonical source for config, styling, behavior, and data.
The provides these ssot benefits below
* Eliminates drift between editor/frontend
* Centralizes config for dev speed
* Ensures consistent behavior
* Supports native WP features
* Enables universal JS for all WP environments

=== CRITICAL SSOT VIOLATION EXAMPLES ===

❌ NEVER DO THIS - Duplicated defaults between files:
block.json: "message": { "type": "string", "default": "Hello World" }
config.php: 'message' => 'Hello World'
VIOLATION: Same default value exists in two places - creates drift

❌ NEVER DO THIS - Hardcoded fallbacks in JavaScript:
editor.js: const message = attributes.message || 'Hello World';
centralized.js: const defaultMessage = 'Hello World';
VIOLATION: Hardcoded values bypass centralized configuration

❌ NEVER DO THIS - CSS values scattered across files:
centralized.css: .my-block { padding: 15px; }
editor.js: style={{ padding: '15px' }}
VIOLATION: Style values duplicated instead of using CSS custom properties

❌ NEVER DO THIS - Asset handles hardcoded:
registering.php: wp_enqueue_script('my-block-js', ...);
editor.js: wp.data.select('core/editor').getBlocks().find(block => block.name === 'my-block');
VIOLATION: Asset handles should come from config.php

✅ ALWAYS DO THIS - Single source in config.php:
block.json: "message": { "type": "string" }
config.php: 'message' => 'Hello World'
editor.js: const message = CONFIG.defaults.message;
CORRECT: All defaults flow from config.php through JavaScript localization

✅ ALWAYS DO THIS - CSS custom properties:
config.php: '--my-block-padding: 15px'
centralized.css: .my-block { padding: var(--my-block-padding); }
CORRECT: Dynamic values controlled by PHP configuration

✅ ALWAYS DO THIS - Centralized asset handles:
config.php: 'editor_js' => 'my-block-editor-js'
registering.php: wp_enqueue_script($handles['editor_js'], ...);
CORRECT: Asset handles come from centralized configuration

=== NEW CODE INTRODUCTION ===
These rules must be followed when introducing any new code to the new block.

When creating new code, if the code depends on a value that is expected but not present, this should generate an error and a descriptive error message - fallbacks are a hack and not to be used when this condition exists.  

When creating new code, you must insert within the existing files and not create new files.

config.php - stores ALL defaults, CSS, asset handles, paths, sanitizers, etc.
- Why: Zero duplication  
- How: Static class methods

block.json - only defines metadata and schema—not defaults
- Why: WP requires early schema, but defaults belong in PHP
- CRITICAL: Never add "default" properties to attributes in block.json

Pass config from PHP to JS via wp_localize_script
- Why: Environment sync 
- How: Shared config object for editor and frontend
 
Preserve className through sanitization/rendering
- Why: Consistent styles
- How: Use enhanced wrappers

React hooks must execute in stable order
- Why: Prevents warnings
- How: Collect hooks before branching

centralized.js - functions that both frontend and FSE use by the same function name and functionality
- Why: ensures front end and FSE have same functionality

Use ServerSideRender when needed
- Why: sometime FSE settings panel requires it for real time FSE results

wp_add_inline_style should be used for CSS vars
- Why: Runtime dynamic styling
- How: Inject global CSS properties

Load assets conditionally
- Why: performance
- How: Use enqueue logic with detection

Support preview images
- Why: Better UX in inserter
- How: Use `isExample` and `preview.png`

Wrap all `editor.js` files in IIFE
- Why: Prevent scope collisions
- Use `(function() { ... })()` with `'use strict'`

=== SSOT VALIDATION CHECKLIST ===
Before submitting your response, verify:

1. ✅ NO "default" properties exist in block.json attributes
2. ✅ ALL default values exist ONLY in config.php get_defaults()
3. ✅ JavaScript files use CONFIG.defaults, never hardcoded values
4. ✅ CSS custom properties used for dynamic values
5. ✅ Asset handles come from config.php get_asset_handles()
6. ✅ No duplicate configurations across files
7. ✅ All sanitization rules centralized in config.php
8. ✅ Validation rules centralized in config.php

=== Core File Structure ===
Mirror file names as shown in hello-world

= Validation Checklist =
* Config only in config.php
* JS config must exist as window.cm[BlockName]Config
* No duplicate defaults in JS or block.json
* editor.js is IIFE wrapped
* Works in frontend, FSE, and editor
* Asset handles use consistent naming
* No const redeclarations
* Proper sanitization and escaping
* filemtime() used for cache busting
* Configuration fails gracefully with clear errors

=== TEMPLATE STRUCTURE COMPLIANCE ===

When generating a new block, you MUST maintain the COMPLETE structure from hello-world template:

**REQUIRED FILES (all must be generated):**
- block.json (WordPress block metadata)
- config.php (Complete SSOT configuration class)
- centralized.css (All block styling)
- centralized.js (All block JavaScript)
- editor.js (Block editor interface)
- render.php (Server-side rendering)
- registering.php (Block registration)

**CONFIG.PHP MUST CONTAIN ALL METHODS:**
```php
class {Block_Slug}_Config {
    public static function get_defaults() { /* ... */ }
    public static function get_asset_handles() { /* ... */ }
    public static function get_file_paths() { /* ... */ }
    public static function sanitize_attributes($attributes) { /* ... */ }
    public static function get_enhanced_wrapper_classes($attributes) { /* ... */ }
    public static function build_global_css_properties($attributes = []) { /* ... */ }
    public static function get_javascript_constants() { /* ... */ }
    public static function get_css_selectors() { /* ... */ }
    public static function get_responsive_constants() { /* ... */ }
    public static function get_validation_rules() { /* ... */ }
    private static function sanitize_single_attribute($key, $value) { /* ... */ }
}
```

**BLOCK.JSON REQUIREMENTS:**
- NO default values in attributes (SSOT violation)
- All attributes must be type-only: `"message": { "type": "string" }`
- Use proper asset handles matching config.php

**EDITOR.JS REQUIREMENTS:**
- Must import CONFIG from PHP via localization
- NO hardcoded fallback values (use CONFIG.defaults)
- Must validate CONFIG availability before proceeding

❌ NEVER generate incomplete config.php - missing methods will fail SSOT validation
✅ ALWAYS copy the complete method structure from hello-world template

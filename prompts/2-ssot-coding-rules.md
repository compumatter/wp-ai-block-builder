SSOT (Single Source of Truth) Block Coding Rules 

If you are uncertain about how to proceed you should not guess.  You should generate a log indicating your question and exit the block building process.

Blocks should have only one canonical source for config, styling, behavior, and data.
The provides these ssot benefits below
* Eliminates drift between editor/frontend
* Centralizes config for dev speed
* Ensures consistent behavior
* Supports native WP features
* Enables universal JS for all WP environments

=== NEW CODE INTRODUCTION ===
These rules must be followed when introducing any new code to the new block.

When creating new code, if the code depends on a value that is expected but not present, this should generate an error and a descriptive error message - fallbacks are a hack and not to be used when this condition exists.  

When creating new code, you must insert within the existing files and not create new files.

config.php - stores ALL defaults, CSS, asset handles, paths, sanitizers, etc.
- Why: Zero duplication  
- How: Static class methods

block.json - only defines metadata and schema—not defaults
- Why: WP requires early schema, but defaults belong in PHP

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

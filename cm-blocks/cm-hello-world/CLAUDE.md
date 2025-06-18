# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands
- **Test block functionality**: Load WordPress admin dashboard → Edit a page/post → Insert "CM Hello World" block
- **Clear cache**: `wp cache flush` (if WP-CLI is installed)
- **Debug mode**: Set `WP_DEBUG` to `true` in wp-config.php
- **Check PHP errors**: Monitor browser console and server PHP error logs
- **File watching**: Manual refresh required - no build tools

## Custom Block Architecture

This codebase implements a **Single Source of Truth (SSOT)** framework for WordPress custom blocks. Each block follows a standardized structure that centralizes all configuration, styling, and behavior.

### Core SSOT Framework Components

**1. config.php - Central Configuration Class**
- All block defaults, asset handles, file paths, and validation rules
- CSS selectors, responsive breakpoints, and magic numbers  
- Attribute sanitization and wrapper class generation
- JavaScript constants export for frontend/editor sync

**2. registering.php - Asset Registration**
- Registers all CSS/JS assets with cache-busting via `filemtime()`
- Passes PHP configuration to JavaScript via `wp_localize_script()`
- Injects CSS custom properties for dynamic styling
- Handles conditional asset loading based on block presence

**3. render.php - Server-Side Rendering**
- Uses centralized config for attribute processing and wrapper classes
- Generates inline styles from configuration values
- Ensures frontend matches editor preview exactly

**4. Dual JavaScript Architecture**
- **editor.js**: Block editor interface using WordPress APIs
- **centralized.js**: Universal behavior for frontend/FSE/editor environments
- Both consume identical configuration from PHP via `wp_localize_script()`

**5. Centralized Styling**
- **centralized.css**: Universal styles using CSS custom properties
- **editor-styles.css**: Editor-specific visual enhancements
- CSS variables populated from PHP configuration ensure consistency

### File Structure Pattern
```
cm-blocks/[block-name]/
├── config.php              # SSOT configuration class
├── registering.php          # Asset registration & PHP→JS sync
├── render.php              # Server-side rendering
├── block.json              # WordPress block metadata
├── editor.js               # Block editor interface
├── centralized.js          # Universal frontend behavior
├── centralized.css         # Universal styles
└── editor-styles.css       # Editor-only styles
```

### Configuration Flow
1. **config.php** defines all defaults, selectors, and magic numbers
2. **registering.php** passes configuration to JavaScript via `wp_localize_script()`
3. **render.php** uses config for server-side HTML generation
4. **JavaScript files** consume `window.[blockName]Config` for client-side behavior
5. **CSS** uses custom properties injected from PHP configuration

### Development Guidelines
- **Never hardcode values** - all constants must live in config.php
- **Use filemtime()** for cache-busting on all custom assets  
- **Maintain dual-environment compatibility** - code must work in editor and frontend
- **Sanitize all attributes** using centralized validation in config.php
- **CSS custom properties** for all dynamic styling (colors, spacing, etc.)
- **Environment detection** in JavaScript for frontend vs editor behavior

### Block Registration Process
1. WordPress `init` hook calls registration function
2. Assets registered with handles defined in config.php
3. JavaScript configuration localized to both editor and frontend scripts
4. CSS custom properties injected as inline styles
5. Conditional asset loading based on `has_block()` detection

### Key Architecture Benefits
- **True single source of truth** - no duplicate configuration
- **Perfect editor/frontend parity** - identical configuration consumption
- **Dynamic styling** - CSS custom properties updated from PHP
- **Environment universality** - works in all WordPress contexts
- **Cache-busting** - automatic versioning via file modification times
- **Centralized validation** - consistent attribute sanitization
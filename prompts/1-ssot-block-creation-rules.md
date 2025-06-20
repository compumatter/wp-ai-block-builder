SSOT Block Creation Rules

nomenclature legend:
* block-slug is the hyphenated name of the block we are created eg; hello-world
* block_slug is the undercore conversion of block-slug where appropriate eg; hello_world 
* blockSlug is the camel case conversion of the block-slug eg; helloWorld
* BLOCK_SLUG is the uppercase version of the underscore conversion of block-slug eg; HELLO_WORLD


Any new block built starts its life by copying the hello-world block to the name of the new block-slug as provided.

The files copied from the hello-world block must serve as the skeletal framework by which all other new blocks are built.

Once copied, files beginning with ssot* can be removed from base directory of the new block.

The specific files referenced by the code within this block must remain referenced in blocks created from it.

All nomenclature must be renamed to that of the new block-slug provided. 

The coding structure utilized within this block must continue to exist in blocks created from it.

Additional code including php, js, json, css should be built upon the existing code structure.  Additional code should accomplish the new blocks functionality and style goals but not remove the original code structure it was built upon.

=== CRITICAL: COMPLETE CONFIG.PHP STRUCTURE REQUIRED ===

The config.php file MUST contain ALL of these methods (no exceptions):

1. get_defaults() - All default values for block attributes
2. get_asset_handles() - Asset handle names for CSS/JS files  
3. get_file_paths() - File paths for all block assets
4. sanitize_attributes() - Sanitization for all attributes
5. get_enhanced_wrapper_classes() - CSS class processing
6. build_global_css_properties() - Dynamic CSS custom properties
7. get_javascript_constants() - Complete config for JS consumption
8. get_css_selectors() - Centralized CSS selector management
9. get_responsive_constants() - Responsive breakpoint rules
10. get_validation_rules() - Validation rules for attributes
11. sanitize_single_attribute() - Helper for individual attribute sanitization

FAILURE TO INCLUDE ALL METHODS WILL RESULT IN SSOT VALIDATION FAILURE.

The config.php class name must be: {Block_Slug}_Config (e.g., Hello_World_Config, A_Test_Config)
The namespace must be: CM\{Block_Slug} (e.g., CM\Hello_World, CM\A_Test)
<?php
/**
 * A Test Block - Registration
 * Registers block and assets using centralized configuration
 */

// Include centralized configuration
require_once __DIR__ . '/config.php';

function a_test_register_all_assets() {
    $asset_handles = Hello_World_Config::get_asset_handles();
    $file_paths = Hello_World_Config::get_file_paths();

    // Validate SSOT configuration before proceeding
    $defaults = Hello_World_Config::get_defaults();
    if (empty($defaults)) {
        error_log('A Test Block: CRITICAL - SSOT defaults are empty. Block registration aborted.');
        return;
    }

    // Register centralized styles
    wp_register_style(
        $asset_handles['centralized_css'],
        $file_paths['base_uri'] . '/centralized.css',
        array(),
        filemtime($file_paths['centralized_css'])
    );
 
    // Register centralized script with environment awareness
    wp_register_script(
        $asset_handles['centralized_js'],
        $file_paths['base_uri'] . '/centralized.js',
        array('jquery'),
        filemtime($file_paths['centralized_js']),
        true
    );
    
    // Register editor script with WordPress dependencies
    wp_register_script(
        $asset_handles['editor_js'],
        $file_paths['base_uri'] . '/editor.js',
        array(
            'wp-blocks',
            'wp-element',
            'wp-block-editor',
            'wp-components',
            'wp-i18n'
        ),
        filemtime($file_paths['editor_js']),
        true
    );
    
    // Localize configuration for BOTH editor and frontend
    $js_config = Hello_World_Config::get_javascript_constants();
    
    // Validate configuration before localizing
    if (empty($js_config['defaults'])) {
        error_log('A Test Block: CRITICAL - JavaScript configuration defaults are empty.');
        return;
    }
    
    wp_localize_script(
        $asset_handles['editor_js'],
        'ATestConfig',
        $js_config
    );

    wp_localize_script(
        $asset_handles['centralized_js'],
        'ATestConfig',
        $js_config
    );
    
    // Debug logging
    error_log('A Test Block: SSOT configuration successfully localized to JavaScript');
    
    // Inject dynamic CSS custom properties
    wp_add_inline_style(
        $asset_handles['centralized_css'],
        ':root { ' . Hello_World_Config::build_global_css_properties() . ' }'
    );
}

// Register block with proper asset integration
function a_test_register_block() {
    a_test_register_all_assets();
    
    $asset_handles = Hello_World_Config::get_asset_handles();
    
    register_block_type(get_template_directory() . '/cm-blocks/a-test', array(
        'editor_script' => $asset_handles['editor_js']
    ));
}

// WordPress hooks
add_action('init', 'a_test_register_block');

// Frontend asset enqueueing
add_action('wp_enqueue_scripts', function() {
    if (has_block('cm/a-test')) {
        $asset_handles = Hello_World_Config::get_asset_handles();
        wp_enqueue_style($asset_handles['centralized_css']);
        wp_enqueue_script($asset_handles['centralized_js']);
    }
});

// FSE editor integration
add_action('after_setup_theme', function() {
    $file_paths = Hello_World_Config::get_file_paths();
    add_editor_style($file_paths['base_uri'] . '/centralized.css');
});

// Block editor asset enqueueing
add_action('enqueue_block_editor_assets', function() {
    $asset_handles = Hello_World_Config::get_asset_handles();
    wp_enqueue_script($asset_handles['centralized_js']);
});
<?php
/**
 * Block Registration and Asset Management
 * 
 * @package CompuMatter\Blocks\HelloJay
 */

namespace CompuMatter\Blocks\HelloJay;

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Include configuration
require_once __DIR__ . '/config.php';

/**
 * Register all block assets
 */
function cm_hello_jay_register_all_assets() {
    $config = cm_hello_jay_get_config();
    
    // Register editor script
    wp_register_script(
        'cm-hello-jay-editor',
        get_template_directory_uri() . '/blocks/cm-hello-jay/assets/js/editor.js',
        ['wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'],
        filemtime(get_template_directory() . '/blocks/cm-hello-jay/assets/js/editor.js'),
        false
    );
    
    // Register frontend script
    wp_register_script(
        'cm-hello-jay-frontend',
        get_template_directory_uri() . '/blocks/cm-hello-jay/assets/js/frontend.js',
        [],
        filemtime(get_template_directory() . '/blocks/cm-hello-jay/assets/js/frontend.js'),
        true
    );
    
    // Register editor styles
    wp_register_style(
        'cm-hello-jay-editor',
        get_template_directory_uri() . '/blocks/cm-hello-jay/assets/css/editor.css',
        ['wp-edit-blocks'],
        filemtime(get_template_directory() . '/blocks/cm-hello-jay/assets/css/editor.css')
    );
    
    // Register frontend styles
    wp_register_style(
        'cm-hello-jay-frontend',
        get_template_directory_uri() . '/blocks/cm-hello-jay/assets/css/frontend.css',
        [],
        filemtime(get_template_directory() . '/blocks/cm-hello-jay/assets/css/frontend.css')
    );
    
    // Localize configuration for editor
    wp_localize_script('cm-hello-jay-editor', 'cmHelloJayConfig', $config);
    
    // Localize configuration for frontend
    wp_localize_script('cm-hello-jay-frontend', 'cmHelloJayConfig', $config);
    
    // Register the block
    register_block_type(
        get_template_directory() . '/blocks/cm-hello-jay',
        [
            'editor_script' => 'cm-hello-jay-editor',
            'editor_style'  => 'cm-hello-jay-editor',
            'style'         => 'cm-hello-jay-frontend',
            'script'        => 'cm-hello-jay-frontend'
        ]
    );
}
add_action('init', 'CompuMatter\Blocks\HelloJay\cm_hello_jay_register_all_assets');

/**
 * Conditionally enqueue frontend assets
 */
function cm_hello_jay_enqueue_frontend_assets() {
    if (has_block('compumatter/hello-jay')) {
        wp_enqueue_script('cm-hello-jay-frontend');
        wp_enqueue_style('cm-hello-jay-frontend');
    }
}
add_action('wp_enqueue_scripts', 'CompuMatter\Blocks\HelloJay\cm_hello_jay_enqueue_frontend_assets');
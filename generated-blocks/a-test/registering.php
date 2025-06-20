<?php
namespace CM\A_Test;

if (!defined('ABSPATH')) exit;

add_action('init', function() {
    register_block_type(__DIR__, [
        'render_callback' => function($attributes) {
            ob_start();
            require __DIR__ . '/render.php';
            return ob_get_clean();
        }
    ]);
});

add_action('enqueue_block_editor_assets', function() {
    $handles = A_Test_Config::get_asset_handles();
    $paths = A_Test_Config::get_file_paths();
    
    wp_localize_script(
        $handles['editor_js'],
        'cmATest',
        ['CONFIG' => A_Test_Config::get_javascript_constants()]
    );
});

add_action('wp_enqueue_scripts', function() {
    $handles = A_Test_Config::get_asset_handles();
    wp_add_inline_style(
        $handles['style'],
        A_Test_Config::build_global_css_properties()
    );
});

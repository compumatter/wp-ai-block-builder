<?php
/**
 * Server-side rendering for the cm/hello-jay block
 *
 * @package CompuMatter\HelloJay
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

require_once plugin_dir_path( __FILE__ ) . 'config.php';

/**
 * Renders the cm/hello-jay block on the server.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 *
 * @return string Returns the block content.
 */
function render_cm_hello_jay_block( $attributes, $content, $block ) {
    // Sanitize attributes
    $attributes = CM_Hello_Jay_Config::sanitize_attributes( $attributes );
    
    // Get wrapper classes
    $wrapper_classes = CM_Hello_Jay_Config::get_enhanced_wrapper_classes( $attributes );
    
    // Build inline styles
    $inline_styles = CM_Hello_Jay_Config::build_global_css_properties( $attributes );
    
    // Build the block output
    $output = sprintf(
        '<div class="%s" style="%s" data-block="cm-hello-jay">',
        esc_attr( $wrapper_classes ),
        esc_attr( $inline_styles )
    );
    
    $output .= '<div class="cm-hello-jay__content">';
    $output .= esc_html__( 'Hello Jay', 'cm-hello-jay' );
    $output .= '</div>';
    
    $output .= '</div>';
    
    return $output;
}
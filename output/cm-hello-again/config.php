<?php
/**
 * CM Hello Jay Block Configuration
 *
 * @package CompuMatter\Blocks
 */

namespace CompuMatter\Blocks\HelloJay;

/**
 * Configuration class for CM Hello Jay block
 */
class CM_Hello_Jay_Config {
    /**
     * Get default attributes
     *
     * @return array Default block attributes
     */
    public static function get_defaults() {
        return array(
            'message' => 'Hello Jay',
            'isExample' => false,
        );
    }

    /**
     * Get asset handles
     *
     * @return array Asset handles for scripts and styles
     */
    public static function get_asset_handles() {
        return array(
            'editor_script' => 'cm-hello-jay-editor-script',
            'editor_style'  => 'cm-hello-jay-editor-style',
            'style'         => 'cm-hello-jay-style',
            'view_script'   => 'cm-hello-jay-view-script',
        );
    }

    /**
     * Get file paths
     *
     * @return array File paths for block assets
     */
    public static function get_file_paths() {
        return array(
            'dir'        => plugin_dir_path(__FILE__),
            'url'        => plugin_dir_url(__FILE__),
            'build_dir'  => '/cm-blocks/cm-hello-jay/',
        );
    }

    /**
     * Sanitize block attributes
     *
     * @param array $attributes Raw block attributes
     * @return array Sanitized attributes
     */
    public static function sanitize_attributes($attributes) {
        $defaults = self::get_defaults();
        $attributes = wp_parse_args($attributes, $defaults);

        return array(
            'message' => sanitize_text_field($attributes['message']),
            'isExample' => (bool) $attributes['isExample'],
        );
    }

    /**
     * Get enhanced wrapper classes
     *
     * @param array $attributes Block attributes
     * @return array Additional wrapper classes
     */
    public static function get_enhanced_wrapper_classes($attributes) {
        $classes = array();
        
        if (!empty($attributes['isExample'])) {
            $classes[] = 'is-example';
        }
        
        return $classes;
    }

    /**
     * Build global CSS custom properties
     *
     * @param array $attributes Block attributes
     * @return string CSS custom properties
     */
    public static function build_global_css_properties($attributes) {
        return '';
    }

    /**
     * Get JavaScript constants for the block
     *
     * @return array JavaScript constants
     */
    public static function get_javascript_constants() {
        return array(
            'BLOCK_NAME' => 'cm-blocks/cm-hello-jay',
            'BLOCK_TITLE' => __('CM Hello Jay', 'cm-blocks'),
        );
    }

    /**
     * Get CSS selectors for the block
     *
     * @return array CSS selectors
     */
    public static function get_css_selectors() {
        return array(
            'wrapper' => '.wp-block-cm-blocks-cm-hello-jay',
            'alert' => '.wp-block-cm-blocks-cm-hello-jay__alert',
        );
    }
}
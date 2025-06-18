<?php
/**
 * Hello World Block - Centralized Configuration
 * Single source of truth for all defaults, classes, and validation rules
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class CM_Hello_World_Config {
    
    /**
     * 1. BUSINESS DEFAULTS - Single source of truth
     */
    public static function get_defaults() {
        return [
            'isExample' => false,
            'message' => 'Hello World',
            'textColor' => '#333333',
            'backgroundColor' => '#ffffff',
            // Custom style attributes
            'customBackgroundColor' => '',
            'customTextColor' => '',
            'customBorder' => [
                'top' => ['width' => '0px', 'style' => 'solid', 'color' => '#000000'],
                'right' => ['width' => '0px', 'style' => 'solid', 'color' => '#000000'],
                'bottom' => ['width' => '0px', 'style' => 'solid', 'color' => '#000000'],
                'left' => ['width' => '0px', 'style' => 'solid', 'color' => '#000000']
            ],
            'customPadding' => [
                'top' => '0px',
                'right' => '0px',
                'bottom' => '0px',
                'left' => '0px'
            ]
        ];
    }

    /**
     * 2. ASSET HANDLES - Centralized asset management
     */
    public static function get_asset_handles() {
        return [
            'centralized_css' => 'cm-hello-world-centralized-css',
            'centralized_js'  => 'cm-hello-world-centralized-js',
            'editor_js'       => 'cm-hello-world-editor-js'
        ];
    }

    /**
     * 3. FILE PATHS - Dynamic path resolution
     */
    public static function get_file_paths() {
        $base_dir = get_template_directory() . '/cm-blocks/cm-hello-world';
        $base_uri = get_template_directory_uri() . '/cm-blocks/cm-hello-world';
        
        return [
            'base_dir'        => $base_dir,
            'base_uri'        => $base_uri,
            'centralized_css' => $base_dir . '/centralized.css',
            'centralized_js'  => $base_dir . '/centralized.js',
            'editor_js'       => $base_dir . '/editor.js'
        ];
    }

    /**
     * 4. ATTRIBUTE SANITIZATION - Centralized validation
     */
    public static function sanitize_attributes($attributes) {
        $defaults = self::get_defaults();
        $sanitized = [];
        
        // Apply defaults and sanitize each attribute
        foreach ($defaults as $key => $default_value) {
            if (isset($attributes[$key])) {
                $sanitized[$key] = self::sanitize_single_attribute($key, $attributes[$key]);
            } else {
                $sanitized[$key] = $default_value;
            }
        }
        
        // Handle additional attributes that might be passed but not in defaults
        $additional_attributes = ['customBackgroundColor', 'customTextColor', 'customBorder', 'customPadding'];
        foreach ($additional_attributes as $attr) {
            if (isset($attributes[$attr]) && !isset($sanitized[$attr])) {
                $sanitized[$attr] = self::sanitize_single_attribute($attr, $attributes[$attr]);
            }
        }
        
        return $sanitized;
    }

    /**
     * 5. CSS CLASS PROCESSING - Enhanced wrapper classes
     */
    public static function get_enhanced_wrapper_classes($attributes) {
        $classes = ['cm-hello-world'];
        
        // Add container classes as requested
        $container_classes = ['cm-cqi-container', 'zc95', 'zo95', 'zm95', 'zp95', 'zu95', 'zt95', 'ze95'];
        $classes = array_merge($classes, $container_classes);
        
        // Add WordPress core classes
        if (!empty($attributes['className'])) {
            $classes[] = $attributes['className'];
        }
        
        // Add alignment classes
        if (!empty($attributes['align'])) {
            $classes[] = 'align' . $attributes['align'];
        }
        
        // Add custom wrapper classes
        if (!empty($attributes['wrapperClasses'])) {
            $classes[] = trim($attributes['wrapperClasses']);
        }
        
        return implode(' ', array_filter($classes));
    }

    /**
     * 6. DYNAMIC STYLE GENERATION - CSS custom properties
     */
    public static function build_global_css_properties($attributes = []) {
        $properties = [];
        
        if (!empty($attributes['textColor'])) {
            $properties[] = '--cm-hello-world-text-color: ' . esc_attr($attributes['textColor']) . ';';
        }
        
        if (!empty($attributes['backgroundColor'])) {
            $properties[] = '--cm-hello-world-bg-color: ' . esc_attr($attributes['backgroundColor']) . ';';
        }
        
        // Handle custom style attributes
        if (!empty($attributes['customBackgroundColor'])) {
            $properties[] = '--cm-hello-world-custom-bg-color: ' . esc_attr($attributes['customBackgroundColor']) . ';';
        }
        
        if (!empty($attributes['customTextColor'])) {
            $properties[] = '--cm-hello-world-custom-text-color: ' . esc_attr($attributes['customTextColor']) . ';';
        }
        
        return implode(' ', $properties);
    }

    /**
     * 7. JAVASCRIPT CONFIGURATION - Complete config for JS consumption
     */
    public static function get_javascript_constants() {
        return [
            'defaults'    => self::get_defaults(),
            'selectors'   => self::get_css_selectors(),
            'handles'     => self::get_asset_handles(),
            'environment' => [
                'isWordPress' => true,
                'version'     => wp_get_theme()->get('Version')
            ],
            'responsive'  => self::get_responsive_constants(),
            'validation'  => self::get_validation_rules()
        ];
    }

    /**
     * 8. CSS SELECTORS - Centralized selector management
     */
    public static function get_css_selectors() {
        return [
            'wrapper'   => '.cm-hello-world',
            'content'   => '.cm-hello-world-content',
            'message'   => '.cm-hello-world__message'
        ];
    }

    /**
     * 9. RESPONSIVE CONFIGURATION - Centralized responsive rules
     */
    public static function get_responsive_constants() {
        return [
            'thresholds' => [
                'mobile' => 768
            ]
        ];
    }

    /**
     * 10. VALIDATION RULES - Centralized validation
     */
    public static function get_validation_rules() {
        return [
            'required_fields' => [],
            'data_types'      => [
                'message' => 'string',
                'textColor' => 'string',
                'backgroundColor' => 'string',
                'isExample' => 'boolean',
                'customBackgroundColor' => 'string',
                'customTextColor' => 'string',
                'customBorder' => 'object',
                'customPadding' => 'object'
            ]
        ];
    }

    /**
     * Helper method for single attribute sanitization
     */
    private static function sanitize_single_attribute($key, $value) {
        switch ($key) {
            case 'message':
                return sanitize_text_field($value);
            case 'textColor':
            case 'backgroundColor':
            case 'customBackgroundColor':
            case 'customTextColor':
                return sanitize_hex_color($value) ?: sanitize_text_field($value);
            case 'isExample':
                return (bool) $value;
            case 'customBorder':
                return self::sanitize_border_object($value);
            case 'customPadding':
                return self::sanitize_padding_object($value);
            default:
                return $value;
        }
    }
    
    /**
     * Sanitize border object structure
     */
    private static function sanitize_border_object($border) {
        if (!is_array($border)) {
            return self::get_defaults()['customBorder'];
        }
        
        $sanitized = [];
        $sides = ['top', 'right', 'bottom', 'left'];
        
        foreach ($sides as $side) {
            if (isset($border[$side]) && is_array($border[$side])) {
                $sanitized[$side] = [
                    'width' => sanitize_text_field($border[$side]['width'] ?? '0px'),
                    'style' => sanitize_text_field($border[$side]['style'] ?? 'solid'),
                    'color' => sanitize_hex_color($border[$side]['color']) ?: sanitize_text_field($border[$side]['color'] ?? '#000000')
                ];
            } else {
                $sanitized[$side] = ['width' => '0px', 'style' => 'solid', 'color' => '#000000'];
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Sanitize padding object structure
     */
    private static function sanitize_padding_object($padding) {
        if (!is_array($padding)) {
            return self::get_defaults()['customPadding'];
        }
        
        $sanitized = [];
        $sides = ['top', 'right', 'bottom', 'left'];
        
        foreach ($sides as $side) {
            $sanitized[$side] = sanitize_text_field($padding[$side] ?? '0px');
        }
        
        return $sanitized;
    }
}
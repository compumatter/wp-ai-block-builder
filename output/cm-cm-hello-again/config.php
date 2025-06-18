<?php
/**
 * Hello Again Block - Centralized Configuration
 * Single source of truth for all defaults, classes, and validation rules
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class CM_Hello_Again_Config {
    
    /**
     * 1. BUSINESS DEFAULTS - Single source of truth
     */
    public static function get_defaults() {
        return [
            'isExample' => false,
            'message' => 'Hello Jay',
            'alertType' => 'info',
            'backgroundColor' => '#d1ecf1',
            'borderColor' => '#bee5eb',
            'textColor' => '#0c5460',
            // Custom style attributes
            'customBackgroundColor' => '',
            'customTextColor' => '',
            'customBorderColor' => '',
            'customBorder' => [
                'top' => ['width' => '1px', 'style' => 'solid', 'color' => '#bee5eb'],
                'right' => ['width' => '1px', 'style' => 'solid', 'color' => '#bee5eb'],
                'bottom' => ['width' => '1px', 'style' => 'solid', 'color' => '#bee5eb'],
                'left' => ['width' => '1px', 'style' => 'solid', 'color' => '#bee5eb']
            ],
            'customPadding' => [
                'top' => '12px',
                'right' => '20px',
                'bottom' => '12px',
                'left' => '20px'
            ],
            'customBorderRadius' => '4px'
        ];
    }

    /**
     * 2. ASSET HANDLES - Centralized asset management
     */
    public static function get_asset_handles() {
        return [
            'centralized_css' => 'cm-hello-again-centralized-css',
            'centralized_js'  => 'cm-hello-again-centralized-js',
            'editor_js'       => 'cm-hello-again-editor-js'
        ];
    }

    /**
     * 3. FILE PATHS - Dynamic path resolution
     */
    public static function get_file_paths() {
        $base_dir = get_template_directory() . '/cm-blocks/cm-hello-again';
        $base_uri = get_template_directory_uri() . '/cm-blocks/cm-hello-again';
        
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
        $additional_attributes = ['customBackgroundColor', 'customTextColor', 'customBorderColor', 'customBorder', 'customPadding', 'customBorderRadius'];
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
        $classes = ['cm-hello-again'];
        
        // Add alert type class
        if (!empty($attributes['alertType'])) {
            $classes[] = 'cm-hello-again--' . sanitize_html_class($attributes['alertType']);
        }
        
        // Add example mode class
        if (!empty($attributes['isExample'])) {
            $classes[] = 'cm-hello-again--example';
        }
        
        // Add custom styling indicator
        if (!empty($attributes['customBackgroundColor']) || 
            !empty($attributes['customTextColor']) || 
            !empty($attributes['customBorderColor'])) {
            $classes[] = 'cm-hello-again--custom-styled';
        }
        
        return implode(' ', $classes);
    }

    /**
     * 6. INLINE STYLES - Generate dynamic styles
     */
    public static function get_inline_styles($attributes) {
        $styles = [];
        
        // Background color
        if (!empty($attributes['customBackgroundColor'])) {
            $styles['background-color'] = sanitize_hex_color($attributes['customBackgroundColor']);
        } elseif (!empty($attributes['backgroundColor'])) {
            $styles['background-color'] = sanitize_hex_color($attributes['backgroundColor']);
        }
        
        // Text color
        if (!empty($attributes['customTextColor'])) {
            $styles['color'] = sanitize_hex_color($attributes['customTextColor']);
        } elseif (!empty($attributes['textColor'])) {
            $styles['color'] = sanitize_hex_color($attributes['textColor']);
        }
        
        // Border color
        if (!empty($attributes['customBorderColor'])) {
            $styles['border-color'] = sanitize_hex_color($attributes['customBorderColor']);
        } elseif (!empty($attributes['borderColor'])) {
            $styles['border-color'] = sanitize_hex_color($attributes['borderColor']);
        }
        
        // Custom border
        if (!empty($attributes['customBorder']) && is_array($attributes['customBorder'])) {
            foreach (['top', 'right', 'bottom', 'left'] as $side) {
                if (isset($attributes['customBorder'][$side])) {
                    $border = $attributes['customBorder'][$side];
                    if (!empty($border['width']) && $border['width'] !== '0px') {
                        $styles["border-{$side}-width"] = sanitize_text_field($border['width']);
                        $styles["border-{$side}-style"] = sanitize_text_field($border['style']);
                        $styles["border-{$side}-color"] = sanitize_hex_color($border['color']);
                    }
                }
            }
        }
        
        // Custom padding
        if (!empty($attributes['customPadding']) && is_array($attributes['customPadding'])) {
            foreach (['top', 'right', 'bottom', 'left'] as $side) {
                if (!empty($attributes['customPadding'][$side])) {
                    $styles["padding-{$side}"] = sanitize_text_field($attributes['customPadding'][$side]);
                }
            }
        }
        
        // Border radius
        if (!empty($attributes['customBorderRadius'])) {
            $styles['border-radius'] = sanitize_text_field($attributes['customBorderRadius']);
        }
        
        // Convert to string
        $style_string = '';
        foreach ($styles as $property => $value) {
            $style_string .= "{$property}: {$value}; ";
        }
        
        return trim($style_string);
    }

    /**
     * 7. SINGLE ATTRIBUTE SANITIZATION - Type-specific sanitization
     */
    private static function sanitize_single_attribute($key, $value) {
        switch ($key) {
            case 'isExample':
                return (bool) $value;
                
            case 'message':
                return sanitize_text_field($value);
                
            case 'alertType':
                $allowed_types = ['info', 'success', 'warning', 'danger'];
                return in_array($value, $allowed_types) ? $value : 'info';
                
            case 'backgroundColor':
            case 'borderColor':
            case 'textColor':
            case 'customBackgroundColor':
            case 'customTextColor':
            case 'customBorderColor':
                return sanitize_hex_color($value);
                
            case 'customBorder':
                if (is_array($value)) {
                    $sanitized_border = [];
                    foreach (['top', 'right', 'bottom', 'left'] as $side) {
                        if (isset($value[$side]) && is_array($value[$side])) {
                            $sanitized_border[$side] = [
                                'width' => sanitize_text_field($value[$side]['width'] ?? '0px'),
                                'style' => sanitize_text_field($value[$side]['style'] ?? 'solid'),
                                'color' => sanitize_hex_color($value[$side]['color'] ?? '#000000')
                            ];
                        }
                    }
                    return $sanitized_border;
                }
                return self::get_defaults()['customBorder'];
                
            case 'customPadding':
                if (is_array($value)) {
                    $sanitized_padding = [];
                    foreach (['top', 'right', 'bottom', 'left'] as $side) {
                        if (isset($value[$side])) {
                            $sanitized_padding[$side] = sanitize_text_field($value[$side]);
                        }
                    }
                    return $sanitized_padding;
                }
                return self::get_defaults()['customPadding'];
                
            case 'customBorderRadius':
                return sanitize_text_field($value);
                
            default:
                return $value;
        }
    }

    /**
     * 8. ALERT TYPE CONFIGURATIONS - Alert-specific settings
     */
    public static function get_alert_type_config($type = 'info') {
        $configs = [
            'info' => [
                'backgroundColor' => '#d1ecf1',
                'borderColor' => '#bee5eb',
                'textColor' => '#0c5460'
            ],
            'success' => [
                'backgroundColor' => '#d4edda',
                'borderColor' => '#c3e6cb',
                'textColor' => '#155724'
            ],
            'warning' => [
                'backgroundColor' => '#fff3cd',
                'borderColor' => '#ffeeba',
                'textColor' => '#856404'
            ],
            'danger' => [
                'backgroundColor' => '#f8d7da',
                'borderColor' => '#f5c6cb',
                'textColor' => '#721c24'
            ]
        ];
        
        return isset($configs[$type]) ? $configs[$type] : $configs['info'];
    }

    /**
     * 9. RENDER OUTPUT - Generate block HTML
     */
    public static function render_block_output($attributes) {
        $sanitized_attrs = self::sanitize_attributes($attributes);
        $wrapper_classes = self::get_enhanced_wrapper_classes($sanitized_attrs);
        $inline_styles = self::get_inline_styles($sanitized_attrs);
        
        $html = sprintf(
            '<div class="%s" style="%s" role="alert">%s</div>',
            esc_attr($wrapper_classes),
            esc_attr($inline_styles),
            esc_html($sanitized_attrs['message'])
        );
        
        return $html;
    }

    /**
     * 10. VALIDATION RULES - Attribute validation
     */
    public static function validate_attributes($attributes) {
        $errors = [];
        
        // Validate message
        if (empty($attributes['message'])) {
            $errors[] = 'Message cannot be empty';
        }
        
        // Validate alert type
        if (!empty($attributes['alertType'])) {
            $allowed_types = ['info', 'success', 'warning', 'danger'];
            if (!in_array($attributes['alertType'], $allowed_types)) {
                $errors[] = 'Invalid alert type';
            }
        }
        
        // Validate colors
        $color_fields = ['backgroundColor', 'borderColor', 'textColor', 'customBackgroundColor', 'customTextColor', 'customBorderColor'];
        foreach ($color_fields as $field) {
            if (!empty($attributes[$field]) && !preg_match('/^#[a-f0-9]{6}$/i', $attributes[$field])) {
                $errors[] = "Invalid color format for {$field}";
            }
        }
        
        return empty($errors) ? true : $errors;
    }
}
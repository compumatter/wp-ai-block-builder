<?php
namespace CM\A_Test;

class A_Test_Config {
    public static function get_defaults() {
        return [
            'message' => 'Hello Test',
            'fontSize' => '32px',
            'className' => ''
        ];
    }

    public static function get_asset_handles() {
        return [
            'editor_js' => 'a-test-editor-js',
            'centralized_js' => 'a-test-centralized-js',
            'style' => 'a-test-style'
        ];
    }

    public static function get_file_paths() {
        return [
            'editor_js' => 'editor.js',
            'centralized_js' => 'centralized.js',
            'style' => 'centralized.css'
        ];
    }

    public static function sanitize_attributes($attributes) {
        $defaults = self::get_defaults();
        $sanitized = [];
        
        foreach ($defaults as $key => $default_value) {
            $sanitized[$key] = isset($attributes[$key]) 
                ? self::sanitize_single_attribute($key, $attributes[$key])
                : $default_value;
        }
        
        return $sanitized;
    }

    public static function get_enhanced_wrapper_classes($attributes) {
        $classes = ['wp-block-cm-a-test'];
        if (!empty($attributes['className'])) {
            $classes[] = $attributes['className'];
        }
        return implode(' ', $classes);
    }

    public static function build_global_css_properties($attributes = []) {
        $attrs = self::sanitize_attributes($attributes);
        return [
            '--a-test-font-size' => $attrs['fontSize']
        ];
    }

    public static function get_javascript_constants() {
        return [
            'defaults' => self::get_defaults(),
            'selectors' => self::get_css_selectors(),
            'responsive' => self::get_responsive_constants()
        ];
    }

    public static function get_css_selectors() {
        return [
            'root' => '.wp-block-cm-a-test',
            'message' => '.wp-block-cm-a-test__message'
        ];
    }

    public static function get_responsive_constants() {
        return [
            'breakpoints' => [
                'mobile' => '767px',
                'tablet' => '1024px'
            ]
        ];
    }

    public static function get_validation_rules() {
        return [
            'message' => ['type' => 'string'],
            'fontSize' => ['type' => 'string', 'pattern' => '/^\d+px$/'],
            'className' => ['type' => 'string']
        ];
    }

    private static function sanitize_single_attribute($key, $value) {
        switch ($key) {
            case 'message':
                return sanitize_text_field($value);
            case 'fontSize':
                return preg_match('/^\d+px$/', $value) ? $value : self::get_defaults()['fontSize'];
            case 'className':
                return sanitize_html_class($value);
            default:
                return '';
        }
    }
}

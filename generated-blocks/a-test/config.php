<?php
namespace CM\A_Test;

class Config {
    private static $initiated = false;
    
    public static function init() {
        if (!self::$initiated) {
            self::$initiated = true;
        }
    }

    public static function get_handle($suffix = '') {
        return 'cm-a-test' . ($suffix ? '-' . $suffix : '');
    }

    public static function get_path($type = '') {
        $path = plugin_dir_path(__DIR__);
        switch($type) {
            case 'uri':
                return plugin_dir_url(__DIR__);
            default:
                return $path;
        }
    }

    public static function get_defaults() {
        return [
            'content' => 'Hello Test'
        ];
    }

    public static function get_css() {
        return [
            '.wp-block-cm-a-test' => [
                'font-size' => '32px',
                'font-weight' => 'bold',
                'text-align' => 'center',
                'padding' => '20px'
            ]
        ];
    }
}
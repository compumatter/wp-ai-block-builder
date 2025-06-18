<?php
/**
 * Hello World Block - Server-side render
 *
 * @var array $attributes Block attributes
 * @var string $content Block content
 * @var WP_Block $block Block instance
 */

// Include centralized configuration
require_once __DIR__ . '/config.php';

// Sanitize attributes using centralized configuration
$sanitized_attributes = CM_Hello_World_Config::sanitize_attributes($attributes);
$defaults = CM_Hello_World_Config::get_defaults();

// Extract sanitized attributes with fallbacks to defaults
$message = $sanitized_attributes['message'] ?? $defaults['message'];

// Handle custom style attributes
$custom_background_color = $sanitized_attributes['customBackgroundColor'] ?? '';
$custom_text_color = $sanitized_attributes['customTextColor'] ?? '';
$custom_padding = $sanitized_attributes['customPadding'] ?? null;

// Build wrapper classes using centralized processor (now includes container classes)
$wrapper_classes = CM_Hello_World_Config::get_enhanced_wrapper_classes(
    array_merge($sanitized_attributes, $attributes)
);

/**
 * Generate custom styles based on block attributes
 */
function generate_custom_styles($background_color, $text_color, $padding) {
    $styles = array();
    
    // Background color
    if (!empty($background_color)) {
        $styles[] = 'background-color: ' . esc_attr($background_color);
    }
    
    // Text color  
    if (!empty($text_color)) {
        $styles[] = 'color: ' . esc_attr($text_color);
    }
    
    // Padding styles
    if (!empty($padding) && is_array($padding)) {
        $padding_sides = array('top', 'right', 'bottom', 'left');
        
        foreach ($padding_sides as $side) {
            if (isset($padding[$side]) && !empty($padding[$side])) {
                $styles[] = "padding-{$side}: " . esc_attr($padding[$side]);
            }
        }
    }
    
    return !empty($styles) ? implode('; ', $styles) : '';
}

// Generate the complete style string
$custom_styles = generate_custom_styles($custom_background_color, $custom_text_color, $custom_padding);

// Combine with any existing global styles
$inline_styles = CM_Hello_World_Config::build_global_css_properties($sanitized_attributes);
if (!empty($custom_styles)) {
    $inline_styles = !empty($inline_styles) ? $inline_styles . '; ' . $custom_styles : $custom_styles;
}

?>

<div class="<?php echo esc_attr($wrapper_classes); ?>" 
     <?php if (!empty($inline_styles)): ?>
     style="<?php echo esc_attr($inline_styles); ?>"
     <?php endif; ?>
     data-block="cm-hello-world">
    
    <p class="cm-hello-world-content">
        <?php echo esc_html($message); ?>
    </p>
    
</div>
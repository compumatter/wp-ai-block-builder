<?php
namespace CM\A_Test;

if (!defined('ABSPATH')) exit;

$attributes = A_Test_Config::sanitize_attributes($attributes ?? []);
$wrapper_classes = A_Test_Config::get_enhanced_wrapper_classes($attributes);
?>

<div class="<?php echo esc_attr($wrapper_classes); ?>">
    <p class="wp-block-cm-a-test__message">
        <?php echo esc_html($attributes['message']); ?>
    </p>
</div>
namespace CompuMatter\Blocks\CmHelloAgain;

require_once __DIR__ . '/config.php';

function render_cm_cm_hello_again_block( $attributes, $content, $block ) {
    // Sanitize attributes using SSOT configuration
    $attributes = CM_Cm_Hello_Again_Config::sanitize_attributes( $attributes );
    
    // Get wrapper classes from SSOT configuration (returns array)
    $wrapper_classes = CM_Cm_Hello_Again_Config::get_enhanced_wrapper_classes( $attributes );
    
    // Build inline styles from SSOT configuration
    $wrapper_styles = CM_Cm_Hello_Again_Config::build_global_css_properties( $attributes );
    
    // Get the name from attributes with default
    $name = $attributes['name'] ?? 'Jay';
    
    // Build the block HTML
    ob_start();
    ?>
    <div 
        class="<?php echo esc_attr( implode( ' ', $wrapper_classes ) ); ?>"
        style="<?php echo esc_attr( $wrapper_styles ); ?>"
        data-block="cm-cm-hello-again"
    >
        <button type="button" class="cm-cm-hello-again__button" onclick="alert('Hello <?php echo esc_js( $name ); ?>')">
            <?php echo esc_html( 'Say Hello to ' . $name ); ?>
        </button>
    </div>
    <?php
    return ob_get_clean();
}
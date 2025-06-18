/**
 * Hello World Block - Universal JavaScript
 * Works in frontend, FSE editor, and block editor environments
 */

(function() {
    'use strict';
    
    // Environment detection
    const isWordPressEditor = typeof wp !== 'undefined' && wp.blocks;
    const isFSE = document.body.classList.contains('block-editor-page') ||
                  document.querySelector('.editor-styles-wrapper') !== null;
    const isFrontend = !isWordPressEditor && !isFSE;
    
    // Configuration from PHP - no hardcoded values
    const CONFIG = window.cmHelloWorldConfig || {};
    
    // Fail gracefully if configuration missing
    if (!CONFIG.defaults || !CONFIG.selectors) {
        console.error('Hello World Block: PHP configuration not loaded. Block will not function.');
        return;
    }
    
    /**
     * Initialize block functionality
     */
    function initializeBlock() {
        const blocks = document.querySelectorAll(CONFIG.selectors.wrapper);
        
        blocks.forEach(block => {
            setupBlockBehavior(block);
        });
    }
    
    /**
     * Setup individual block behavior
     */
    function setupBlockBehavior(blockElement) {
        // Add any interactive functionality here
        // For now, just log that the block was initialized
        if (CONFIG.environment && CONFIG.environment.isWordPress) {
            console.log('Hello World block initialized:', blockElement);
        }
        
        // Example: Add click handler
        blockElement.addEventListener('click', function() {
            console.log('Hello World block clicked!');
        });
        
        // Add a data attribute to mark as initialized
        blockElement.setAttribute('data-initialized', 'true');
    }
    
    /**
     * Environment-aware initialization
     */
    function initialize() {
        if (isFrontend) {
            // Frontend initialization
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeBlock);
            } else {
                initializeBlock();
            }
        } else if (isFSE) {
            // FSE editor initialization
            const observer = new MutationObserver(() => {
                initializeBlock();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Initial setup
            initializeBlock();
        }
    }
    
    // Initialize based on environment
    initialize();
})();
(function() {
    'use strict';

    // Environment detection
    const isEditor = typeof wp !== 'undefined' && wp.blocks;
    const isFSE = document.body.classList.contains('block-editor-page');
    const isFrontend = !isEditor && !isFSE;

    // Import configuration
    const CONFIG = window.cmCmHelloAgainConfig || {};

    // Main functionality
    function showHelloJayAlert() {
        alert('Hello Jay');
    }

    // Initialize block functionality
    function initializeBlock(container) {
        if (!container) return;

        // Add click listener to show alert
        container.addEventListener('click', showHelloJayAlert);
        
        // Add visual indicator that block is clickable
        container.style.cursor = 'pointer';
    }

    // Find and initialize all block instances
    function initializeAllBlocks() {
        const blocks = document.querySelectorAll(CONFIG.selectors.wrapper);
        blocks.forEach(initializeBlock);
    }

    // Mutation observer for dynamic content
    function observeBlockAdditions() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        if (node.matches && node.matches(CONFIG.selectors.wrapper)) {
                            initializeBlock(node);
                        }
                        const blocks = node.querySelectorAll ? node.querySelectorAll(CONFIG.selectors.wrapper) : [];
                        blocks.forEach(initializeBlock);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize based on environment
    if (isFrontend) {
        // Frontend: Wait for DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initializeAllBlocks();
                observeBlockAdditions();
            });
        } else {
            initializeAllBlocks();
            observeBlockAdditions();
        }
    } else if (isFSE || isEditor) {
        // FSE/Editor: Use mutation observer immediately
        observeBlockAdditions();
        // Also check for existing blocks
        setTimeout(initializeAllBlocks, 100);
    }

    // Export for external use
    window.cmCmHelloAgain = {
        initialize: initializeAllBlocks,
        initializeBlock: initializeBlock
    };
})();
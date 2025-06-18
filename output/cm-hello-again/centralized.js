(function() {
    'use strict';

    const CONFIG = window.cmHelloJayConfig || {};
    const BLOCK_NAME = 'cm-hello-jay';
    
    if (!CONFIG) {
        console.error(`${BLOCK_NAME}: Configuration not found`);
        return;
    }

    const isEditor = window.wp && window.wp.blocks;
    const isFSE = document.body.classList.contains('block-editor-page') || 
                  document.querySelector('.edit-site-visual-editor__editor-canvas');

    function initializeBlock(container) {
        if (!container) return;

        const button = container.querySelector('button');
        if (!button) return;

        button.addEventListener('click', function() {
            alert('Hello Jay');
        });
    }

    function initializeAllBlocks() {
        const blocks = document.querySelectorAll(CONFIG.selectors.wrapper);
        blocks.forEach(block => initializeBlock(block));
    }

    if (isEditor || isFSE) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        if (node.matches && node.matches(CONFIG.selectors.wrapper)) {
                            initializeBlock(node);
                        }
                        if (node.querySelectorAll) {
                            const blocks = node.querySelectorAll(CONFIG.selectors.wrapper);
                            blocks.forEach(block => initializeBlock(block));
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeAllBlocks);
        } else {
            initializeAllBlocks();
        }
    } else {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeAllBlocks);
        } else {
            initializeAllBlocks();
        }
    }
})();
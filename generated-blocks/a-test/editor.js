(function() {
    'use strict';

    const { registerBlockType } = wp.blocks;
    const { useBlockProps } = wp.blockEditor;
    const { CONFIG } = window.cm.aTest;

    if (!CONFIG) {
        console.error('A Test block configuration not found');
        return;
    }

    registerBlockType('cm/a-test', {
        edit: function(props) {
            const { attributes, setAttributes } = props;
            const blockProps = useBlockProps({
                className: CONFIG.selectors.root.slice(1)
            });

            return wp.element.createElement(
                'div',
                blockProps,
                wp.element.createElement(
                    'h2',
                    { className: CONFIG.selectors.message.slice(1) },
                    attributes.message || CONFIG.defaults.message
                )
            );
        },
        save: function() {
            return null;
        }
    });
})();
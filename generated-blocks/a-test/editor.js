(function() {
    'use strict';

    const { registerBlockType } = wp.blocks;
    const { useBlockProps } = wp.blockEditor;
    const { CONFIG } = window.cmATest;

    if (!CONFIG) {
        console.error('A Test block: Configuration missing');
        return;
    }

    registerBlockType('cm/a-test', {
        edit: function(props) {
            const { attributes, setAttributes } = props;
            const blockProps = useBlockProps();
            
            const message = attributes.message || CONFIG.defaults.message;
            
            return wp.element.createElement(
                'div',
                blockProps,
                wp.element.createElement(
                    'p',
                    { className: 'wp-block-cm-a-test__message' },
                    message
                )
            );
        },
        save: function() {
            return null;
        }
    });
})();
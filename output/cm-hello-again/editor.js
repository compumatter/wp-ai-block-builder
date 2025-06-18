(function() {
    'use strict';

    const { registerBlockType } = wp.blocks;
    const { createElement: el } = wp.element;
    const { InspectorControls, useBlockProps } = wp.blockEditor;
    const { PanelBody, TextControl } = wp.components;
    const { __ } = wp.i18n;

    // Get configuration from window
    const config = window.cmHelloJayConfig || {};
    
    // Validate configuration
    if (!config.blockName || !config.blockTitle) {
        console.error('CM Hello Jay: Missing required configuration');
        return;
    }

    // Process attributes helper
    function processAttributes(attributes) {
        const defaults = {
            name: 'Jay',
            isExample: false
        };
        
        return Object.assign({}, defaults, attributes);
    }

    // Register block
    registerBlockType(config.blockName, {
        title: config.blockTitle,
        description: config.blockDescription || __('Displays Hello message in an alert box', 'cm-hello-jay'),
        category: config.blockCategory || 'common',
        icon: config.blockIcon || 'admin-comments',
        supports: config.blockSupports || {
            html: false,
            align: ['wide', 'full']
        },
        attributes: {
            name: {
                type: 'string',
                default: 'Jay'
            },
            isExample: {
                type: 'boolean',
                default: false
            }
        },
        example: {
            attributes: {
                name: 'Jay',
                isExample: true
            }
        },
        edit: function(props) {
            const { attributes, setAttributes } = props;
            const processedAttributes = processAttributes(attributes);
            const blockProps = useBlockProps();

            // Show example image if in preview mode
            if (processedAttributes.isExample && config.exampleImage) {
                return el('div', blockProps,
                    el('img', {
                        src: config.exampleImage,
                        alt: config.blockTitle,
                        style: { width: '100%', height: 'auto' }
                    })
                );
            }

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Alert Settings', 'cm-hello-jay') },
                        el(TextControl, {
                            label: __('Name', 'cm-hello-jay'),
                            value: processedAttributes.name,
                            onChange: (value) => setAttributes({ name: value }),
                            help: __('Enter the name to display in the alert', 'cm-hello-jay')
                        })
                    )
                ),
                el('div', { className: 'cm-hello-jay-editor' },
                    el('div', { className: 'cm-hello-jay-preview' },
                        el('p', {}, __('Alert box will display:', 'cm-hello-jay')),
                        el('code', {}, 'Hello ' + processedAttributes.name)
                    )
                )
            );
        },
        save: function() {
            return null;
        }
    });
})();
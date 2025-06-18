(function() {
    'use strict';

    const { registerBlockType } = wp.blocks;
    const { createElement: el } = wp.element;
    const { InspectorControls, useBlockProps } = wp.blockEditor;
    const { PanelBody, TextControl, ToggleControl } = wp.components;
    const { __ } = wp.i18n;

    // Get configuration from window object
    const config = window.cmHelloAgainConfig || {};
    
    // Validate configuration
    if (!config.blockName) {
        console.error('cm-hello-again: Missing blockName in configuration');
        return;
    }

    // Process attributes with defaults
    function processAttributes(attributes) {
        const defaults = {
            message: 'Hello Jay',
            showAlert: true,
            isExample: false
        };
        
        return Object.assign({}, defaults, attributes);
    }

    // Register the block
    registerBlockType(config.blockName, {
        title: config.title || __('CM Hello Again', 'cm-hello-again'),
        description: config.description || __('Displays Hello Jay in an alert box', 'cm-hello-again'),
        category: config.category || 'widgets',
        icon: config.icon || 'megaphone',
        supports: config.supports || {
            html: false,
            align: ['wide', 'full']
        },
        attributes: config.attributes || {
            message: {
                type: 'string',
                default: 'Hello Jay'
            },
            showAlert: {
                type: 'boolean',
                default: true
            },
            isExample: {
                type: 'boolean',
                default: false
            }
        },
        example: {
            attributes: {
                isExample: true
            }
        },
        edit: function(props) {
            const { attributes, setAttributes } = props;
            const processedAttributes = processAttributes(attributes);
            const blockProps = useBlockProps();

            // Handle example preview
            if (processedAttributes.isExample && config.previewImage) {
                return el('div', blockProps,
                    el('img', {
                        src: config.previewImage,
                        alt: config.title || __('CM Hello Again Preview', 'cm-hello-again'),
                        style: { width: '100%', height: 'auto' }
                    })
                );
            }

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Alert Settings', 'cm-hello-again') },
                        el(TextControl, {
                            label: __('Alert Message', 'cm-hello-again'),
                            value: processedAttributes.message,
                            onChange: (value) => setAttributes({ message: value })
                        }),
                        el(ToggleControl, {
                            label: __('Show Alert Box', 'cm-hello-again'),
                            checked: processedAttributes.showAlert,
                            onChange: (value) => setAttributes({ showAlert: value })
                        })
                    )
                ),
                el('div', { className: 'cm-hello-again-editor' },
                    processedAttributes.showAlert ? 
                        el('div', { 
                            className: 'alert-preview',
                            style: {
                                padding: '15px',
                                backgroundColor: '#f0f0f0',
                                border: '1px solid #ccc',
                                borderRadius: '4px'
                            }
                        }, processedAttributes.message) :
                        el('p', {}, __('Alert box is hidden', 'cm-hello-again'))
                )
            );
        },
        save: function() {
            return null;
        }
    });
})();
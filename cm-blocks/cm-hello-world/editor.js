(function() {
    'use strict';
    
    const { __ } = wp.i18n;
    const { registerBlockType } = wp.blocks;
    const { InspectorControls, useBlockProps, ColorPalette, RichText } = wp.blockEditor;
    const { 
        PanelBody, 
        TextControl, 
        RangeControl,
        SelectControl,
        BaseControl,
        ButtonGroup,
        Button,
        __experimentalBoxControl: BoxControl,
        ColorPicker,
        Popover,
        ToggleControl
    } = wp.components;
    const { Fragment, createElement, useEffect, useState } = wp.element;

    // Import centralized configuration - NO hardcoded defaults
    let CONFIG = window.cmHelloWorldConfig;

    // Validation of configuration availability
    if (!CONFIG || !CONFIG.defaults) {
        console.error('Hello World Block: PHP configuration not loaded. Block may not function correctly.');
        CONFIG = { 
            defaults: {
                message: 'Hello World',
                isExample: false
            }, 
            selectors: {},
        };
    }

    /**
     * Enhanced attribute processing with centralized defaults
     */
    function processAttributes(attributes) {
        const processed = { 
            ...CONFIG.defaults, 
            ...attributes,
            // Ensure custom style attributes have defaults
            customBackgroundColor: attributes.customBackgroundColor || '',
            customTextColor: attributes.customTextColor || '',
            customBorder: attributes.customBorder || {
                top: { width: "0px", style: "solid", color: "#000000" },
                right: { width: "0px", style: "solid", color: "#000000" },
                bottom: { width: "0px", style: "solid", color: "#000000" },
                left: { width: "0px", style: "solid", color: "#000000" }
            },
            customPadding: attributes.customPadding || {
                top: "0px",
                right: "0px", 
                bottom: "0px",
                left: "0px"
            }
        };
        return processed;
    }

    /**
     * Custom Border Control Component similar to cm-menus visual interface
     */
    function CustomBorderControl({ border, onChange }) {
        
        const [selectedSides, setSelectedSides] = useState(['top', 'right', 'bottom', 'left']);
        const [showColorPicker, setShowColorPicker] = useState(false);
        
        // Get the first selected side for unified controls
        const primarySide = selectedSides[0] || 'top';
        const currentBorder = border[primarySide] || { width: "0px", style: "solid", color: "#000000" };
        
        const updateBorder = (property, value) => {
            const newBorder = { ...border };
            selectedSides.forEach(side => {
                if (!newBorder[side]) {
                    newBorder[side] = { width: "0px", style: "solid", color: "#000000" };
                }
                newBorder[side][property] = value;
            });
            onChange(newBorder);
        };

        const toggleSide = (side) => {
            const newSelected = selectedSides.includes(side)
                ? selectedSides.filter(s => s !== side)
                : [...selectedSides, side];
            
            if (newSelected.length > 0) {
                setSelectedSides(newSelected);
            }
        };

        // Parse width value and unit
        const parseWidth = (widthStr) => {
            const match = widthStr.match(/^(\d*\.?\d+)(px|em|rem|%)$/);
            return match ? { value: parseFloat(match[1]), unit: match[2] } : { value: 0, unit: 'px' };
        };

        const currentWidth = parseWidth(currentBorder.width);

        return createElement('div', { className: 'cm-border-control' }, [
            // Compact 3-column layout: SIDES, TYPE, COLOR
            createElement('div', {
                key: 'border-main-controls',
                className: 'cm-border-main-row',
                style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '15px',
                    marginBottom: '20px'
                }
            }, [
                // SIDES column
                createElement('div', {
                    key: 'sides-column',
                    style: { textAlign: 'center' }
                }, [
                    createElement('div', {
                        key: 'sides-label',
                        style: {
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#666',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }
                    }, __('SIDES', 'cm_hello_world')),
                    createElement('div', {
                        key: 'border-box',
                        style: {
                            position: 'relative',
                            width: '50px',
                            height: '50px',
                            border: '2px dashed #ddd',
                            borderRadius: '4px',
                            margin: '0 auto'
                        }
                    }, [
                        // Top border
                        createElement('div', {
                            key: 'top',
                            onClick: () => toggleSide('top'),
                            style: {
                                position: 'absolute',
                                top: '-3px',
                                left: '25%',
                                width: '50%',
                                height: '6px',
                                backgroundColor: selectedSides.includes('top') ? '#007cba' : '#ddd',
                                cursor: 'pointer',
                                borderRadius: '2px'
                            }
                        }),
                        // Right border
                        createElement('div', {
                            key: 'right',
                            onClick: () => toggleSide('right'),
                            style: {
                                position: 'absolute',
                                top: '25%',
                                right: '-3px',
                                width: '6px',
                                height: '50%',
                                backgroundColor: selectedSides.includes('right') ? '#007cba' : '#ddd',
                                cursor: 'pointer',
                                borderRadius: '2px'
                            }
                        }),
                        // Bottom border  
                        createElement('div', {
                            key: 'bottom',
                            onClick: () => toggleSide('bottom'),
                            style: {
                                position: 'absolute',
                                bottom: '-3px',
                                left: '25%',
                                width: '50%',
                                height: '6px',
                                backgroundColor: selectedSides.includes('bottom') ? '#007cba' : '#ddd',
                                cursor: 'pointer',
                                borderRadius: '2px'
                            }
                        }),
                        // Left border
                        createElement('div', {
                            key: 'left',
                            onClick: () => toggleSide('left'),
                            style: {
                                position: 'absolute',
                                top: '25%',
                                left: '-3px',
                                width: '6px',
                                height: '50%',
                                backgroundColor: selectedSides.includes('left') ? '#007cba' : '#ddd',
                                cursor: 'pointer',
                                borderRadius: '2px'
                            }
                        })
                    ])
                ]),
                
                // TYPE column
                createElement('div', {
                    key: 'type-column'
                }, [
                    createElement('div', {
                        key: 'type-label',
                        style: {
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#666',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }
                    }, __('TYPE', 'cm_hello_world')),
                    createElement(SelectControl, {
                        key: 'style-control',
                        value: currentBorder.style,
                        options: [
                            { label: 'Solid', value: 'solid' },
                            { label: 'Dashed', value: 'dashed' },
                            { label: 'Dotted', value: 'dotted' },
                            { label: 'Double', value: 'double' },
                            { label: 'None', value: 'none' }
                        ],
                        onChange: (value) => updateBorder('style', value)
                    })
                ]),
                
                // COLOR column
                createElement('div', {
                    key: 'color-column',
                    style: { textAlign: 'center' }
                }, [
                    createElement('div', {
                        key: 'color-label',
                        style: {
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#666',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }
                    }, __('COLOR', 'cm_hello_world')),
                    createElement('div', {
                        key: 'color-wrapper',
                        style: { position: 'relative', display: 'inline-block' }
                    }, [
                        createElement('div', {
                            key: 'color-display',
                            onClick: () => setShowColorPicker(!showColorPicker),
                            style: {
                                width: '50px',
                                height: '30px',
                                backgroundColor: currentBorder.color,
                                border: '1px solid #ddd',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }
                        }),
                        showColorPicker && createElement(Popover, {
                            key: 'color-popover',
                            onClose: () => setShowColorPicker(false)
                        }, [
                            createElement(ColorPicker, {
                                key: 'color-picker',
                                color: currentBorder.color,
                                onChange: (color) => updateBorder('color', color),
                                enableAlpha: true
                            })
                        ])
                    ])
                ])
            ]),
            
            // WIDTH section below
            createElement('div', {
                key: 'width-section'
            }, [
                createElement('div', {
                    key: 'width-label',
                    style: {
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#666',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }
                }, __('WIDTH', 'cm_hello_world')),
                createElement('div', {
                    key: 'width-controls',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        width: '100%'
                    }
                }, [
                    createElement(RangeControl, {
                        key: 'width-range-control',
                        value: currentWidth.value,
                        onChange: (value) => updateBorder('width', `${value}${currentWidth.unit}`),
                        min: 0,
                        max: currentWidth.unit === 'px' ? 10 : (currentWidth.unit === 'em' ? 2 : 2),
                        step: currentWidth.unit === 'px' ? 0.5 : 0.1,
                        withInputField: true,
                        style: { flex: '1', minWidth: '100px' }
                    }),
                    createElement(SelectControl, {
                        key: 'width-unit-select',
                        value: currentWidth.unit,
                        options: [
                            { label: 'px', value: 'px' },
                            { label: 'em', value: 'em' },
                            { label: 'rem', value: 'rem' }
                        ],
                        onChange: (unit) => updateBorder('width', `${currentWidth.value}${unit}`),
                        style: { width: '70px', flexShrink: '0' }
                    })
                ]),
            ])
        ]);
    }


    /**
     * Custom Color Control Component with picker similar to cm-menus
     */
    function CustomColorControl({ label, color, onChange }) {
        
        const [showColorPicker, setShowColorPicker] = useState(false);

        return createElement('div', { className: 'cm-color-control' }, [
            createElement(BaseControl, {
                key: 'color-base',
                label: label
            }),
            createElement('div', {
                key: 'color-wrapper',
                style: { position: 'relative' }
            }, [
                createElement('div', {
                    key: 'color-display',
                    onClick: () => setShowColorPicker(!showColorPicker),
                    style: {
                        width: '40px',
                        height: '30px',
                        backgroundColor: color || 'transparent',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        display: 'inline-block'
                    }
                }),
                showColorPicker && createElement(Popover, {
                    key: 'color-popover',
                    onClose: () => setShowColorPicker(false)
                }, [
                    createElement(ColorPicker, {
                        key: 'color-picker',
                        color: color || '#000000',
                        onChange: onChange,
                        enableAlpha: true
                    })
                ])
            ])
        ]);
    }

    /**
     * Enhanced editor component with stable hook usage and custom style controls
     */
    function BlockEdit({ attributes, setAttributes }) {
        // ALL React hooks must be called before any early returns
        const blockProps = useBlockProps();
        const processedAttributes = processAttributes(attributes);
        
        
        // Check if this is the example preview
        if (processedAttributes.isExample) {
            return createElement('img', {
                src: '/wp-content/themes/word4ya/cm-blocks/cm-hello-world/preview.png',
                alt: 'Hello World Block preview',
                style: { 
                    width: '100%', 
                    maxWidth: '400px',
                    display: 'block'
                },
                onError: (e) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<div style="width:100%;max-width:400px;height:200px;background:#ccc;display:flex;align-items:center;justify-content:center;color:#666;">Preview image not found</div>';
                }
            });
        }
        
        // Environment-specific setup
        useEffect(() => {
            // Block initialized
        }, []);

        // Update attribute handler
        const updateAttribute = (key, value) => {
            setAttributes({ [key]: value });
        };

        // Generate dynamic styles from attributes
        const generateBlockStyles = () => {
            const styles = {};
            
            // Background color - use cmBackgroundColor from FSE panel
            if (attributes.cmBackgroundColor) {
                styles.backgroundColor = attributes.cmBackgroundColor;
            }
            
            // Text color - use cmTextColor from FSE panel
            if (attributes.cmTextColor) {
                styles.color = attributes.cmTextColor;
            }
            
            // Border styles – sourced exclusively from the global cmBorder attribute injected by ui-fse-panel.
            const border = attributes.cmBorder;
            if (border) {
                // Check if any border has width > 0
                const hasBorder = Object.values(border).some(side =>
                    parseFloat(side.width) > 0
                );
                
                if (hasBorder) {
                    styles.borderTop = `${border.top.width} ${border.top.style} ${border.top.color}`;
                    styles.borderRight = `${border.right.width} ${border.right.style} ${border.right.color}`;
                    styles.borderBottom = `${border.bottom.width} ${border.bottom.style} ${border.bottom.color}`;
                    styles.borderLeft = `${border.left.width} ${border.left.style} ${border.left.color}`;
                }
            }
            
            // Padding styles - use cmPadding from FSE panel
            const padding = attributes.cmPadding;
            if (padding) {
                // Extract values from FSE panel structure: { top: { value: "20px" } }
                const paddingTop = padding.top?.value || padding.top;
                const paddingRight = padding.right?.value || padding.right;
                const paddingBottom = padding.bottom?.value || padding.bottom;
                const paddingLeft = padding.left?.value || padding.left;
                
                // Check if values are valid (not "0px" or empty)
                const hasValidPadding = [paddingTop, paddingRight, paddingBottom, paddingLeft].some(val =>
                    val && val !== '0px' && val !== '0'
                );
                
                if (hasValidPadding) {
                    if (paddingTop && paddingTop !== '0px') styles.paddingTop = paddingTop;
                    if (paddingRight && paddingRight !== '0px') styles.paddingRight = paddingRight;
                    if (paddingBottom && paddingBottom !== '0px') styles.paddingBottom = paddingBottom;
                    if (paddingLeft && paddingLeft !== '0px') styles.paddingLeft = paddingLeft;
                }
            }
            
            // Margin styles - use cmMargin from FSE panel
            const margin = attributes.cmMargin;
            if (margin) {
                // Extract values from FSE panel structure: { top: { value: "20px" } }
                const marginTop = margin.top?.value || margin.top;
                const marginRight = margin.right?.value || margin.right;
                const marginBottom = margin.bottom?.value || margin.bottom;
                const marginLeft = margin.left?.value || margin.left;
                
                // Check if values are valid (not "0px" or empty)
                const hasValidMargin = [marginTop, marginRight, marginBottom, marginLeft].some(val =>
                    val && val !== '0px' && val !== '0'
                );
                
                if (hasValidMargin) {
                    if (marginTop && marginTop !== '0px') styles.marginTop = marginTop;
                    if (marginRight && marginRight !== '0px') styles.marginRight = marginRight;
                    if (marginBottom && marginBottom !== '0px') styles.marginBottom = marginBottom;
                    if (marginLeft && marginLeft !== '0px') styles.marginLeft = marginLeft;
                }
            }
            
            return styles;
        };

        // Render editor interface
        return createElement(Fragment, null, [
            // Inspector Controls - all styling now handled by global Styles tab
            // No custom panels needed - WordPress default Advanced panel is sufficient
            createElement(InspectorControls, { key: 'inspector' }),
            
            // Block content with applied styles
            createElement('div', {
                key: 'content',
                ...blockProps,
                className: `${blockProps.className} cm-hello-world cm-cqi-container zc95 zo95 zm95 zp95 zu95 zt95 ze95`,
                style: generateBlockStyles()
            }, [
                createElement(RichText, {
                    key: 'hello-world-content',
                    tagName: 'p',
                    className: 'cm-hello-world-content',
                    value: processedAttributes.message,
                    onChange: (value) => updateAttribute('message', value),
                    placeholder: __('Type your message here...', 'cm_hello_world')
                })
            ])
        ]);
    }

    // Register block with enhanced configuration
    registerBlockType('cm/hello-world', {
        edit: BlockEdit,
        save: () => null // Server-side rendering
    });
    
})();
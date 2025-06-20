/**
 * SSOT Compliance Validator
 * 
 * Validates that AI-generated code follows Single Source of Truth principles
 * Prevents configuration drift and ensures centralized configuration
 */

class SSOTValidator {
    constructor() {
        this.violations = [];
        this.warnings = [];
    }

    /**
     * Main validation method - checks all SSOT compliance rules
     * @param {Object} files - Generated files from AI response
     * @returns {Object} Validation results with violations and warnings
     */
    validateCompliance(files) {
        console.log('🔍 Running SSOT compliance validation...');
        
        this.violations = [];
        this.warnings = [];

        // Run all validation checks
        this.validateBlockJsonDefaults(files);
        this.validateJavaScriptHardcodedValues(files);
        this.validateConfigCentralization(files);
        this.validateAssetHandles(files);
        this.validateCSSCustomProperties(files);

        const isValid = this.violations.length === 0;
        
        if (isValid) {
            console.log('✅ SSOT validation passed - no violations found');
        } else {
            console.error('❌ SSOT validation failed:');
            this.violations.forEach(violation => console.error(`  - ${violation}`));
        }

        if (this.warnings.length > 0) {
            console.warn('⚠️  SSOT warnings:');
            this.warnings.forEach(warning => console.warn(`  - ${warning}`));
        }

        return {
            valid: isValid,
            violations: this.violations,
            warnings: this.warnings
        };
    }

    /**
     * Check for default values in block.json (SSOT violation)
     */
    validateBlockJsonDefaults(files) {
        if (!files['block.json']) return;

        try {
            const content = typeof files['block.json'].content === 'string' 
                ? files['block.json'].content 
                : JSON.stringify(files['block.json'].content);
            
            const blockJson = JSON.parse(content);
            
            if (blockJson.attributes) {
                for (const [attrName, attrConfig] of Object.entries(blockJson.attributes)) {
                    if (attrConfig.hasOwnProperty('default')) {
                        this.violations.push(
                            `block.json contains default value for "${attrName}". ` +
                            `All defaults must be in config.php get_defaults() method only.`
                        );
                    }
                }
            }
        } catch (error) {
            this.warnings.push(`Could not parse block.json for SSOT validation: ${error.message}`);
        }
    }

    /**
     * Check for hardcoded values in JavaScript files
     */
    validateJavaScriptHardcodedValues(files) {
        const jsFiles = ['editor.js', 'centralized.js'];
        
        jsFiles.forEach(filename => {
            if (!files[filename]) return;

            const content = files[filename].content;
            
            // Check for hardcoded fallback patterns
            const hardcodedPatterns = [
                /\|\|\s*['"][^'"]+['"]/g,  // || 'hardcoded value'
                /\?\s*['"][^'"]+['"]/g,    // ? 'hardcoded value'
                /message:\s*['"][^'"]+['"](?!\s*,\s*)/g,  // message: 'hardcoded'
                /default:\s*['"][^'"]+['"](?!\s*,\s*)/g   // default: 'hardcoded'
            ];

            hardcodedPatterns.forEach((pattern, index) => {
                const matches = content.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        // Skip if it's clearly a CONFIG reference
                        if (!match.includes('CONFIG')) {
                            this.violations.push(
                                `${filename} contains hardcoded value: "${match.trim()}". ` +
                                `Use CONFIG.defaults instead.`
                            );
                        }
                    });
                }
            });

            // Check for missing CONFIG validation
            if (content.includes('CONFIG') && !content.includes('CONFIG.defaults')) {
                this.warnings.push(
                    `${filename} references CONFIG but may not be using CONFIG.defaults properly`
                );
            }
        });
    }

    /**
     * Check that config.php is the central source for all configuration
     */
    validateConfigCentralization(files) {
        if (!files['config.php']) {
            this.violations.push('config.php file is missing - required for SSOT compliance');
            return;
        }

        const configContent = files['config.php'].content;
        
        // Check for required methods
        const requiredMethods = [
            'get_defaults',
            'get_asset_handles',
            'get_file_paths',
            'sanitize_attributes',
            'get_javascript_constants'
        ];

        requiredMethods.forEach(method => {
            if (!configContent.includes(`function ${method}`) && 
                !configContent.includes(`public static function ${method}`)) {
                this.violations.push(
                    `config.php missing required SSOT method: ${method}()`
                );
            }
        });
    }

    /**
     * Check that asset handles come from config.php
     */
    validateAssetHandles(files) {
        if (files['registering.php']) {
            const content = files['registering.php'].content;
            
            // Look for hardcoded asset handles
            const hardcodedHandlePattern = /wp_(?:enqueue|register)_(?:script|style)\s*\(\s*['"][^'"]+['"]/g;
            const matches = content.match(hardcodedHandlePattern);
            
            if (matches) {
                matches.forEach(match => {
                    // Skip if it uses $asset_handles or similar variable
                    if (!match.includes('$asset_handles') && !match.includes('$handles')) {
                        this.violations.push(
                            `registering.php contains hardcoded asset handle: ${match.trim()}. ` +
                            `Use get_asset_handles() from config.php instead.`
                        );
                    }
                });
            }
        }
    }

    /**
     * Check for proper CSS custom properties usage
     */
    validateCSSCustomProperties(files) {
        if (files['centralized.css']) {
            const content = files['centralized.css'].content;
            
            // Look for hardcoded values that should be CSS custom properties
            const hardcodedValuePattern = /:\s*(?:#[0-9a-fA-F]{3,6}|[\d.]+(?:px|em|rem|%)|[a-zA-Z]+)(?:\s*!important)?\s*;/g;
            const matches = content.match(hardcodedValuePattern);
            
            if (matches && matches.length > 10) { // Allow some hardcoded values for basic structure
                this.warnings.push(
                    `centralized.css contains many hardcoded values. ` +
                    `Consider using CSS custom properties for dynamic values.`
                );
            }
        }
    }

    /**
     * Generate detailed violation report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                violations: this.violations.length,
                warnings: this.warnings.length,
                status: this.violations.length === 0 ? 'PASSED' : 'FAILED'
            },
            details: {
                violations: this.violations,
                warnings: this.warnings
            }
        };

        return report;
    }
}

module.exports = SSOTValidator; 
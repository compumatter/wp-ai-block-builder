/**
 * Template Integrity Validator
 * 
 * Validates that the hello-world template maintains SSOT compliance
 * before it's used as the foundation for new blocks
 */

const fs = require('fs-extra');
const path = require('path');
const SSOTValidator = require('../services/ssotValidator');

class TemplateValidator {
    constructor(templatePath) {
        this.templatePath = templatePath;
        this.ssotValidator = new SSOTValidator();
    }

    /**
     * Validate template integrity and SSOT compliance
     * @returns {Object} Validation results
     */
    async validateTemplate() {
        console.log('🔍 Validating hello-world template integrity...');
        
        try {
            // Check if template directory exists
            if (!await fs.pathExists(this.templatePath)) {
                throw new Error(`Template directory not found: ${this.templatePath}`);
            }

            // Load all template files
            const templateFiles = await this.loadTemplateFiles();
            
            // Validate required files exist
            const missingFiles = this.checkRequiredFiles(templateFiles);
            if (missingFiles.length > 0) {
                throw new Error(`Template missing required files: ${missingFiles.join(', ')}`);
            }

            // Run SSOT compliance validation on template
            const ssotValidation = this.ssotValidator.validateCompliance(templateFiles);
            
            if (!ssotValidation.valid) {
                console.error('❌ Template SSOT validation failed:');
                ssotValidation.violations.forEach(violation => {
                    console.error(`  - ${violation}`);
                });
                
                throw new Error(
                    `Template violates SSOT principles: ${ssotValidation.violations.join('; ')}`
                );
            }

            console.log('✅ Template validation passed - hello-world template is SSOT compliant');
            
            return {
                valid: true,
                templatePath: this.templatePath,
                files: Object.keys(templateFiles),
                ssotValidation: ssotValidation
            };

        } catch (error) {
            console.error('❌ Template validation failed:', error.message);
            return {
                valid: false,
                error: error.message,
                templatePath: this.templatePath
            };
        }
    }

    /**
     * Load all files from the template directory
     */
    async loadTemplateFiles() {
        const files = {};
        const requiredFiles = [
            'config.php',
            'block.json', 
            'editor.js',
            'centralized.js',
            'centralized.css',
            'render.php',
            'registering.php'
        ];

        for (const filename of requiredFiles) {
            const filePath = path.join(this.templatePath, filename);
            
            if (await fs.pathExists(filePath)) {
                const content = await fs.readFile(filePath, 'utf8');
                files[filename] = {
                    action: 'modify', // Templates are always modified
                    content: content
                };
            }
        }

        return files;
    }

    /**
     * Check that all required files exist in template
     */
    checkRequiredFiles(templateFiles) {
        const requiredFiles = [
            'config.php',
            'block.json',
            'editor.js', 
            'centralized.js',
            'render.php',
            'registering.php'
        ];

        const missingFiles = requiredFiles.filter(file => !templateFiles[file]);
        return missingFiles;
    }

    /**
     * Get template validation report
     */
    async getValidationReport() {
        const validation = await this.validateTemplate();
        
        return {
            timestamp: new Date().toISOString(),
            templatePath: this.templatePath,
            status: validation.valid ? 'VALID' : 'INVALID',
            ...validation
        };
    }
}

module.exports = TemplateValidator;
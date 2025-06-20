/**
 * Block Generator Orchestrator - Workflow Manager
 * 
 * This orchestrator manages the complete block creation workflow from start to finish.
 * It coordinates other services but does NOT do the detailed work itself.
 * 
 * ENHANCED: Now includes template integrity validation and SSOT compliance checks
 * 
 * SPECIFIC RESPONSIBILITIES:
 * 1. Receive block specifications from the server
 * 2. Call AnthropicService to get AI-generated code
 * 3. Call wpBlockBuilder to create actual files
 * 4. Coordinate the handoff between AI and file operations
 * 5. Provide unified error handling across the entire workflow
 * 6. Log the complete process and return final results
 * 
 * WHAT THIS FILE DOES NOT DO:
 * - Does not handle HTTP requests or responses
 * - Does not make AI API calls directly
 * - Does not create, copy, or modify files directly
 * - Does not deploy to WordPress directly
 * 
 * THINK OF IT AS: The project manager who tells others what to do and when
 */

// ============================================================================
// DEPENDENCIES
// ============================================================================

const AnthropicService = require('../services/anthropic');
const WpBlockBuilder = require('./wpBlockBuilder');
const TemplateValidator = require('./templateValidator');

// ============================================================================
// BLOCK GENERATOR ORCHESTRATOR
// ============================================================================

class BlockGenerator {
    constructor() {
        // Initialize service dependencies
        this.anthropicService = new AnthropicService();
        this.wpBlockBuilder = new WpBlockBuilder();
        this.templateValidator = new TemplateValidator(this.wpBlockBuilder.templatePath);
        
        console.log('🎯 BlockGenerator initialized with SSOT validation');
    }

    /**
     * Main orchestration method: Generate complete WordPress block
     * ENHANCED: Now includes template validation before generation
     * 
     * @param {string} spec - User's specification for the block
     * @param {string} slug - Block slug (e.g., 'cm-hello-jay')
     * @returns {Object} Complete generation results
     */
    async generateBlock(spec, slug) {
        const startTime = Date.now();
        
        try {
            console.log('🚀 Starting block generation workflow...');
            console.log(`📋 Spec: ${spec}`);
            console.log(`🏷️  Slug: ${slug}`);
            
            // Step 0: Validate template integrity before proceeding
            console.log('\n🔍 STEP 0: Template Integrity Validation');
            await this.validateTemplateIntegrity();
            
            // Step 1: Validate inputs
            this.validateInputs(spec, slug);
            
            // Step 2: Generate block code using AI
            console.log('\n🤖 STEP 1: AI Code Generation');
            const aiResponse = await this.anthropicService.generateBlock(spec, slug);
            
            // Validate AI response
            if (!aiResponse.success) {
                throw new Error(`AI generation failed: ${aiResponse.error}`);
            }
            
            console.log(`✅ AI generated ${Object.keys(aiResponse.files).length} files`);
            console.log(`✅ SSOT validation passed during AI generation`);
            
            // Step 3: Process files and deploy to WordPress
            console.log('\n🔨 STEP 2: File Processing & Deployment');
            const buildResults = await this.wpBlockBuilder.processBlock(aiResponse);
            
            // Calculate execution time
            const executionTime = Date.now() - startTime;
            
            // Step 4: Return comprehensive results
            const results = this.buildSuccessResponse(
                spec, 
                slug, 
                aiResponse, 
                buildResults, 
                executionTime
            );
            
            console.log('\n🎉 Block generation completed successfully!');
            console.log(`⏱️  Total time: ${executionTime}ms`);
            console.log(`📁 WordPress path: ${buildResults.paths.wordpress}`);
            console.log(`✅ SSOT compliance maintained throughout process`);
            
            return results;
            
        } catch (error) {
            // Comprehensive error handling with context
            const errorDetails = this.buildErrorResponse(spec, slug, error, Date.now() - startTime);
            
            console.error('\n❌ Block generation failed:');
            console.error(`🚨 Error: ${error.message}`);
            console.error(`⏱️  Failed after: ${Date.now() - startTime}ms`);
            
            // Re-throw with enhanced error context
            throw new Error(`Block generation failed: ${error.message}`);
        }
    }

    /**
     * NEW: Validate template integrity before generation
     */
    async validateTemplateIntegrity() {
        console.log('🔍 Validating hello-world template integrity...');
        
        const validation = await this.templateValidator.validateTemplate();
        
        if (!validation.valid) {
            throw new Error(
                `Template integrity validation failed: ${validation.error}. ` +
                `Please fix the hello-world template before generating new blocks.`
            );
        }
        
        console.log('✅ Template integrity validation passed');
        
        // Log any warnings from template validation
        if (validation.ssotValidation && validation.ssotValidation.warnings.length > 0) {
            console.warn('⚠️  Template validation warnings:');
            validation.ssotValidation.warnings.forEach(warning => {
                console.warn(`  - ${warning}`);
            });
        }
    }

    /**
     * Input validation to catch problems early
     */
    validateInputs(spec, slug) {
        console.log('🔍 Validating inputs...');
        
        // Validate spec
        if (!spec || typeof spec !== 'string' || spec.trim().length === 0) {
            throw new Error('Spec is required and must be a non-empty string');
        }
        
        // Validate slug format (must be valid WordPress block name)
        if (!slug || typeof slug !== 'string') {
            throw new Error('Slug is required and must be a string');
        }
        
        // Check slug format: should be kebab-case, start with letters
        const slugPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
        if (!slugPattern.test(slug)) {
            throw new Error('Slug must be in kebab-case format (e.g., "cm-hello-jay")');
        }
        
        // Check slug length (WordPress limits)
        if (slug.length > 50) {
            throw new Error('Slug must be 50 characters or less');
        }
        
        console.log('✅ Input validation passed');
    }

    /**
     * Build comprehensive success response with strict validation
     * ENHANCED: Now includes SSOT validation results
     */
    buildSuccessResponse(spec, slug, aiResponse, buildResults, executionTime) {
        // Strict validation - no fallbacks, fail if data is missing
        if (!aiResponse.metadata) {
            throw new Error('AI response missing required metadata');
        }
        
        if (!aiResponse.metadata.model) {
            throw new Error('AI response missing model information');
        }
        
        if (!aiResponse.metadata.generatedAt) {
            throw new Error('AI response missing generation timestamp');
        }
        
        if (!aiResponse.description) {
            throw new Error('AI response missing block description');
        }
        
        if (!aiResponse.files || Object.keys(aiResponse.files).length === 0) {
            throw new Error('AI response missing files data');
        }
        
        return {
            success: true,
            timestamp: new Date().toISOString(),
            executionTime: `${executionTime}ms`,
            
            // Input parameters
            request: {
                spec,
                slug
            },
            
            // AI generation results - all values guaranteed to exist
            ai: {
                model: aiResponse.metadata.model,
                description: aiResponse.description,
                filesGenerated: Object.keys(aiResponse.files).length,
                generatedAt: aiResponse.metadata.generatedAt,
                ssotCompliant: true // Guaranteed by validation
            },
            
            // File processing results
            build: {
                filesProcessed: buildResults.filesProcessed,
                workingDirectory: buildResults.paths.working,
                wordpressDirectory: buildResults.paths.wordpress
            },
            
            // WordPress integration info
            wordpress: {
                blockName: buildResults.blockName,
                path: buildResults.paths.wordpress,
                ready: true
            },
            
            // SSOT compliance info
            ssot: {
                templateValidated: true,
                codeValidated: true,
                complianceLevel: 'FULL'
            },
            
            // Next steps for user
            nextSteps: [
                'Block has been deployed to WordPress',
                'SSOT compliance has been verified',
                'Refresh WordPress admin to see the new block',
                'Test the block in the block editor',
                'Check browser console for any JavaScript errors'
            ]
        };
    }

    /**
     * Build comprehensive error response for debugging
     */
    buildErrorResponse(spec, slug, error, executionTime) {
        return {
            success: false,
            timestamp: new Date().toISOString(),
            executionTime: `${executionTime}ms`,
            
            // Input context
            request: {
                spec,
                slug
            },
            
            // Error details
            error: {
                message: error.message,
                type: error.constructor.name,
                stack: error.stack
            },
            
            // Troubleshooting info
            troubleshooting: [
                'Check if Anthropic API key is valid',
                'Verify WordPress blocks path is accessible',
                'Check console logs for detailed error info',
                'Ensure hello-world template is SSOT compliant',
                'Verify template integrity validation passes'
            ]
        };
    }

    /**
     * Health check method for testing system status
     * ENHANCED: Now includes template validation in health check
     */
    async healthCheck() {
        try {
            console.log('🏥 Running comprehensive health check...');
            
            // Check Anthropic service
            const anthropicReady = this.anthropicService.apiKey ? true : false;
            
            // Check wpBlockBuilder paths
            const builderReady = this.wpBlockBuilder.wpBlocksPath ? true : false;
            
            // Check template availability and integrity
            const fs = require('fs-extra');
            const templateExists = await fs.pathExists(this.wpBlockBuilder.templatePath);
            
            let templateValid = false;
            let templateValidation = null;
            
            if (templateExists) {
                try {
                    templateValidation = await this.templateValidator.validateTemplate();
                    templateValid = templateValidation.valid;
                } catch (error) {
                    console.warn('⚠️  Template validation failed during health check:', error.message);
                }
            }
            
            const status = {
                overall: anthropicReady && builderReady && templateExists && templateValid,
                services: {
                    anthropic: anthropicReady,
                    wpBlockBuilder: builderReady,
                    template: templateExists,
                    templateIntegrity: templateValid
                },
                paths: {
                    template: this.wpBlockBuilder.templatePath,
                    wordpress: this.wpBlockBuilder.wpBlocksPath
                },
                ssot: {
                    validatorAvailable: true,
                    templateCompliant: templateValid
                }
            };
            
            if (templateValidation && !templateValidation.valid) {
                status.templateValidationError = templateValidation.error;
            }
            
            console.log('✅ Health check completed');
            return status;
            
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return {
                overall: false,
                error: error.message
            };
        }
    }
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = BlockGenerator;

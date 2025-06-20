/**
 * Anthropic AI Service
 * 
 * This service handles all communication with Anthropic's Claude API.
 * It reads the SSOT rule files and sends them as context to the AI
 * along with the user's block specification.
 */

// ============================================================================
// DEPENDENCIES
// ============================================================================

const axios = require('axios');           // HTTP client for API calls
const fs = require('fs-extra');           // Enhanced file system operations
const path = require('path');             // File path utilities
const SSOTValidator = require('./ssotValidator'); // SSOT compliance validator

// ============================================================================
// ANTHROPIC API CONFIGURATION
// ============================================================================

class AnthropicService {
    constructor() {
        // Store API configuration
        this.apiKey = process.env.ANTHROPIC_API_KEY;
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
        this.rulesPath = process.env.RULES_PATH || './prompts';
        this.ssotValidator = new SSOTValidator();
        
        // Validate API key exists
        if (!this.apiKey) {
            throw new Error('ANTHROPIC_API_KEY not found in environment variables');
        }
    }

    /**
     * Load SSOT rule files to use as AI context
     * These files contain all the instructions for how to build blocks
     */
    async loadRules() {
        try {
            // Load all three rule files
            const creationRulesPath = path.join(this.rulesPath, '1-ssot-block-creation-rules.md');
            const codingRulesPath = path.join(this.rulesPath, '2-ssot-coding-rules.md');
            const responseRulesPath = path.join(this.rulesPath, '3-response-format-rules.md');
            
            console.log('📋 Loading SSOT rules from:', this.rulesPath);
            
            // Read all three files
            const creationRules = await fs.readFile(creationRulesPath, 'utf8');
            const codingRules = await fs.readFile(codingRulesPath, 'utf8');
            const responseRules = await fs.readFile(responseRulesPath, 'utf8');
            
            console.log('✅ All SSOT rules loaded successfully');
            
            return {
                creationRules,
                codingRules,
                responseRules
            };
        } catch (error) {
            console.error('❌ Error loading SSOT rules:', error);
            throw new Error(`Failed to load SSOT rules: ${error.message}`);
        }
    }

    /**
     * Generate block code using Anthropic Claude
     * @param {string} spec - User's specification for the block
     * @param {string} slug - Block slug (e.g., 'cm-hello-jay')
     * @returns {Object} Generated block code and metadata
     */
    async generateBlock(spec, slug) {
        try {
            console.log('🤖 Starting Claude API call...');
            
            // Load the SSOT rules that will guide the AI
            const rules = await this.loadRules();
            
            // Build the prompt that combines rules + user specification
            const prompt = this.buildPrompt(rules, spec, slug);
            
            console.log(`📝 Prompt length: ${prompt.length} characters`);
            
            // Make API call to Claude
            const response = await this.callClaude(prompt);
            
            console.log('✅ Claude API call successful');
            
            // Parse and return the generated code
            return this.parseResponse(response, slug);
            
        } catch (error) {
            console.error('❌ Error generating block:', error);
            throw new Error(`Block generation failed: ${error.message}`);
        }
    }

    /**
     * Build the complete prompt for Claude
     * Combines SSOT rules with user specifications
     */
    buildPrompt(rules, spec, slug) {
        return `${rules.creationRules}

${rules.codingRules}

${rules.responseRules}

CRITICAL INSTRUCTION: Before generating any code, you MUST:
1. Identify all default values in your response
2. Ensure each default appears in exactly ONE location (config.php get_defaults())
3. Verify no hardcoded fallbacks exist in JavaScript files
4. Confirm block.json contains NO default properties in attributes
5. Double-check that all asset handles come from config.php get_asset_handles()

USER REQUEST:
- Block Specification: ${spec}
- Block Slug: ${slug}

REMINDER: Your response will be automatically validated for SSOT compliance. Any violations will cause the generation to fail.`;
    }

    /**
     * Make the actual API call to Claude
     */
    async callClaude(prompt) {
        const requestData = {
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 8000,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            }
        };

        const response = await axios.post(this.apiUrl, requestData, config);
        return response.data;
    }

    /**
     * Parse Claude's response and extract the generated code
     * Uses robust brace counting to extract complete JSON objects
     * ENHANCED: Now includes SSOT compliance validation
     */
    parseResponse(response, slug) {
        try {
            // Extract the text content from Claude's response
            const content = response.content[0].text;
            
            console.log('🔍 Raw Claude response:');
            console.log(content);
            console.log('--- End raw response ---');
            
            // Look for JSON within the response using proper brace counting
            const firstBrace = content.indexOf('{');
            if (firstBrace === -1) {
                // Check if Claude is asking to proceed
                if (content.toLowerCase().includes('would you like me to proceed') || 
                    content.toLowerCase().includes('shall i generate') ||
                    content.toLowerCase().includes('should i create')) {
                    
                    return {
                        success: false,
                        error: 'Claude provided explanation but asked for permission to proceed',
                        explanation: content,
                        suggestion: 'Try a more direct request like: "Create a simple block that says Hello Test"'
                    };
                }
                
                throw new Error('No JSON structure found in Claude response');
            }
            
            // Count braces to find the complete JSON object
            let braceCount = 0;
            let jsonEnd = firstBrace;
            
            for (let i = firstBrace; i < content.length; i++) {
                if (content[i] === '{') {
                    braceCount++;
                } else if (content[i] === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        jsonEnd = i;
                        break;
                    }
                }
            }
            
            if (braceCount !== 0) {
                throw new Error('Incomplete JSON structure in Claude response');
            }
            
            const jsonString = content.substring(firstBrace, jsonEnd + 1);
            console.log('📋 Extracted JSON:');
            console.log(jsonString.substring(0, 500) + '...[truncated for display]');
            
            // Try to parse the extracted JSON
            const parsed = JSON.parse(jsonString);
            
            // Validate required fields
            if (!parsed.blockName || !parsed.description || !parsed.files) {
                throw new Error('JSON missing required fields: blockName, description, or files');
            }

            // NEW: SSOT compliance validation
            console.log('🔍 Running SSOT compliance validation...');
            const ssotValidation = this.ssotValidator.validateCompliance(parsed.files);
            
            if (!ssotValidation.valid) {
                console.error('❌ SSOT validation failed:');
                ssotValidation.violations.forEach(violation => {
                    console.error(`  - ${violation}`);
                });
                
                throw new Error(
                    `SSOT compliance violation detected. Violations: ${ssotValidation.violations.join('; ')}`
                );
            }

            console.log('✅ SSOT validation passed - code follows Single Source of Truth principles');
            
            return {
                success: true,
                blockName: slug,
                description: parsed.description,
                files: parsed.files,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    model: 'claude-3-5-sonnet',
                    explanation: content.substring(0, firstBrace).trim(), // Capture explanation before JSON
                    ssotValidation: ssotValidation // Include validation results
                }
            };
        } catch (error) {
            console.error('❌ Error parsing Claude response:', error);
            
            // Return raw content for debugging
            return {
                success: false,
                error: 'Failed to parse Claude response or SSOT validation failed',
                details: error.message,
                rawResponse: response.content[0].text
            };
        }
    }
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = AnthropicService;
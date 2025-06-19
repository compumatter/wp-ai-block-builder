/**
 * WordPress Block Builder Utility
 * 
 * This utility handles all file system operations for block generation:
 * 1. Copies hello-world template to new block directory
 * 2. Processes AI JSON response into actual files
 * 3. Updates nomenclature throughout all files
 * 4. Copies completed block to WordPress directory
 */

// ============================================================================
// DEPENDENCIES
// ============================================================================

const fs = require('fs-extra');           // Enhanced file operations
const path = require('path');             // File path utilities

// ============================================================================
// WORDPRESS BLOCK BUILDER CLASS
// ============================================================================

class WpBlockBuilder {
    constructor() {
        // Get paths from environment variables
        this.templatePath = process.env.TEMPLATE_PATH || './templates/hello-world';
        this.wpBlocksPath = process.env.WP_BLOCKS_PATH;
        this.outputDir = './generated-blocks';
        
        // Validate required paths
        if (!this.wpBlocksPath) {
            throw new Error('WP_BLOCKS_PATH not found in environment variables');
        }
    }

    /**
     * Main method: Process AI response into complete WordPress block
     * @param {Object} aiResponse - JSON response from AI containing block code
     * @returns {Object} Processing results and paths
     */
    async processBlock(aiResponse) {
        try {
            console.log('🔨 Starting block file processing...');
            
            const blockName = aiResponse.blockName;
            const blockPath = path.join(this.outputDir, blockName);
            
            // Step 1: Create working directory and copy template
            await this.prepareWorkingDirectory(blockName, blockPath);
            
            // Step 2: Apply AI-generated file modifications
            await this.applyFileModifications(aiResponse.files, blockPath);
            
            // Step 3: Update all nomenclature throughout files
            await this.updateNomenclature(blockPath, 'hello-world', blockName);
            
            // Step 4: Copy to WordPress directory
            const wpPath = await this.deployToWordPress(blockPath, blockName);
            
            console.log('✅ Block processing completed successfully');
            
            return {
                success: true,
                blockName,
                paths: {
                    working: blockPath,
                    wordpress: wpPath
                },
                filesProcessed: Object.keys(aiResponse.files).length
            };
            
        } catch (error) {
            console.error('❌ Error processing block:', error);
            throw new Error(`Block processing failed: ${error.message}`);
        }
    }

    /**
     * Step 1: Prepare working directory by copying hello-world template
     */
    async prepareWorkingDirectory(blockName, blockPath) {
        console.log(`📁 Preparing working directory: ${blockPath}`);
        
        // Ensure output directory exists
        await fs.ensureDir(this.outputDir);
        
        // Remove existing block directory if it exists
        if (await fs.pathExists(blockPath)) {
            await fs.remove(blockPath);
            console.log(`🗑️  Removed existing directory: ${blockName}`);
        }
        
	// Copy hello-world template to new block directory (dereference symlinks)
	await fs.copy(this.templatePath, blockPath, {
	    dereference: true    // Follow symlinks and copy actual files
	});
        console.log(`📋 Copied template from: ${this.templatePath}`);
        
	// Fix directory permissions to allow file modifications
	await fs.chmod(blockPath, 0o755);  // rwxr-xr-x - owner can read/write/execute
	console.log(`🔧 Fixed directory permissions`);

	// Remove any SSOT rule files from the copied template
        const filesToRemove = [
            '1-ssot-block-creation-rules.md',
            '2-ssot-coding-rules.md', 
            '3-response-format-rules.md'
        ];
        
        for (const file of filesToRemove) {
            const filePath = path.join(blockPath, file);
            if (await fs.pathExists(filePath)) {
                await fs.remove(filePath);
                console.log(`🗑️  Removed rule file: ${file}`);
            }
        }
    }

    /**
     * Step 2: Apply file modifications from AI response
     */
    async applyFileModifications(files, blockPath) {
        console.log(`📝 Applying ${Object.keys(files).length} file modifications...`);
        
        for (const [filename, fileData] of Object.entries(files)) {
            const filePath = path.join(blockPath, filename);
            
            try {
		if (fileData.action === 'modify') {
                    // Convert objects to JSON strings for .json files
                    const content = filename.endsWith('.json') && typeof fileData.content === 'object' 
                        ? JSON.stringify(fileData.content, null, 2)
                        : fileData.content;
                    
                    // Modify existing file - overwrite with new content
                    await fs.writeFile(filePath, content, 'utf8');
                    console.log(`✏️  Modified: ${filename}`);
                    
                } else if (fileData.action === 'create') {
                    // Convert objects to JSON strings for .json files
                    const content = filename.endsWith('.json') && typeof fileData.content === 'object' 
                        ? JSON.stringify(fileData.content, null, 2)
                        : fileData.content;
                    
                    // Create new file - ensure directory exists first
                    await fs.ensureDir(path.dirname(filePath));
                    await fs.writeFile(filePath, content, 'utf8');
                    console.log(`➕ Created: ${filename}`);
		} else {
                    console.warn(`⚠️  Unknown action '${fileData.action}' for file: ${filename}`);
                }
                
            } catch (error) {
                console.error(`❌ Error processing ${filename}:`, error);
                throw new Error(`Failed to process file ${filename}: ${error.message}`);
            }
        }
    }

    /**
     * Step 3: Update nomenclature throughout all files
     * Changes hello-world references to new block name in all variations
     */
    async updateNomenclature(blockPath, oldSlug, newSlug) {
        console.log(`🔄 Updating nomenclature: ${oldSlug} → ${newSlug}`);
        
        // Generate all nomenclature variations
        const nomenclature = this.generateNomenclatureVariations(oldSlug, newSlug);
        
        // Get all files in the block directory
        const files = await this.getAllFiles(blockPath);
        
        // Process each file
        for (const filePath of files) {
            try {
                // Read file content
                let content = await fs.readFile(filePath, 'utf8');
                let modified = false;
                
                // Apply all nomenclature replacements
                for (const [oldForm, newForm] of Object.entries(nomenclature)) {
                    if (content.includes(oldForm)) {
                        content = content.replace(new RegExp(oldForm, 'g'), newForm);
                        modified = true;
                    }
                }
                
                // Write back if modified
                if (modified) {
                    await fs.writeFile(filePath, content, 'utf8');
                    console.log(`🔄 Updated nomenclature in: ${path.relative(blockPath, filePath)}`);
                }
                
            } catch (error) {
                console.error(`❌ Error updating nomenclature in ${filePath}:`, error);
                // Continue processing other files rather than failing completely
            }
        }
    }

    /**
     * Step 4: Deploy completed block to WordPress directory
     */
    async deployToWordPress(blockPath, blockName) {
        const wpPath = path.join(this.wpBlocksPath, blockName);
        
        console.log(`🚀 Deploying to WordPress: ${wpPath}`);
        
        // Remove existing WordPress block if it exists
        if (await fs.pathExists(wpPath)) {
            await fs.remove(wpPath);
            console.log(`🗑️  Removed existing WordPress block: ${blockName}`);
        }
        
        // Copy completed block to WordPress
	await fs.copy(blockPath, wpPath, {
	    dereference: true,    // Follow symlinks and copy actual files
	    overwrite: true       // Overwrite existing files/symlinks
	});	    
        console.log(`✅ Block deployed to WordPress successfully`);
        
        return wpPath;
    }

    /**
     * Helper: Generate all nomenclature variations for search/replace
     */
    generateNomenclatureVariations(oldSlug, newSlug) {
        // Convert slugs to different cases
        const oldVariations = {
            'kebab': oldSlug,                                    // hello-world
            'snake': oldSlug.replace(/-/g, '_'),                // hello_world  
            'camel': this.toCamelCase(oldSlug),                 // helloWorld
            'pascal': this.toPascalCase(oldSlug),               // HelloWorld
            'upper': oldSlug.replace(/-/g, '_').toUpperCase(),  // HELLO_WORLD
            'title': this.toTitleCase(oldSlug)                  // Hello World
        };
        
        const newVariations = {
            'kebab': newSlug,                                    
            'snake': newSlug.replace(/-/g, '_'),                
            'camel': this.toCamelCase(newSlug),                 
            'pascal': this.toPascalCase(newSlug),               
            'upper': newSlug.replace(/-/g, '_').toUpperCase(),  
            'title': this.toTitleCase(newSlug)                  
        };
        
        // Build replacement map
        const replacements = {};
        for (const [key, oldValue] of Object.entries(oldVariations)) {
            replacements[oldValue] = newVariations[key];
        }
        
        return replacements;
    }

    /**
     * Helper: Get all files recursively in a directory
     */
    async getAllFiles(dirPath) {
        const files = [];
        
        async function traverse(currentPath) {
            const entries = await fs.readdir(currentPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);
                
                if (entry.isDirectory()) {
                    await traverse(fullPath);
                } else if (entry.isFile()) {
                    files.push(fullPath);
                }
            }
        }
        
        await traverse(dirPath);
        return files;
    }

    /**
     * Helper: Convert kebab-case to camelCase
     */
    toCamelCase(str) {
        return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    }

    /**
     * Helper: Convert kebab-case to PascalCase
     */
    toPascalCase(str) {
        return str.replace(/(^|-)([a-z])/g, (match, dash, letter) => letter.toUpperCase());
    }

    /**
     * Helper: Convert kebab-case to Title Case
     */
    toTitleCase(str) {
        return str.replace(/(^|-)([a-z])/g, (match, dash, letter) => 
            (dash ? ' ' : '') + letter.toUpperCase()
        );
    }
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = WpBlockBuilder;

/**
 * WordPress AI Block Builder - HTTP API Server
 * 
 * This file creates a web server that serves as the entry point for block requests.
 * It handles the web interface but does NOT do the actual block creation work.
 * 
 * SPECIFIC RESPONSIBILITIES:
 * 1. Listen for HTTP requests on port 4220
 * 2. Validate incoming request data (spec and slug)
 * 3. Route valid requests to the BlockGenerator
 * 4. Format and send responses back to the user
 * 5. Provide API documentation and health checks
 * 6. Handle web errors and return proper HTTP status codes
 * 
 * WHAT THIS FILE DOES NOT DO:
 * - Does not call AI services directly
 * - Does not create or modify files
 * - Does not copy files to WordPress
 * - Does not understand block structure
 */


// ============================================================================
// ENVIRONMENT AND DEPENDENCIES
// ============================================================================

// Load environment variables from .env file (contains API keys, paths, etc.)
require('dotenv').config();

// Import required Node.js packages
const express = require('express');     // Web server framework
const cors = require('cors');           // Cross-Origin Resource Sharing (allows frontend to call API)
const path = require('path');           // File system path utilities

// Import our custom services
const BlockGenerator = require('./utils/blockGenerator');

// ============================================================================
// SERVER SETUP
// ============================================================================

// Create Express application instance
const app = express();

// Set server port - use environment variable or default to 4220
const PORT = process.env.PORT || 4220;

// Initialize the block generator (this handles the entire workflow)
let blockGenerator;
try {
    blockGenerator = new BlockGenerator();
    console.log('✅ BlockGenerator initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize BlockGenerator:', error.message);
    console.error('🚨 Server cannot start without proper configuration');
    process.exit(1); // Exit if we can't initialize core services
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Middleware are functions that run BEFORE your route handlers
// They process incoming requests and modify them if needed

// Enable CORS - allows requests from different domains (like a frontend app)
app.use(cors());

// Parse JSON request bodies - converts incoming JSON to JavaScript objects
// Without this, req.body would be undefined when receiving JSON data
app.use(express.json());

// Parse URL-encoded request bodies - handles form data submissions
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (helps with debugging)
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📝 ${timestamp} - ${req.method} ${req.path}`);
    next(); // Continue to next middleware/route handler
});

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

// Routes define what happens when someone visits specific URLs

/**
 * GET / - Root endpoint (homepage)
 * When someone visits http://localhost:4220/ they get API information
 * This is useful for testing if the server is running
 */
app.get('/', (req, res) => {
    // req = incoming request data
    // res = response object to send data back
    
    res.json({ 
        message: 'WordPress AI Block Builder API', 
        version: '1.0.0',
        status: 'active',
        endpoints: {
            'POST /orchestrate-block': 'Create a new WordPress block using AI',
            'GET /health': 'Check system health and configuration'
        },
        configuration: {
            template: process.env.TEMPLATE_PATH,
            wordpress: process.env.WP_BLOCKS_PATH ? 'configured' : 'missing',
            anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing'
        }
    });
});

/**
 * GET /health - Health check endpoint
 * Verifies all services and configurations are working properly
 */
app.get('/health', async (req, res) => {
    try {
        console.log('🏥 Health check requested');
        
        // Run comprehensive health check
        const healthStatus = await blockGenerator.healthCheck();
        
        // Return appropriate HTTP status code
        const statusCode = healthStatus.overall ? 200 : 503;
        
        res.status(statusCode).json({
            timestamp: new Date().toISOString(),
            healthy: healthStatus.overall,
            ...healthStatus
        });
        
    } catch (error) {
        console.error('❌ Health check error:', error);
        res.status(503).json({
            timestamp: new Date().toISOString(),
            healthy: false,
            error: error.message
        });
    }
});

/**
 * POST /orchestrate-block - Main block generation endpoint
 * This is where the magic happens - receives block specifications and creates blocks
 * 
 * Expected request body:
 * {
 *   "spec": "Description of what the block should do",
 *   "slug": "block-name-in-kebab-case"
 * }
 */
app.post('/orchestrate-block', async (req, res) => {
    const startTime = Date.now();
    
    try {
        // Extract data from request body
        // Destructuring assignment: pulls 'spec' and 'slug' properties from req.body
        const { spec, slug } = req.body;
        
        console.log('\n🚀 NEW BLOCK GENERATION REQUEST');
        console.log(`📋 Spec: ${spec}`);
        console.log(`🏷️  Slug: ${slug}`);
        
        // Basic validation: make sure required fields are provided
        if (!spec || !slug) {
            console.log('❌ Validation failed: Missing required fields');
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields: spec and slug',
                received: { spec: !!spec, slug: !!slug }
            });
        }
        
        // Call the BlockGenerator to handle the entire workflow
        // This will:
        // 1. Call Anthropic AI to generate code
        // 2. Process files and update nomenclature  
        // 3. Deploy to WordPress directory
        const results = await blockGenerator.generateBlock(spec, slug);
        
        // Calculate total processing time
        const totalTime = Date.now() - startTime;
        console.log(`✅ Request completed in ${totalTime}ms`);
        
        // Return success response with all details
        res.json({
            ...results,
            totalProcessingTime: `${totalTime}ms`
        });
        
    } catch (error) {
        // If anything goes wrong, log the error and return HTTP 500 (Internal Server Error)
        const totalTime = Date.now() - startTime;
        
        console.error('\n❌ REQUEST FAILED');
        console.error(`🚨 Error: ${error.message}`);
        console.error(`⏱️  Failed after: ${totalTime}ms`);
        
        // Return detailed error response for debugging
        res.status(500).json({ 
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
            processingTime: `${totalTime}ms`,
            request: {
                spec: req.body.spec,
                slug: req.body.slug
            }
        });
    }
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

/**
 * Global error handler - catches any unhandled errors
 * This runs if any route throws an error that wasn't caught
 */
app.use((error, req, res, next) => {
    console.error('🚨 Unhandled server error:', error);
    
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        message: 'An unexpected error occurred'
    });
});

/**
 * 404 handler - runs when no route matches the request
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /',
            'GET /health', 
            'POST /orchestrate-block'
        ]
    });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Start the server and listen for incoming connections
 * The callback function runs once the server successfully starts
 */
app.listen(PORT, () => {
    // These console.log statements help us verify the server started correctly
    console.log('\n🎉 WordPress AI Block Builder Started Successfully!');
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`📁 Template path: ${process.env.TEMPLATE_PATH}`);
    console.log(`📋 Rules path: ${process.env.RULES_PATH}`);
    console.log(`🌐 WordPress path: ${process.env.WP_BLOCKS_PATH}`);
    console.log(`📊 Environment variables loaded from .env file`);
    console.log(`🎯 Ready to generate WordPress blocks with AI!`);
    console.log('\n📡 Available endpoints:');
    console.log(`   GET  / - API information`);
    console.log(`   GET  /health - System health check`);
    console.log(`   POST /orchestrate-block - Generate new block`);
    console.log('\n🧪 Test with: curl -X POST http://localhost:4220/orchestrate-block -H "Content-Type: application/json" -d \'{"spec": "Test block", "slug": "test-block"}\'');	
});

/**
 * Graceful shutdown handling
 * Ensures server shuts down cleanly when terminated
 */
process.on('SIGTERM', () => {
    console.log('\n👋 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 Received SIGINT (Ctrl+C), shutting down gracefully...');
    process.exit(0);
});

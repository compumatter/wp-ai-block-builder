# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Start the orchestrator server:
```bash
node index.js
```

The server runs on port 4220.

## Architecture Overview

This is a WordPress FSE (Full Site Editing) block orchestrator that uses AI to generate complete custom blocks. The system follows a "Single Source of Truth" (SSOT) architecture.

### Core Components

- **Express API Server** (`index.js`): Main entry point with REST endpoints for block generation
- **AI Layer** (`ai/`): Handles Claude/OpenAI integration and prompt engineering
- **Block Generation Pipeline**: Orchestrates creation of complete WordPress blocks with 7 required files
- **Injection System** (`injection/`): Handles WordPress integration and deployment

### Key Endpoints

- `POST /generate-block`: Complete block generation from specification
- `POST /orchestrate-block`: Full pipeline including generation, writing, and WordPress deployment
- `POST /generate-section`: Generate individual block sections
- `POST /inject-block`: Inject generated blocks into WordPress

### Block Architecture

Each generated block consists of exactly 7 files:
1. `block.json` - WordPress block metadata
2. `render.php` - Server-side rendering callback
3. `editor.js` - Block editor interface
4. `centralized.js` - Frontend JavaScript
5. `centralized.css` - Block styling
6. `config.php` - PHP configuration array
7. `registering.php` - WordPress block registration

### AI Integration

- Uses Claude Opus 4 model via Anthropic SDK
- Structured prompt engineering in `ai/blockPrompt.js` and `ai/sectionPrompt.js`
- Response parsing in `ai/blockParser.js` extracts sections using regex markers
- Master orchestrator in `ai/masterGenerator.js` handles multi-section generation

### Environment Setup

Requires `.env` file with:
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY` (optional)

Environment loading handled by `config/envLoader.js`.

### File Output

Generated blocks are written to `output/[block-slug]/` directory with the complete file structure ready for WordPress integration.
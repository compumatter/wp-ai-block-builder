import './config/envLoader.js';  // Load environment variables first
import { writeBlockToFilesystem } from './ai/blockWriter.js';

import { generateFullBlock } from './ai/masterGenerator.js';

import express from 'express';
import bodyParser from 'body-parser';
// import { callClaude, callOpenAI } from './ai/aiCaller.js';
import { callClaude} from './ai/aiCaller.js';

import { buildBlockPrompt } from './ai/blockPrompt.js';
import { parseAIResponse } from './ai/blockParser.js';
import { injectBlock } from './injection/injector.js';
import { buildSectionPrompt } from './ai/sectionPrompt.js';
import { writeFullBlockToFilesystem } from './ai/autoWriter.js';
import { injectBlockToWP } from './ai/injectorBridge.js';


const app = express();
app.use(bodyParser.json());

app.post('/test', (req, res) => {
  const { message } = req.body;
  res.json({ reply: `Received: ${message}` });
});

app.post('/claude', async (req, res) => {
  const { prompt } = req.body;
  try {
    const aiResponse = await callClaude(prompt);
    res.json({ response: aiResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Claude API failed" });
  }
});

app.post('/openai', async (req, res) => {
  const { prompt } = req.body;
  try {
    const aiResponse = await callOpenAI(prompt);
    res.json({ response: aiResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI API failed" });
  }
});

app.post('/generate-block', async (req, res) => {
  const { spec } = req.body;
  const prompt = buildBlockPrompt(spec);

  try {
    const aiResponse = await callClaude(prompt);

    // Print full AI response to console for debug visibility
    console.log("=== RAW CLAUDE OUTPUT ===");
    console.log(JSON.stringify(aiResponse, null, 2));
    console.log("=== END OF RAW OUTPUT ===");

    const parsed = parseAIResponse(aiResponse);
    writeBlockToFilesystem(parsed);

    res.json({ status: "success", message: "Block generated and written to disk." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Block generation failed" });
  }
});
app.post('/raw-generate-block', async (req, res) => {
  const { spec } = req.body;
  const prompt = buildBlockPrompt(spec);

  try {
    const aiResponse = await callClaude(prompt);
    res.json({ 
      prompt,       // <-- also return full prompt for debug purposes
      rawResponse: aiResponse 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Raw generation failed" });
  }
});
app.post('/inject-block', async (req, res) => {
  const { slug } = req.body;

  try {
    injectBlock(slug);
    res.json({ status: "success", message: `Block '${slug}' injected successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Injection failed" });
  }
});

app.post('/generate-section', async (req, res) => {
  const { section, spec } = req.body;

  if (!section || !spec) {
    return res.status(400).json({ error: "Missing section or spec." });
  }

  const validSections = [
    "BLOCK_JSON",
    "PHP_RENDER_CALLBACK",
    "EDITOR_JS",
    "CENTRALIZED_JS",
    "CENTRALIZED_CSS",
    "CONFIG_PHP",
    "REGISTERING_PHP"
  ];

  if (!validSections.includes(section)) {
    return res.status(400).json({ error: "Invalid section name." });
  }

  const prompt = buildSectionPrompt(section, spec);

  try {
    const aiResponse = await callClaude(prompt);
    res.json({
      section: section,
      content: aiResponse
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Section generation failed." });
  }
});

app.post('/orchestrate-block', async (req, res) => {
  const { spec, slug } = req.body;

  if (!spec || !slug) {
    return res.status(400).json({ error: "Missing block spec or slug." });
  }

  try {
    const fullBlock = await generateFullBlock(spec, slug);
    writeFullBlockToFilesystem(slug, fullBlock);
    injectBlockToWP(slug);
    res.json({ status: "success", message: "Block generated, written, and deployed to WordPress." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Orchestration+Deployment failed." });
  }
});

app.listen(4220, () => {
  console.log('Orchestrator running on port 4220');
});




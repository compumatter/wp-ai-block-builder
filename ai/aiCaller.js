import '../config/envLoader.js';
import { config } from 'dotenv';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function callClaude(prompt) {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-20250514",
    max_tokens: 4096,
    temperature: 0,
    messages: [{ role: "user", content: prompt }]
  });

  // Full usage instrumentation:
  console.log("========== CLAUDE USAGE METRICS ==========");
  console.log("Model Used: ", response.model);
  console.log("Request ID: ", response.id);
  console.log("Usage: ", response.usage);
  console.log("========== END CLAUDE METRICS ============");

  return response.content[0].text;
}



AI Response Format Rules

=== OUTPUT FORMAT REQUIREMENT ===
You MUST format your response as valid JSON with this exact structure:

```json
{
    "blockName": "BLOCK_SLUG_HERE",
    "description": "Brief description of what this block does and its main functionality",
    "files": {
        "filename.ext": {
            "action": "modify|create",
            "content": "COMPLETE file content here - must be production ready"
        }
    }
}
```

=== RESPONSE TECHNICAL RULES ===
- Always return valid JSON - no markdown code blocks around the JSON
- Use "modify" action for files that exist in hello-world template
- Use "create" action for any new files needed
- Each file's "content" must be complete and production-ready
- Include ALL files that need changes from the hello-world template

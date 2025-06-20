#!/bin/bash

# Clean up previous directories (same as before)
dir1="/home/usermatter/node-ai/wp-ai-lessons/generated-blocks"
if [ -d "$dir1" ] && [ "$(ls -A "$dir1")" ]; then
    rm -rf "$dir1"/*
fi

dir2="/SM_DATA/sm_hosting/word4ya_net/public_html/wp-content/themes/word4ya/cm-blocks/a-test"
[ -d "$dir2" ] && rm -rf "$dir2"


sleep 2

url="http://localhost:4220/orchestrate-block"
data='{"spec": "Create a simple block that displays Hello Test in large text", "slug": "a-test"}'
cmd="curl -s -X POST \"$url\" -H \"Content-Type: application/json\" -d '$data'"

# Show the command about to be executed
echo "+ $cmd"

# Run the command and capture the output
response=$(eval "$cmd")

# Show the result
echo "$response"



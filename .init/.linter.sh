#!/bin/bash
cd /home/kavia/workspace/code-generation/autonomous-task-assistant-224061-224070/autogpt_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


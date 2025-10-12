#!/bin/bash

# GreenChain Server Shutdown Script
echo "🛑 Stopping GreenChain Servers..."

# Kill processes by PID if available
if [ -f /tmp/greenchain_backend.pid ]; then
    BACKEND_PID=$(cat /tmp/greenchain_backend.pid)
    kill $BACKEND_PID 2>/dev/null
    rm /tmp/greenchain_backend.pid
    echo "Stopped backend process $BACKEND_PID"
fi

if [ -f /tmp/greenchain_frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/greenchain_frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    rm /tmp/greenchain_frontend.pid
    echo "Stopped frontend process $FRONTEND_PID"
fi

# Cleanup by process name and port
pkill -f "python3.*main.py" 2>/dev/null
pkill -f "npm start" 2>/dev/null
pkill -f "node.*3000" 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "✅ All GreenChain processes stopped"
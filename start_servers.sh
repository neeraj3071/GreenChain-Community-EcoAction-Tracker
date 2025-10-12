#!/bin/bash

# GreenChain Server Startup Script
echo "🌱 Starting GreenChain Servers..."

# Kill any existing processes on our ports
echo "Cleaning up existing processes..."
pkill -f "python3.*main.py" 2>/dev/null
pkill -f "npm start" 2>/dev/null
pkill -f "node.*3000" 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Wait for cleanup
sleep 2

# Start Backend
echo "Starting Backend Server..."
cd /Users/neerajsaini/Desktop/Hack_dearborn_4/greenchain-backend
nohup python3 main.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 5

# Test backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend running on http://localhost:8000"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start Frontend  
echo "Starting Frontend Server..."
cd /Users/neerajsaini/Desktop/Hack_dearborn_4/greenchain-frontend
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to compile and start
echo "Waiting for frontend to compile..."
sleep 15

# Test frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Frontend running on http://localhost:3000"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

echo ""
echo "🎉 All servers are running!"
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Process IDs saved to:"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Save PIDs for later cleanup
echo $BACKEND_PID > /tmp/greenchain_backend.pid
echo $FRONTEND_PID > /tmp/greenchain_frontend.pid

echo "To stop servers later, run: ./stop_servers.sh"
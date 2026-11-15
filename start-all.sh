#!/usr/bin/env bash

# Exit on error
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "=========================================================="
echo " Starting Teen Smartphone Addiction MERN + ML Microservice"
echo "=========================================================="
echo "Project Directory: $DIR"

# 1. Start Python FastAPI ML Microservice on port 8000
echo ""
echo "[1/3] Launching Python FastAPI ML Microservice on port 8000..."
cd "$DIR/ml-service/app"
if [ -d "$DIR/ml-service/venv" ]; then
    "$DIR/ml-service/venv/bin/python" -m uvicorn main:app --host 0.0.0.0 --port 8000 &
elif [ -d "/Users/apple/Desktop/python/myenv" ]; then
    /Users/apple/Desktop/python/myenv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
else
    python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
fi
FASTAPI_PID=$!
echo "FastAPI started (PID: $FASTAPI_PID)"
echo "Waiting 3 seconds for ML models and SHAP explainers to initialize..."
sleep 3

# 2. Start Node/Express Server on port 5000
echo ""
echo "[2/3] Launching Node/Express Server on port 5000..."
cd "$DIR/server"
npm start &
EXPRESS_PID=$!
echo "Express started (PID: $EXPRESS_PID)"

# 3. Start React Frontend on port 5173
echo ""
echo "[3/3] Launching React Vite Frontend on port 5173..."
cd "$DIR/client"
npm run dev &
CLIENT_PID=$!
echo "React Vite started (PID: $CLIENT_PID)"

echo ""
echo "=========================================================="
echo " All services running!"
echo "   - React Frontend:   http://localhost:5173"
echo "   - Node/Express:     http://localhost:5000"
echo "   - FastAPI Service:  http://localhost:8000"
echo "   - FastAPI Docs:     http://localhost:8000/docs"
echo " Press Ctrl+C to terminate all services."
echo "=========================================================="

# Trap SIGINT to kill background processes on exit
trap "kill $FASTAPI_PID $EXPRESS_PID $CLIENT_PID 2>/dev/null; exit" INT TERM
wait

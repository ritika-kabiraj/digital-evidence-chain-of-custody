# PowerShell script to start Blockchain Node, FastAPI Backend, and Vite Frontend

Write-Host "🚀 Launching Digital Evidence Blockchain System..." -ForegroundColor Cyan

# 1. Start Hardhat Node
Write-Host "1. Starting Hardhat Local Blockchain Node..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd blockchain; npm run node"

Start-Sleep -Seconds 4

# 2. Deploy Smart Contract
Write-Host "2. Deploying EvidenceLedger Smart Contract..." -ForegroundColor Yellow
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
cd ..

# 3. Start FastAPI Backend
Write-Host "3. Starting FastAPI Backend API Service (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; $env:PYTHONPATH='.'; .\venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# 4. Start React Frontend
Write-Host "4. Starting React Vite Frontend App (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "✅ All services launched!" -ForegroundColor Green
Write-Host "  - Frontend Portal: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  - FastAPI Swagger Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  - Hardhat Local RPC: http://127.0.0.1:8545" -ForegroundColor Cyan

if (Test-Path "C:\Users\aksha\nodejs\npm.cmd") {
  $env:Path = "C:\Users\aksha\nodejs;C:\Users\aksha\git\cmd;" + $env:Path
}
if (Test-Path "C:\Users\aksha\.gemini\antigravity\bin\npm.cmd") {
  $env:Path = "C:\Users\aksha\.gemini\antigravity\bin;" + $env:Path
}

Write-Host "Starting QueueFlow Development Server on http://localhost:3000..." -ForegroundColor Green
npm run dev

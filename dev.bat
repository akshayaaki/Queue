@echo off
if exist "C:\Users\aksha\nodejs\npm.cmd" (
  set "PATH=C:\Users\aksha\nodejs;C:\Users\aksha\git\cmd;%PATH%"
)
if exist "C:\Users\aksha\.gemini\antigravity\bin\npm.cmd" (
  set "PATH=C:\Users\aksha\.gemini\antigravity\bin;%PATH%"
)

echo Starting QueueFlow Development Server on http://localhost:3000 ...
call npm run dev

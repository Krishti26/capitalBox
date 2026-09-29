@echo off
echo ===================================================
echo Starting The Capital Box Server
echo HTTP:  http://localhost:3000
echo HTTPS: https://localhost:3443
echo ===================================================
cd /d "%~dp0public_html"
start "" /b npx --yes local-ssl-proxy --hostname 0.0.0.0 --source 3443 --target 3000
start https://localhost:3443
npx --yes serve -l 3000


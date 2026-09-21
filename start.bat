@echo off
echo Starting local server at http://localhost:3000 ...
cd /d "%~dp0public_html"
start http://localhost:3000
npx --yes serve -l 3000

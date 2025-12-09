#!/bin/bash
set -e

PROJECT_DIR="/home/thiennguyen/LinuxOPS"
cd "$PROJECT_DIR"

git add .
git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main


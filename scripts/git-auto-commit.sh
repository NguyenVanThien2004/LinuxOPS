#!/bin/bash
set -e

PROJECT_DIR="/home/thiennguyen/LinuxOPS"
cd "$PROJECT_DIR"

# Kiểm tra có thay đổi không
if ! git diff --quiet || ! git diff --cached --quiet; then
    git add .
    git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Đã commit thay đổi mới."
else
    echo "Không có thay đổi mới để commit."
fi

# Kiểm tra nếu có commit chưa push
if [ -n "$(git log origin/main..main)" ]; then
    echo "Đang push các commit còn tồn đọng..."
    git push origin "$(git branch --show-current)"
else
    echo "Không có commit nào để push."
fi


#!/bin/bash
set -e

echo "=== ku-utils 文档站构建 ==="
echo ""

echo "1. 构建文档站..."
pnpm --filter @ku-utils/docs build

DIST_DIR="docs/.vitepress/dist"

if [ ! -d "$DIST_DIR" ]; then
  echo "✗ 构建产物不存在: $DIST_DIR"
  exit 1
fi

FILE_COUNT=$(find "$DIST_DIR" -type f | wc -l | tr -d ' ')
echo "✓ 构建完成，共 ${FILE_COUNT} 个文件"
echo "  产物目录: ${DIST_DIR}"
echo ""
echo "本地预览: pnpm start"
echo "线上部署见 docs/deploy-vitepress.md"

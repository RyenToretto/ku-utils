#!/bin/bash
set -e

echo "=== ku-utils 发布流程 ==="
echo "目标: npmjs.org (@ku-utils/* public)"
echo ""

echo "1. 检查 npm 认证..."
npm whoami 2>/dev/null || {
  echo "未登录 npm，请先执行: npm login"
  echo "并确认对 @ku-utils scope 有 publish 权限"
  exit 1
}

echo ""
echo "2. 执行 changeset version..."
pnpm changeset version

echo ""
echo "3. 构建所有 packages 和 tools..."
pnpm turbo build --filter='./packages/*' --filter='./tools/*'

echo ""
echo "4. 发布到 npm..."
pnpm changeset publish

echo ""
echo "5. 推送 git tags..."
git push --follow-tags

echo ""
echo "=== 发布完成 ==="

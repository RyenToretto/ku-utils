#!/usr/bin/env bash
#
# 检查暂存区中是否包含 _auth 认证信息，防止 Token 意外提交到仓库。
# 由 .husky/pre-commit 调用。
# 排除 .md 文档文件（文档中会引用 _auth 作为说明）。

FORBIDDEN_PATTERN='_auth\s*='

FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -v '\.md$')

if [ -z "$FILES" ]; then
  exit 0
fi

MATCHED=$(echo "$FILES" | xargs grep -l "$FORBIDDEN_PATTERN" 2>/dev/null || true)

if [ -n "$MATCHED" ]; then
  echo ""
  echo "提交被阻止：以下文件包含 _auth 认证信息"
  echo ""
  for f in $MATCHED; do
    echo "   $f"
  done
  echo ""
  echo "认证信息应放在用户级 ~/.npmrc，不要提交到仓库。"
  echo "发布 @ku-utils/* 请使用 npm login，或在 CI 中配置 NPM_TOKEN。"
  echo ""
  exit 1
fi

# Prettier 配置

## 安装

```bash
pnpm add -D @ku-utils/prettier-config prettier
```

## 使用

在 `package.json` 中：

```json
{
  "prettier": "@ku-utils/prettier-config"
}
```

## 默认规则

| 选项                   | 值   |
| ---------------------- | ---- |
| semi                   | true |
| singleQuote            | true |
| trailingComma          | all  |
| printWidth             | 100  |
| tabWidth               | 2    |
| endOfLine              | lf   |
| singleAttributePerLine | true |

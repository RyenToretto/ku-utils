# VitePress 文档站部署

本地预览与静态产物构建。线上托管推荐 [GitHub Pages](https://docs.github.com/pages)。

---

## 本地预览

```bash
# 在仓库根目录
pnpm install
pnpm start
# 默认 http://localhost:5173
```

构建产物：

```bash
pnpm --filter @ku-utils/docs build
# 输出 docs/.vitepress/dist/
```

预览构建结果：

```bash
pnpm --filter @ku-utils/docs preview
# 默认 http://localhost:4173
```

也可执行 `bash scripts/deploy-docs.sh`，仅构建并打印产物路径。

---

## GitHub Pages

1. 仓库 Settings → Pages → Source 选择 **GitHub Actions**
2. 新增 workflow：安装依赖后执行 `pnpm --filter @ku-utils/docs build`，把 `docs/.vitepress/dist` 交给 [`peaceiris/actions-gh-pages`](https://github.com/peaceiris/actions-gh-pages) 或官方 `actions/upload-pages-artifact` + `actions/deploy-pages`
3. 若站点不在仓库根域名下，把 `docs/.vitepress/config.ts` 的 `base` 改成 `'/ku-utils/'`（与仓库名一致）

自定义域名：在 Pages 设置里填写域名，并在 DNS 添加 CNAME 指向 `RyenToretto.github.io`。

---

## 任意静态托管

把 `docs/.vitepress/dist/` 上传到任意支持静态站点的服务即可。Nginx 示例：

```nginx
server {
    listen 80;
    server_name docs.example.com;
    root /var/www/ku-utils-docs;
    index index.html;

    location / {
        try_files $uri $uri/ /404.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

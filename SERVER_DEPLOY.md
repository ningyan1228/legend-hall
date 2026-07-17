# 腾讯云代理部署

前端继续由 GitHub Pages 托管。腾讯云只运行 Fastify 代理，不托管网页，也不保存人物原图。

## Notion 数据源

已创建并写入梅西初始档案：

```text
People       371932d0-53e8-4c3a-970e-e8b0f5d38baa
Career       ef708901-b28f-466f-86db-0ee58dc60a72
Statistics   3902ceac-3531-49fb-b773-71ca9b98b12d
Honors       e7a0bbb8-7efd-4546-b278-12cfc30a4255
Timeline     4a974d8c-2d5f-4ca7-a8da-63f5301e9ee6
```

请在 Notion 中把这 5 个数据库共享给服务器所用的 Notion Integration。People 可直接上传 `Avatar`、`HeroImage`、`CardImage`、`Gallery`；Timeline 和 Honors 使用 `Image`。

## 服务器更新

只需将这些项目文件更新到：

```text
/home/ubuntu/projects/legend-hall-proxy
```

不要上传 `node_modules`、`.pnpm-store`、`dist` 或本地 `.env`。在服务器 `.env` 中保留真实 `NOTION_TOKEN`，填入上面的 Data Source ID，并设置：

```text
USE_MOCK_DATA=false
ALLOWED_ORIGINS=https://ningyan1228.github.io,http://localhost:4321
```

然后执行：

```bash
cd ~/projects/legend-hall-proxy
docker compose config
docker compose up -d --build
docker compose ps
docker compose logs --tail=80
```

## 验证

```bash
docker compose exec legend-hall-proxy wget -qO- http://127.0.0.1:3000/health
curl -i https://legend-hall-api.gjsx.uno/api/v1/people/lionel-messi/detail
curl -I https://legend-hall-api.gjsx.uno/api/v1/media/people/lionel-messi/hero
```

媒体接口正常时返回 `302` 到最新 Notion 文件地址；图片缺失或 Notion 暂时不可用时返回本地 SVG 人物剪影。

## GitHub Pages

Repository Secrets：

```text
PUBLIC_API_BASE_URL=https://legend-hall-api.gjsx.uno/api/v1
PUBLIC_SITE_URL=https://ningyan1228.github.io/legend-hall
```

前端只使用 `/api/v1/media/...` 稳定地址，不会把 Notion 临时签名 URL 写入静态 HTML。

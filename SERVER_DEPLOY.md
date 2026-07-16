# 腾讯云代理部署交接

前端继续由 GitHub Pages 托管。腾讯云只运行 Fastify 代理，不保存人物图片或数据库文件。

## 1. DNS

在 `gjsx.uno` 的 DNS 添加：

```text
主机记录：legend-hall-api
记录类型：A
记录值：43.128.149.75
```

生产 API 地址为 `https://legend-hall-api.gjsx.uno/api/v1`。

## 2. 上传项目

把整个项目上传到服务器：

```text
~/projects/legend-hall-proxy
```

不要上传 `node_modules`、`dist`、`.env` 或 `.pnpm-store`。

## 3. 服务器环境

```bash
cd ~/projects/legend-hall-proxy
cp server-config.example .env
nano .env
docker network inspect web
docker compose config
docker compose up -d --build
```

必须填写 `LETSENCRYPT_EMAIL` 和真实 GitHub Pages 来源 `ALLOWED_ORIGINS`。Notion 尚未配置时保留 `USE_MOCK_DATA=true`；配置 Token 和 Data Source ID 后改为 `false`。

## 4. 检查

```bash
docker compose ps
docker compose logs --tail=80
curl -i http://127.0.0.1:3000/health
curl -i https://legend-hall-api.gjsx.uno/health
curl -i https://legend-hall-api.gjsx.uno/api/v1/people?pageSize=1
```

容器不向宿主机发布端口；`127.0.0.1:3000` 仅在容器内部可用，因此服务器本机主要使用 `docker compose exec legend-hall-proxy wget -qO- http://127.0.0.1:3000/health` 检查。公网请求由现有 `nginx-proxy` 通过外部 `web` 网络转发。

## 5. GitHub Pages

在 GitHub Repository Secrets 设置：

```text
PUBLIC_API_BASE_URL=https://legend-hall-api.gjsx.uno/api/v1
PUBLIC_SITE_URL=https://YOUR_GITHUB_USER.github.io/YOUR_REPOSITORY
```

重新运行 `Deploy Pages`。构建后检查 `apps/web/dist`，确保没有 `deno.dev`、`deno.net`、`netlify.app` 或旧代理域名。

## 运维命令

```bash
cd ~/projects/legend-hall-proxy
docker compose up -d --build
docker compose down
docker compose logs -f --tail=100
```

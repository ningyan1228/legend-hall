# 星耀展馆（Legend Hall）

可运行的内容型人物档案 MVP。Astro 生成静态页面并部署到 GitHub Pages；Fastify 服务只负责密钥保护、Notion/新闻数据转换、内存缓存、限流和错误处理；人物图片存放于 Pages 或长期对象存储。

## 本地开发

要求 Node.js 22、pnpm 10。

```bash
pnpm install
cp apps/proxy/.env.example apps/proxy/.env
pnpm dev
```

前端为 `http://localhost:4321`，代理为 `http://localhost:3000`。默认 `USE_MOCK_DATA=true`，无需 Token。检查命令：

```bash
pnpm typecheck
pnpm test
pnpm build
```

## 目录

```text
apps/web                 Astro + React 静态网站
apps/proxy               Fastify 安全代理
packages/shared          DTO、Zod schema、公共类型
.github/workflows        Pages 部署与定时重建
```

## Notion 数据源

在 Notion 创建并共享给同一个 Integration 的 8 个 Data Source：People、Career Records、Statistics、Honors、Timeline Events、News、Media、Related People。字段名和类型应严格按需求清单创建；Relation 字段指向 People。`Slug` 应唯一，所有公开查询均设置 `Published=true`。图片 URL 必须是仓库 `/images/people/<slug>/...` 或对象存储的长期 URL，不能使用 Notion 临时文件 URL。

将 Integration Token 和每个 Data Source ID 写入 `apps/proxy/.env`，参照 `.env.example`，并设置：

```env
USE_MOCK_DATA=false
NOTION_VERSION=2025-09-03
```

代码使用 `POST /v1/data_sources/{data_source_id}/query`，不是旧数据库查询端点。代理转换 Notion properties 为公共 DTO，并通过 Zod 校验，浏览器不会接触原始 Notion 数据结构或 ID。当前 MVP 已完整实现 People 转换；其他七类接口使用同一 DTO 边界并带演示数据，接入时按 `apps/proxy/src/notion.ts` 的映射模式扩展对应 Data Source。

### People 字段

`Name(Title)`、`Slug`、`NameZh`、`NameEn`、`Nickname`、`Category(football/basketball/film/music)`、`Nationality`、`BirthDate`、`DeathDate`、`BirthPlace`、`Summary`、`Biography`、`AvatarUrl`、`CoverUrl`、`Status(active/retired/deceased)`、`Featured`、`Published`、`SortOrder`、`Views`、`Keywords`、`LastSyncedAt`。

其他数据源字段按项目需求中的字段表建立。`Statistics.ExtraJson` 必须保存合法 JSON；Media 必须补齐来源、作者、版权和 alt。

## 环境变量

代理端私密变量仅存在 `apps/proxy/.env`：Notion Token、Data Source ID、新闻/体育 API Key。前端只允许公开变量：

```env
PUBLIC_API_BASE_URL=https://api.example.com/api/v1
PUBLIC_SITE_URL=https://example.github.io/repository
PUBLIC_CUSTOM_DOMAIN=
```

自定义域名时设置 `PUBLIC_SITE_URL=https://www.example.com` 和 `PUBLIC_CUSTOM_DOMAIN=true`，并在 `apps/web/public/CNAME` 写域名。普通项目 Pages 会自动使用仓库名作为 Astro `base`。

## GitHub Pages

仓库 Settings → Pages → Source 选择 GitHub Actions。添加 Repository Secrets：`PUBLIC_API_BASE_URL`、`PUBLIC_SITE_URL`，自定义域名时再加 `PUBLIC_CUSTOM_DOMAIN=true`。推送 `main` 会类型检查、测试、构建并部署。人物详情由 `getStaticPaths()` 生成 `/people/<slug>/index.html`，刷新不会依赖 SPA 回退。

`scheduled-rebuild.yml` 每小时、手动或收到 `repository_dispatch: notion-content-updated` 时触发部署。未来可由服务器接收 Notion webhook，再用细粒度 GitHub Token 调用 repository dispatch；首阶段不需要 webhook。

## 代理部署

复制根目录 `server-config.example` 为 `.env`，配置真实域名 CORS 白名单（不要使用 `*`）。两种方式：

```bash
# Node + PM2
pnpm install --frozen-lockfile
pnpm --filter @legend/proxy build
pm2 start apps/proxy/ecosystem.config.cjs

# Docker Compose（服务器需已有名为 web 的外部网络）
cd apps/proxy
docker compose up -d --build
```

用 `nginx.example.conf` 配置 HTTPS 反代并补齐证书。生产环境还应由防火墙只开放 80/443。健康检查为 `/health`。

## 新闻 API 接入

真实新闻提供商只在代理端使用 `NEWS_API_KEY`。在 `src/services/news` 中实现适配器，将结果转为 `NewsArticle`，校验来源域名白名单，按规范化标题、原文 URL、来源、时间和人物去重。没有真实 API 时必须保留 `isDemo=true` 与“演示数据”标识，不得伪造实时新闻。

## 已完成

- 16 位 Mock 人物、梅西详情、静态人物 URL、SEO meta 与 Person JSON-LD
- React 搜索、分类筛选、LocalStorage 收藏
- People 列表/详情/搜索、职业、统计、荣誉、时间线和新闻 API
- 统一响应、CORS 白名单、Helmet、请求大小限制、全局与搜索限流
- LRU 内存缓存、并发请求合并、过期缓存回退、Notion 429 指数退避
- GitHub Pages 自动部署、定时重建、Docker/PM2/Nginx 文件

## 尚未接入

- 真实 Notion 内容与七类附属 Data Source 映射（缺少用户 Token/ID）
- 第三方新闻、体育 API 与真实人物图片（缺少供应商与授权素材）
- Notion webhook（第二阶段）

## 安全注意

绝不把 `.env`、Notion Token、API Key 或 Data Source ID 提交到仓库或注入前端。CORS 不是认证机制；若未来增加写接口，应另加身份验证。新闻链接只允许 `https` 和已知来源域名，禁止通用 URL 代理以防 SSRF。日志只记录请求状态与内部错误，不向响应返回堆栈。

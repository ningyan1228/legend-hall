FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/proxy/package.json apps/proxy/package.json
RUN pnpm install --filter @legend/proxy... --frozen-lockfile=false
COPY packages/shared packages/shared
COPY apps/proxy apps/proxy
RUN pnpm --filter @legend/proxy build
EXPOSE 3000
CMD ["node","apps/proxy/dist/server.js"]

FROM node:20.12.2-alpine AS builder
WORKDIR /usr/src
COPY . .
ENV COREPACK_NPM_REGISTRY=https://registry.npmmirror.com
RUN corepack enable
RUN npm config set registry https://registry.npmmirror.com
RUN pnpm install
RUN pnpm run build

FROM node:20.12.2-alpine
WORKDIR /usr/app
RUN apk add --no-cache curl
COPY --from=builder /usr/src/dist/output ./output
ENV HOST=0.0.0.0 PORT=4444 NODE_ENV=production
EXPOSE $PORT
CMD ["node", "output/server/index.mjs"]

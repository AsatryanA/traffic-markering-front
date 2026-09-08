FROM node:20-alpine AS build

RUN corepack enable

WORKDIR /app

# Лок-файл лежит в репозитории, поэтому ставим строго по нему —
# сборка образа не должна тихо подтянуть другие версии зависимостей
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Клиент API (src/shared/api/api.gen.ts) закоммичен, генерировать его в сборке не нужно
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG TIKTOK_SITE_VERIFICATION
ENV TIKTOK_SITE_VERIFICATION=$TIKTOK_SITE_VERIFICATION
RUN pnpm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

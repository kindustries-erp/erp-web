# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
ARG VITE_APP_NAME
ARG VITE_API_BASE_URL
ARG NGINX_API_UPSTREAM=erp-api-klotus-master:10012
ARG APP_ENV=production
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV APP_ENV=${APP_ENV}
RUN bun run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:stable-alpine AS runner

ARG NGINX_API_UPSTREAM=erp-api-klotus-master:10012

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /tmp/default.conf
RUN sed "s|__API_UPSTREAM__|${NGINX_API_UPSTREAM}|g" /tmp/default.conf > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

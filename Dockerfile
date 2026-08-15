# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# IMPORTANT: build args for Next.js (baked into the client bundle at build time)
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_QUIZ_URL
ARG NEXT_PUBLIC_ADMIN_ORIGIN
ARG NEXT_PUBLIC_SERVER_URL

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_QUIZ_URL=$NEXT_PUBLIC_API_QUIZ_URL
ENV NEXT_PUBLIC_ADMIN_ORIGIN=$NEXT_PUBLIC_ADMIN_ORIGIN
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

RUN pnpm build

# ---------- Runtime stage ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S app && adduser -S app -G app

#COPY --from=builder /app/.next/standalone ./
#COPY --from=builder /app/.next/static ./.next/static
#COPY --from=builder /app/public ./public

COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public

USER root
RUN mkdir -p /app/.next/cache/images \
    && chown -R app:app /app \
    && chmod -R 755 /app/.next

USER app
EXPOSE 3000
CMD ["node", "server.js"]

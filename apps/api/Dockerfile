FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN npm ci --workspace=@logistics/api --workspace=@logistics/shared --include-workspace-root 2>/dev/null || \
    npm install --workspace=@logistics/api --workspace=@logistics/shared

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN npm run build --workspace=@logistics/shared
RUN cd apps/api && npx prisma generate && npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/package.json ./

RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["sh", "-c", "cd apps/api && npx prisma migrate deploy && node dist/main.js"]

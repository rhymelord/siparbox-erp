# ─── Aşama 1: Bağımlılıkları yükle ───────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─── Aşama 2: Production imajı ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Güvenlik: root olmayan kullanıcı
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dosya yükleme klasörü için yetki ver
RUN mkdir -p /app/src/public/uploads \
 && chown -R appuser:nodejs /app

USER appuser

EXPOSE 8888

CMD ["node", "src/server.js"]

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
# Compile seed so it runs without ts-node in the final image
RUN npx tsc prisma/seed.ts --outDir dist/seed --esModuleInterop --resolveJsonModule --module commonjs --target es2020 --skipLibCheck 2>/dev/null || true

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
# Keep devDependencies for prisma CLI and seed runner
RUN npm ci
RUN npx prisma generate
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Run migrations, seed demo agents (using pre-compiled JS), then start the API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/seed/seed.js && node dist/src/main"]

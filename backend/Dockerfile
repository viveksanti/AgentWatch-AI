FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
# Keep devDependencies for prisma CLI and seed runner
RUN npm ci
RUN npx prisma generate
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Run migrations, seed demo agents (nest build outputs prisma/seed.ts → dist/prisma/seed.js), then start the API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && node dist/src/main"]

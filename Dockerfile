FROM node:20-alpine AS builder
RUN apk add --no-cache git
WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm ci
COPY src/ ./src/

COPY ormconfig.ts ./
COPY src/email/templates ./src/email/templates

RUN npm run build
RUN ls -la dist/
RUN find dist/ -name "*.js" | head -10

FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/ormconfig.ts ./
COPY --from=builder --chown=nestjs:nodejs /app/src/email/templates ./src/email/templates

RUN ls -la dist/
RUN find dist/ -name "*.js" | head -10

USER nestjs
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
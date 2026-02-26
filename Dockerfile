# Stage 1: Install production dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Build TypeScript
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json ./
COPY prisma ./prisma

USER appuser
EXPOSE 3000

CMD ["node", "dist/server.js"]

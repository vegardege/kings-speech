# Base stage
FROM node:25-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS install
RUN mkdir -p /tmp/dev
COPY package.json package-lock.json /tmp/dev/
RUN cd /tmp/dev && npm ci

RUN mkdir -p /tmp/prod
COPY package.json package-lock.json /tmp/prod/
RUN cd /tmp/prod && npm ci --only=production

# Build stage
FROM base AS builder
COPY --from=install /tmp/dev/node_modules ./node_modules
COPY . .

# Make DB available for static generation
ENV NODE_ENV=production
ENV XDG_DATA_HOME=/app/data
RUN mkdir -p /app/data/royal-pipes

# Copy database into builder stage for SSG
COPY data/royal-pipes/analytics.db /app/data/royal-pipes/analytics.db

RUN npm run build

# Production runtime
FROM base AS runner

ENV NODE_ENV=production
ENV XDG_DATA_HOME=/app/data

COPY --from=install /tmp/prod/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/messages ./messages

# Ensure directory exists
RUN mkdir -p /app/data/royal-pipes

# Copy DB from builder → runner
COPY --from=builder /app/data/royal-pipes/analytics.db \
    /app/data/royal-pipes/analytics.db

EXPOSE 3000
CMD ["npm", "start"]

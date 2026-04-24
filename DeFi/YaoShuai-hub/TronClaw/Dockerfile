# Use Node.js 20
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/gateway/package.json ./packages/gateway/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @tronclaw/gateway --filter @tronclaw/shared

# Copy source
COPY packages/shared ./packages/shared
COPY packages/gateway ./packages/gateway
COPY tsconfig.base.json ./

# Build shared first
RUN pnpm --filter @tronclaw/shared build

# Build gateway
RUN pnpm --filter @tronclaw/gateway build

WORKDIR /app/packages/gateway

EXPOSE 3000

CMD ["node", "dist/index.js"]

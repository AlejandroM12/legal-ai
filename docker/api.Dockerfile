FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm ci -w @legal-ai/api --include-workspace-root
COPY packages packages
COPY apps/api apps/api
RUN npm run prisma:generate -w @legal-ai/api && npm run build -w @legal-ai/api
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]

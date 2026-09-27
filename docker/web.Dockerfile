FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm ci -w @legal-ai/web --include-workspace-root
COPY apps/web apps/web
COPY packages packages
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build -w @legal-ai/web
WORKDIR /app/apps/web
CMD ["npm", "run", "start"]

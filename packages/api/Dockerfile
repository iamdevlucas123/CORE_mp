FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/api/package.json packages/api/package.json

RUN npm install --omit=dev

COPY packages/shared packages/shared
COPY packages/api packages/api

EXPOSE 3001

CMD ["node", "packages/api/src/server.js"]
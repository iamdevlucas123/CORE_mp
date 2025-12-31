FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/api/package.json packages/api/package.json

RUN npm install

COPY packages/shared packages/shared
COPY packages/api packages/api

RUN npm --workspace @core/api run generate

EXPOSE 3001

CMD ["node", "packages/api/src/server.js"]

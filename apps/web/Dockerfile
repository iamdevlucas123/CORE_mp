FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm install

COPY apps/web apps/web
COPY packages/shared packages/shared

EXPOSE 5173

CMD ["npm", "--workspace", "@core/web", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

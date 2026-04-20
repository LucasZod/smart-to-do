FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ sqlite-dev

COPY package.json pnpm-lock.yaml ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache sqlite-libs

COPY --from=builder /app/package.json ./

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "dist/main"]

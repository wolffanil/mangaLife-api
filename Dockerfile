FROM node:20.17.0-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

FROM base AS build

COPY . .

RUN npm run build

FROM base AS production

WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./

RUN npm install --legacy-peer-deps --only=production

COPY --from=build /app/dist ./dist

CMD ["node", "dist/main"]






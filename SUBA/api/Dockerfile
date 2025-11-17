# syntax=docker/dockerfile:1
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies (use npm install to avoid lockfile requirement in subworkspace)
COPY package.json ./
RUN npm install --omit=dev && cp -R node_modules /prod_node_modules

# Builder
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# Runtime
FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /prod_node_modules ./node_modules
COPY package.json ./
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]

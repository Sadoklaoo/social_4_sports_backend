# 1) Build stage
FROM node:20 AS builder
WORKDIR /usr/src/app
COPY package*.json tsconfig.json ./
RUN npm install
COPY src ./src
# Compile all TS to JS in /usr/src/app/dist
RUN npm run build

# 2) Production stage
FROM node:20
WORKDIR /usr/src/app

# Copy just the compiled JS and package.json for production
COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
ENV NODE_ENV=production

# default to running the API
CMD ["npm","start"]

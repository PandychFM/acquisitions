# syntax=docker/dockerfile:1

# --- build stage ---
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
# Install deps first for better layer caching
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
# Copy the rest of the app
COPY . .

# --- production runtime ---
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app
# Copy only what is needed to run
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
COPY --from=build /app .
EXPOSE 3000
# Your app should read DATABASE_URL from env
CMD ["npm", "start"]

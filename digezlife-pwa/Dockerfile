# Multi-stage PWA Production Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
ARG VITE_API_URL=https://digeezsalife.alamiaconnect.com
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Production Nginx Server
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

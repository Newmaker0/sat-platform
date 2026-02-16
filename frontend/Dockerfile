FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

ARG NGINX_CONF=nginx.prod.conf
COPY deploy/nginx.prod.conf /tmp/nginx/nginx.prod.conf
COPY deploy/nginx.local-docker.conf /tmp/nginx/nginx.local-docker.conf
RUN cp /tmp/nginx/${NGINX_CONF} /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/sat-frontend /usr/share/nginx/html

EXPOSE 80

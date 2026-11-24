FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
COPY --from=project package.json /package.json
RUN npm run build

FROM nginx:alpine AS runner
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --chmod=755 docker/40-pocketrun-config.sh /docker-entrypoint.d/40-pocketrun-config.sh
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

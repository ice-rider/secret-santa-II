FROM node:24-alpine AS build

WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

RUN npm ci

# Копируем файлы проекта
COPY . .

ENV VITE_API_BASE_URL=/api
ENV VITE_SIGNALR_HUB_URL=/hubs/game
ENV VITE_OAUTH_REDIRECT_URI=/auth/callback

RUN npm run build


FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

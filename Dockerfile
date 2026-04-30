# Étape 1 : Build des assets React avec Node LTS
FROM node:lts-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build

# Étape 2 : Environnement PHP de production
FROM webdevops/php-apache:8.2-alpine
WORKDIR /app

# Copie des fichiers du projet
COPY . .
COPY --from=build-stage /app/public/build ./public/build

# Installation des dépendances PHP
RUN composer install --no-dev --optimize-autoloader

# Permissions pour Laravel
RUN chown -R application:application /app/storage /app/bootstrap/cache

ENV WEB_DOCUMENT_ROOT=/app/public
EXPOSE 80
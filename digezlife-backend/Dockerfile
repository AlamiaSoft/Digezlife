# Stage 1: Build vendor
FROM composer:2.7 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
# Copy local packages since they are required for composer install
COPY packages/ packages/
# Ignore platform requirements since we might be building on a machine without the exact PHP extensions
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts \
    --ignore-platform-reqs

# Stage 2: Application
FROM dunglas/frankenphp:php8.3-alpine AS app

# Set Environment for production
ENV SERVER_NAME=":8000"
ENV OCTANE_SERVER="frankenphp"
ENV PHP_INI_DIR="/usr/local/etc/php"

# Use production PHP configuration
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    libzip-dev \
    linux-headers \
    && install-php-extensions \
    pdo_pgsql pgsql pdo_sqlite sqlite3 gd zip pcntl redis opcache intl bcmath exif

# Add non-root user
RUN addgroup -g 1000 laravel && adduser -u 1000 -G laravel -s /bin/sh -D laravel

WORKDIR /app

# Copy application files
COPY --chown=laravel:laravel . /app
# Copy vendor from stage 1
COPY --from=vendor --chown=laravel:laravel /app/vendor/ /app/vendor/

# Set permissions
RUN chmod -R 775 /app/storage /app/bootstrap/cache

# Caching for production (Route, View, Event). 
# Note: config:cache is omitted here to avoid baking in empty build-time env vars.
# It should be run at runtime via an entrypoint or deployment script if desired.
RUN php artisan route:cache \
    && php artisan view:cache \
    && php artisan event:cache

# Switch to non-root user
USER laravel

# Define healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/up || exit 1

# Start FrankenPHP via Octane
CMD ["php", "artisan", "octane:frankenphp", "--host=0.0.0.0", "--port=8000", "--workers=4", "--max-requests=250"]

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

# Configure Caddy / FrankenPHP data and config paths for non-root execution
ENV XDG_DATA_HOME="/data"
ENV XDG_CONFIG_HOME="/config"
ENV CADDY_GLOBAL_OPTIONS="auto_https off"

# Add non-root user and create storage directories
RUN addgroup -g 1000 laravel && adduser -u 1000 -G laravel -s /bin/sh -D laravel \
    && mkdir -p /data/caddy /config/caddy /app/database

WORKDIR /app

# Copy application files
COPY --chown=laravel:laravel . /app
# Copy vendor from stage 1
COPY --from=vendor --chown=laravel:laravel /app/vendor/ /app/vendor/

# Set permissions
RUN chown -R laravel:laravel /data /config /app/storage /app/bootstrap/cache /app/database \
    && chmod -R 775 /data /config /app/storage /app/bootstrap/cache /app/database \
    && chmod +x /app/docker-entrypoint.sh

# Switch to non-root user
USER laravel

# Define healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/up || exit 1

# Entrypoint performs automated 1-click migrations, seeding & bootstrap
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start FrankenPHP via Octane
CMD ["php", "artisan", "octane:frankenphp", "--host=0.0.0.0", "--port=8000", "--workers=4", "--max-requests=250"]

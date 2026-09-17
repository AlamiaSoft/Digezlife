#!/bin/sh
set -e

echo "--------------------------------------------------------"
echo "  GharlyApp Backend Engine - Automated 1-Click Bootstrap"
echo "--------------------------------------------------------"

# 1. Ensure required storage directories exist with proper write permissions
mkdir -p /data/caddy \
         /config/caddy \
         /app/storage/framework/cache/data \
         /app/storage/framework/sessions \
         /app/storage/framework/views \
         /app/storage/logs \
         /app/database

# 2. If using SQLite and DB file does not exist, initialize it
if [ "$DB_CONNECTION" = "sqlite" ] || [ -z "$DB_CONNECTION" ]; then
    DB_FILE="${DB_DATABASE:-/app/database/database.sqlite}"
    if [ ! -f "$DB_FILE" ]; then
        echo "[GharlyApp Bootstrap] Initializing SQLite database file: $DB_FILE"
        touch "$DB_FILE"
    fi
fi

# 3. If starting the primary web backend (Octane / FrankenPHP), run automated migrations & seeders
if [ "$1" = "php" ] && [ "$2" = "artisan" ] && [ "$3" = "octane:frankenphp" ]; then
    # Ensure frankenphp-worker.php is in public folder
    if [ ! -f "/app/public/frankenphp-worker.php" ]; then
        if [ -f "/app/vendor/laravel/octane/src/Commands/stubs/frankenphp-worker.php" ]; then
            echo "[GharlyApp Bootstrap] Publishing public/frankenphp-worker.php stub..."
            cp "/app/vendor/laravel/octane/src/Commands/stubs/frankenphp-worker.php" "/app/public/frankenphp-worker.php"
        fi
    fi

    echo "[GharlyApp Bootstrap] Running automated database migrations..."
    php artisan migrate --force

    echo "[GharlyApp Bootstrap] Checking and running baseline seeders..."
    php artisan db:seed --class=MarketingSeeder --force || true
    php artisan db:seed --class=DatabaseSeeder --force || true

    # Create SuperAdmin account automatically if credentials provided (or use sensible production defaults)
    SUPERADMIN_EMAIL="${SUPERADMIN_EMAIL:-admin@gharlyapp.com}"
    SUPERADMIN_NAME="${SUPERADMIN_NAME:-System Admin}"
    SUPERADMIN_PASSWORD="${SUPERADMIN_PASSWORD:-Admin@Gharly2026!}"

    if [ -n "$SUPERADMIN_EMAIL" ] && [ -n "$SUPERADMIN_PASSWORD" ]; then
        echo "[GharlyApp Bootstrap] Verifying SuperAdmin user: $SUPERADMIN_EMAIL"
        php artisan tenant-engine:create-super-admin \
            --name="$SUPERADMIN_NAME" \
            --email="$SUPERADMIN_EMAIL" \
            --password="$SUPERADMIN_PASSWORD" 2>/dev/null || echo "[GharlyApp Bootstrap] SuperAdmin account already initialized."
    fi

    # Optimize caches for production
    if [ "$APP_ENV" = "production" ]; then
        echo "[GharlyApp Bootstrap] Caching application routes and configuration..."
        php artisan route:cache || true
        php artisan view:cache || true
        php artisan event:cache || true
    fi
fi

echo "[GharlyApp Bootstrap] Initialization complete. Executing command: $@"
echo "--------------------------------------------------------"
exec "$@"

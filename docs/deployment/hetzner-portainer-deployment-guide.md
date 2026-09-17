# GharlyApp Hetzner CX43 & Cloudflare Deployment Guide

This document outlines the deployment strategy and configuration for deploying **GharlyApp** to a **Hetzner CX43 VPS** (with Cloudflare Tunnel, Docker, and Portainer) and **Cloudflare Pages**.

---

## 1. Architecture & Domain Mapping

| Role | Hostname (Cloudflare) | Hosting Environment | Internal Ingress / Port |
|---|---|---|---|
| **API & SuperAdmin** | `https://gharlapi.alamiaconnect.com` | Hetzner CX43 VPS (Portainer) | `http://gharly-backend:8000` (or `localhost:8082`) |
| **Consumer PWA (Option A - Recommended)** | `https://gharly.alamiaconnect.com` | **Cloudflare Pages** | Global Edge CDN (`dist/` build) |
| **Consumer PWA (Option B - Self-Hosted)** | `https://gharly.alamiaconnect.com` | Hetzner CX43 VPS (Portainer) | `http://gharly-pwa:80` (or `localhost:3082`) |

---

## 2. Cloudflare Tunnel Configuration (Zero Trust)

In the **Cloudflare Zero Trust Dashboard** (`Networks -> Tunnels -> Public Hostnames`):

### Hostname 1: Backend API & SuperAdmin
- **Subdomain**: `gharlapi`
- **Domain**: `alamiaconnect.com`
- **Service Type**: `HTTP`
- **URL**: `localhost:8082` (or `gharly-backend:8000` if cloudflared is attached to `gharly-net`)
- **Additional Settings**:
  - **HTTP/2 Origin**: Enabled
  - **Pass Host Header**: `gharlapi.alamiaconnect.com`
  - **WAF / Access**: (Optional) Add Access Application policy for `/admin/*` SuperAdmin route

### Hostname 2: Consumer PWA (Only required if using Option B on VPS)
- **Subdomain**: `gharly`
- **Domain**: `alamiaconnect.com`
- **Service Type**: `HTTP`
- **URL**: `localhost:3082` (or `gharly-pwa:80`)
- **Additional Settings**:
  - **HTTP/2 Origin**: Enabled
  - **WebSocket**: Enabled

---

## 3. Frontend Deployment (Option A: Cloudflare Pages — Recommended)

Deploying the static PWA build to Cloudflare Pages provides instant worldwide edge caching (~10-20ms latency) and zero CPU/RAM impact on your Hetzner VPS.

### Step 1: Connect Git Repository to Cloudflare Pages
1. Open Cloudflare Dashboard -> **Compute (Workers & Pages)** -> **Create Application** -> **Pages** -> **Connect to Git**.
2. Select your repository (`Digezlife`).

### Step 2: Build & Deployment Settings
- **Framework Preset**: `Vite` (or None)
- **Root Directory**: `digezlife-pwa`
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Environment Variables**:
  ```env
  VITE_API_URL = https://gharlapi.alamiaconnect.com
  NODE_VERSION = 20
  ```

### Step 3: Custom Domain
1. In Cloudflare Pages project settings, navigate to **Custom Domains** -> **Set up a domain**.
2. Enter `gharly.alamiaconnect.com` (and optionally `gharlyapp.com`).
3. Cloudflare will automatically provision SSL certificates and route traffic to your edge-distributed PWA.

---

## 4. Backend Portainer Stack Deployment (Hetzner CX43)

### True 1-Click Zero-Touch Deployment
The `gharly-backend` Docker container includes an automated initialization entrypoint (`docker-entrypoint.sh`). When the stack starts up:
1. SQLite database files and storage permissions are automatically prepared.
2. `php artisan migrate --force` runs automatically.
3. Baseline seeders (`MarketingSeeder` & `DatabaseSeeder`) populate demo & household data automatically.
4. The Platform SuperAdmin account is automatically provisioned using `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD`.
5. Configuration and route caches are automatically optimized for production.

**Zero manual console/bash commands are required after deploying the stack.**

### Step 1: Create Stack in Portainer
1. Open Portainer (`https://your-server-ip:9443`).
2. Navigate to **Stacks** -> **Add Stack**.
3. Name: `gharlyapp`.
4. Select **Repository** (or paste `docker-compose.portainer.yml` in the Web Editor).
5. Add the following Environment Variables in the Portainer Stack editor:
   ```env
   APP_NAME=GharlyApp
   APP_KEY=base64:GENERATE_WITH_PHP_ARTISAN_KEY_GENERATE
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://gharlapi.alamiaconnect.com
   CORS_ALLOWED_ORIGINS=https://gharlyapp.alamiaconnect.com,https://gharly.alamiaconnect.com,https://gharlyapp.com,https://gharlyapp.pages.dev,http://localhost:3000
   SANCTUM_STATEFUL_DOMAINS=gharlyapp.alamiaconnect.com,gharly.alamiaconnect.com,gharlapi.alamiaconnect.com,gharlyapp.com,gharlyapp.pages.dev
   DB_CONNECTION=sqlite
   DB_DATABASE=/app/database/database.sqlite
   SESSION_DRIVER=redis
   CACHE_STORE=redis
   QUEUE_CONNECTION=redis
   SUPERADMIN_NAME=System Admin
   SUPERADMIN_EMAIL=admin@gharlyapp.com
   SUPERADMIN_PASSWORD=YOUR_STRONG_SECURE_PASSWORD
   REDIS_HOST=gharly-redis
   REDIS_PORT=6379
   ```
6. Click **Deploy the stack**.

---

## 5. Post-Deployment Verification Checklist

1. **API Health Endpoint**:
   ```bash
   curl -i https://gharlapi.alamiaconnect.com/up
   # Expected: HTTP/2 200 OK
   ```

2. **CORS Preflight Check**:
   ```bash
   curl -i -X OPTIONS https://gharlapi.alamiaconnect.com/api/v1/auth/login \
     -H "Origin: https://gharly.alamiaconnect.com" \
     -H "Access-Control-Request-Method: POST"
   # Expected: access-control-allow-origin: https://gharly.alamiaconnect.com
   ```

3. **Consumer PWA**:
   - Open `https://gharly.alamiaconnect.com`.
   - Test login with `demo@gharlyapp.com` / `password123`.
   - Verify grocery checklist item toggle, hisab cashflow entry, and bill reminder creation.

4. **SuperAdmin Panel**:
   - Navigate to `https://gharlapi.alamiaconnect.com/admin`.
   - Log in with `admin@gharlyapp.com` / `Admin@Gharly2026!`.
   - Verify active households, tenants, and system telemetry metrics.

---

## 6. Optional Manual Maintenance Commands

If you ever need to manually trigger administrative tasks from the Portainer container console (`gharly-backend` -> `/bin/sh`):

- **Re-run Migrations**: `php artisan migrate --force`
- **Reset & Re-seed Database**: `php artisan migrate:fresh --seed --force`
- **Create Additional SuperAdmin**: `php artisan tenant-engine:create-super-admin --name="Name" --email="email@domain.com" --password="password"`
- **Clear Application Cache**: `php artisan optimize:clear`



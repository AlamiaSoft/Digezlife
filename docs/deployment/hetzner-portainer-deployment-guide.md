# DigEzLife Hetzner CX43 Deployment Guide

This document outlines the deployment strategy and configuration for deploying DigEzLife to a Hetzner CX43 VPS with Cloudflare Tunnel, Docker, and Portainer.

---

## 1. Domain & Hostname Mapping

| Role | Public Hostname (Cloudflare) | Service Container | Internal Port |
|---|---|---|---|
| **Consumer PWA** | `https://digeezlife.alamiaconnect.com` | `digezlife-pwa` | `http://localhost:3000` (or `http://digezlife-pwa:80`) |
| **API & SuperAdmin** | `https://digeezsalife.alamiaconnect.com` | `digezlife-backend` | `http://localhost:8000` (or `http://digezlife-backend:8000`) |

---

## 2. Cloudflare Tunnel Configuration

In the Cloudflare Zero Trust dashboard (Networks -> Tunnels -> Public Hostnames):

### Hostname 1: Consumer PWA
- **Subdomain**: `digeezlife`
- **Domain**: `alamiaconnect.com`
- **Service Type**: `HTTP`
- **URL**: `localhost:3000` (or `digezlife-pwa:80` if cloudflared is on the same Docker network)
- **Additional Settings**:
  - HTTP/2 Origin: Enabled
  - WebSocket: Enabled (for live updates / PWA reconnects)

### Hostname 2: API & SuperAdmin
- **Subdomain**: `digeezsalife`
- **Domain**: `alamiaconnect.com`
- **Service Type**: `HTTP`
- **URL**: `localhost:8000` (or `digezlife-backend:8000`)
- **Additional Settings**:
  - HTTP/2 Origin: Enabled
  - Pass Host Header: `digeezsalife.alamiaconnect.com`
  - Cloudflare Access Policies: Recommended for `/admin/*` path protection

---

## 3. Portainer Stack Deployment

1. Open Portainer (`https://your-server-ip:9443`).
2. Navigate to **Stacks** -> **Add Stack**.
3. Name: `digezlife`.
4. Paste the contents of `docker-compose.portainer.yml` into the Web Editor (or connect your Git repository).
5. Add Environment Variables in Portainer (under Stack Env):
   ```env
   APP_KEY=base64:H15sBbWfrKUc6XM8vSLwQzfqH4zhoP3lm3I/eex4IoQ=
   APP_URL=https://digeezsalife.alamiaconnect.com
   CORS_ALLOWED_ORIGINS=https://digeezlife.alamiaconnect.com
   SANCTUM_STATEFUL_DOMAINS=digeezlife.alamiaconnect.com,digeezsalife.alamiaconnect.com
   ```
6. Click **Deploy the stack**.

---

## 4. Initial Stack Initialization (One-Time)

Once the containers are running:
1. Open Portainer -> Containers -> Click `digezlife-backend` -> Console (`/bin/sh`).
2. Run database migrations:
   ```bash
   php artisan migrate --force
   ```
3. Seed default marketing and demo data:
   ```bash
   php artisan db:seed --class=MarketingSeeder --force
   php artisan db:seed --class=DatabaseSeeder --force
   ```
4. Create the Platform SuperAdmin user:
   ```bash
   php artisan tenant-engine:create-super-admin --name="System Admin" --email="admin@digezlife.com" --password="your-secure-password"
   ```

---

## 5. Post-Deployment Verification

1. **Consumer PWA**:
   - Navigate to `https://digeezlife.alamiaconnect.com`.
   - Verify Service Worker installation, theme styling, and API connection to `https://digeezsalife.alamiaconnect.com`.
   - Test login with `demo@digezlife.com` / `password123`.

2. **SuperAdmin Panel**:
   - Navigate to `https://digeezsalife.alamiaconnect.com/admin`.
   - Log in with `admin@digezlife.com` / credentials created above.
   - Verify platform metrics, tenant list, and audit logs.

3. **API Health**:
   - `curl -i https://digeezsalife.alamiaconnect.com/up` (Expected: HTTP 200 OK).

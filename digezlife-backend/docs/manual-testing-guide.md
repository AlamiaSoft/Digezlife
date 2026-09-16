# Manual Testing Guide: E2E Tenant Flow

This guide walks you through manually testing the end-to-end multi-tenant flow of the Alamia SaaS Platform using the `examples/workspace` reference application.

## 1. Environment Setup
Before starting, ensure that the application is running and the database is migrated.

1. Navigate to the `examples/workspace` directory:
   ```bash
   cd examples/workspace
   ```
2. Start the local development server:
   ```bash
   php artisan serve
   ```
   *The server will start on `http://127.0.0.1:8000` or `http://localhost:8000`.*

---

## 2. Creating a Workspace (Tenant)
The entry point for a new customer is the central domain's workspace creation page.

1. Open your browser and navigate to:
   ```text
   http://127.0.0.1:8000/
   ```
2. You will see the **Create Workspace (Tenant)** form.
3. Enter a workspace name (e.g., `Acme Corp`).
4. Enter a subdomain (e.g., `acme`).
5. Click **Create Workspace**.

**What happens behind the scenes?**
- The `Alamia\Core\Tenant\Models\Tenant` is created.
- A `Domain` record (`acme.localhost`) is associated with the tenant.
- A dummy administrator user is automatically generated for this workspace.

---

## 3. Accessing the Workspace
Once created, your new workspace will appear in the **Existing Workspaces** list immediately below the form.

1. Find your newly created workspace in the list.
2. Click the **Login &rarr;** button.
3. You will be redirected to the tenant's login page, which operates on the subdomain you provided:
   ```text
   http://acme.localhost:8000/login
   ```

*(Note: Most modern browsers like Chrome and Edge automatically resolve `*.localhost` to `127.0.0.1`. If the page fails to load on a different OS/Browser, you may need to add `127.0.0.1 acme.localhost` to your system's `hosts` file).*

---

## 4. Authenticating as Tenant Admin
1. On the tenant login page, enter the auto-generated administrator credentials.
2. **Email:** `admin@{subdomain}.com` (e.g., if your subdomain is `acme`, the email is `admin@acme.com`).
3. **Password:** `password`
4. Click **Login**.

---

## 5. Exploring Workspace Features
Upon successful login, you will be redirected to the tenant dashboard (`/dashboard`). From here, you can test the advanced SaaS modules provided by `alamia-core`:

### A. Settings
- **Route:** `/settings/general` (or accessible via navigation if configured)
- **Test:** Update the "Site Name" or "Support Email". This utilizes `spatie/laravel-settings` scoped to the current tenant context.

### B. Notifications
- **Route:** `/notifications`
- **Test:** View any system notifications assigned to the user. You can mark them as read or delete them. 

### C. Audit Logs
- **Route:** `/audit-logs`
- **Test:** View the activity logs (powered by `spatie/laravel-activitylog`). This table lists all model and system events that occurred within this workspace.

### D. User & Role Management
- **Route:** `/users` and `/roles`
- **Test:** Create new users and assign them roles. Verify that the `Spatie\Permission` logic correctly gates access based on the logged-in user's role.

### E. Custom Modules
- **Route:** `/hello-module`
- **Test:** Verify that dynamically loaded external modules are accessible. This page should display "Hello from HelloModule!", confirming the Kernel's module autoloader is functional.

---

## Troubleshooting
- **"Tenant could not be identified on domain":** This means the subdomain string (e.g., `acme.localhost`) isn't present in the `domains` table. If a tenant creation fails midway, the tenant might exist without a domain. Delete the orphaned tenant using `php artisan tinker` or recreate it with a new subdomain.
- **SQLite Locks:** If you encounter `database is locked` errors during creation, ensure that `DatabaseTenancyBootstrapper` is disabled in `config/tenancy.php` since `alamia-core` defaults to a Single Database Architecture.

import os
import shutil
import re

base_path = 'src'
# mappings format: source_file_or_dir -> dest_file_or_dir
# if it's a dir, it moves all contents inside it to the dest dir
mappings = {
    # Kernel & Shared
    'Traits/OptimizesQueries.php': 'Shared/Traits/OptimizesQueries.php',
    'Commands/InstallCommand.php': 'Kernel/Commands/InstallCommand.php',
    'Commands/GenerateSwaggerCommand.php': 'Kernel/Commands/GenerateSwaggerCommand.php',
    'Middleware/ApiVersionMiddleware.php': 'Kernel/Http/Middleware/ApiVersionMiddleware.php',
    
    # Tenant
    'Models/Tenant.php': 'Tenant/Models/Tenant.php',
    'Models/Traits/BelongsToTenant.php': 'Tenant/Models/Traits/BelongsToTenant.php',
    'Models/Traits/HasTenants.php': 'Tenant/Models/Traits/HasTenants.php',
    'Http/Middleware/CheckTenantStatus.php': 'Tenant/Http/Middleware/CheckTenantStatus.php',
    'Http/Middleware/DebugInitTenancy.php': 'Tenant/Http/Middleware/DebugInitTenancy.php',
    'Http/Requests/CreateTenantRequest.php': 'Tenant/Http/Requests/CreateTenantRequest.php',
    'Http/Requests/UpdateTenantRequest.php': 'Tenant/Http/Requests/UpdateTenantRequest.php',
    'Http/Resources/TenantResource.php': 'Tenant/Http/Resources/TenantResource.php',
    'Providers/TenancyServiceProvider.php': 'Tenant/Providers/TenancyServiceProvider.php',
    'Services/TenantService.php': 'Tenant/Services/TenantService.php',
    'Commands/TenantCreateCommand.php': 'Tenant/Commands/TenantCreateCommand.php',
    'Commands/TenantMigrateCommand.php': 'Tenant/Commands/TenantMigrateCommand.php',
    'Routes/tenant.php': 'Tenant/Routes/tenant.php',
    
    # Identity
    'Models/OAuthProvider.php': 'Identity/Models/OAuthProvider.php',
    'Http/Requests/LoginRequest.php': 'Identity/Http/Requests/LoginRequest.php',
    
    # Authorization
    'Models/SuperAdmin.php': 'Authorization/Models/SuperAdmin.php',
    'Http/Middleware/EnsureSuperAdmin.php': 'Authorization/Http/Middleware/EnsureSuperAdmin.php',
    'Http/Middleware/SuperAdminOnly.php': 'Authorization/Http/Middleware/SuperAdminOnly.php',
    'Http/Middleware/TenantAdminOnly.php': 'Authorization/Http/Middleware/TenantAdminOnly.php',
    'Http/Requests/CreateSuperAdminRequest.php': 'Authorization/Http/Requests/CreateSuperAdminRequest.php',
    'Http/Resources/SuperAdminResource.php': 'Authorization/Http/Resources/SuperAdminResource.php',
    'Http/Resources/RoleResource.php': 'Authorization/Http/Resources/RoleResource.php',
    'Http/Resources/UserResource.php': 'Authorization/Http/Resources/UserResource.php',
    'Commands/CreateSuperAdminCommand.php': 'Authorization/Commands/CreateSuperAdminCommand.php',
    'Routes/super-admin.php': 'Authorization/Routes/super-admin.php',
    
    # Administration (or Billing for Plans/Products)
    'Models/Plan.php': 'Billing/Models/Plan.php',
    'Models/Product.php': 'Billing/Models/Product.php',
    'Http/Resources/PlanResource.php': 'Billing/Http/Resources/PlanResource.php',
    'Http/Resources/ProductResource.php': 'Billing/Http/Resources/ProductResource.php',
    
    # Audit
    'Models/AuditLog.php': 'Audit/Models/AuditLog.php',
    'Http/Middleware/LogActivity.php': 'Audit/Http/Middleware/LogActivity.php',
    'Http/Resources/AuditLogResource.php': 'Audit/Http/Resources/AuditLogResource.php',
    
    # Shared / Base things
    'Models/Traits/HasExternalId.php': 'Shared/Traits/HasExternalId.php',
    'Controllers/API/BaseController.php': 'Shared/Http/Controllers/BaseController.php',
    'Http/Middleware/ValidateJsonApi.php': 'Shared/Http/Middleware/ValidateJsonApi.php',
    'Routes/api.php': 'Kernel/Routes/api.php',
}

def move_file(src, dest):
    src_full = os.path.join(base_path, src)
    dest_full = os.path.join(base_path, dest)
    if not os.path.exists(src_full):
        print(f"Skipping {src}, not found.")
        return
        
    os.makedirs(os.path.dirname(dest_full), exist_ok=True)
    shutil.move(src_full, dest_full)
    print(f"Moved {src} to {dest}")

for src, dest in mappings.items():
    move_file(src, dest)

import os
import re

base_path = 'src'

# Map of old fully qualified names to new fully qualified names
class_map = {
    'Alamia\\Core\\Traits\\OptimizesQueries': 'Alamia\\Core\\Shared\\Traits\\OptimizesQueries',
    'Alamia\\Core\\Commands\\InstallCommand': 'Alamia\\Core\\Kernel\\Commands\\InstallCommand',
    'Alamia\\Core\\Commands\\GenerateSwaggerCommand': 'Alamia\\Core\\Kernel\\Commands\\GenerateSwaggerCommand',
    'Alamia\\Core\\Middleware\\ApiVersionMiddleware': 'Alamia\\Core\\Kernel\\Http\\Middleware\\ApiVersionMiddleware',
    
    'Alamia\\Core\\Models\\Tenant': 'Alamia\\Core\\Tenant\\Models\\Tenant',
    'Alamia\\Core\\Models\\Traits\\BelongsToTenant': 'Alamia\\Core\\Tenant\\Models\\Traits\\BelongsToTenant',
    'Alamia\\Core\\Models\\Traits\\HasTenants': 'Alamia\\Core\\Tenant\\Models\\Traits\\HasTenants',
    'Alamia\\Core\\Http\\Middleware\\CheckTenantStatus': 'Alamia\\Core\\Tenant\\Http\\Middleware\\CheckTenantStatus',
    'Alamia\\Core\\Http\\Middleware\\DebugInitTenancy': 'Alamia\\Core\\Tenant\\Http\\Middleware\\DebugInitTenancy',
    'Alamia\\Core\\Http\\Requests\\CreateTenantRequest': 'Alamia\\Core\\Tenant\\Http\\Requests\\CreateTenantRequest',
    'Alamia\\Core\\Http\\Requests\\UpdateTenantRequest': 'Alamia\\Core\\Tenant\\Http\\Requests\\UpdateTenantRequest',
    'Alamia\\Core\\Http\\Resources\\TenantResource': 'Alamia\\Core\\Tenant\\Http\\Resources\\TenantResource',
    'Alamia\\Core\\Providers\\TenancyServiceProvider': 'Alamia\\Core\\Tenant\\Providers\\TenancyServiceProvider',
    'Alamia\\Core\\Services\\TenantService': 'Alamia\\Core\\Tenant\\Services\\TenantService',
    'Alamia\\Core\\Commands\\TenantCreateCommand': 'Alamia\\Core\\Tenant\\Commands\\TenantCreateCommand',
    'Alamia\\Core\\Commands\\TenantMigrateCommand': 'Alamia\\Core\\Tenant\\Commands\\TenantMigrateCommand',
    
    'Alamia\\Core\\Models\\OAuthProvider': 'Alamia\\Core\\Identity\\Models\\OAuthProvider',
    'Alamia\\Core\\Http\\Requests\\LoginRequest': 'Alamia\\Core\\Identity\\Http\\Requests\\LoginRequest',
    
    'Alamia\\Core\\Models\\SuperAdmin': 'Alamia\\Core\\Authorization\\Models\\SuperAdmin',
    'Alamia\\Core\\Middleware\\EnsureSuperAdmin': 'Alamia\\Core\\Authorization\\Http\\Middleware\\EnsureSuperAdmin',
    'Alamia\\Core\\Http\\Middleware\\SuperAdminOnly': 'Alamia\\Core\\Authorization\\Http\\Middleware\\SuperAdminOnly',
    'Alamia\\Core\\Http\\Middleware\\TenantAdminOnly': 'Alamia\\Core\\Authorization\\Http\\Middleware\\TenantAdminOnly',
    'Alamia\\Core\\Http\\Requests\\CreateSuperAdminRequest': 'Alamia\\Core\\Authorization\\Http\\Requests\\CreateSuperAdminRequest',
    'Alamia\\Core\\Http\\Resources\\SuperAdminResource': 'Alamia\\Core\\Authorization\\Http\\Resources\\SuperAdminResource',
    'Alamia\\Core\\Http\\Resources\\RoleResource': 'Alamia\\Core\\Authorization\\Http\\Resources\\RoleResource',
    'Alamia\\Core\\Http\\Resources\\UserResource': 'Alamia\\Core\\Authorization\\Http\\Resources\\UserResource',
    'Alamia\\Core\\Commands\\CreateSuperAdminCommand': 'Alamia\\Core\\Authorization\\Commands\\CreateSuperAdminCommand',
    
    'Alamia\\Core\\Models\\Plan': 'Alamia\\Core\\Billing\\Models\\Plan',
    'Alamia\\Core\\Models\\Product': 'Alamia\\Core\\Billing\\Models\\Product',
    'Alamia\\Core\\Http\\Resources\\PlanResource': 'Alamia\\Core\\Billing\\Http\\Resources\\PlanResource',
    'Alamia\\Core\\Http\\Resources\\ProductResource': 'Alamia\\Core\\Billing\\Http\\Resources\\ProductResource',
    
    'Alamia\\Core\\Models\\AuditLog': 'Alamia\\Core\\Audit\\Models\\AuditLog',
    'Alamia\\Core\\Http\\Middleware\\LogActivity': 'Alamia\\Core\\Audit\\Http\\Middleware\\LogActivity',
    'Alamia\\Core\\Http\\Resources\\AuditLogResource': 'Alamia\\Core\\Audit\\Http\\Resources\\AuditLogResource',
    
    'Alamia\\Core\\Models\\Traits\\HasExternalId': 'Alamia\\Core\\Shared\\Traits\\HasExternalId',
    'Alamia\\Core\\Controllers\\API\\BaseController': 'Alamia\\Core\\Shared\\Http\\Controllers\\BaseController',
    'Alamia\\Core\\Http\\Middleware\\ValidateJsonApi': 'Alamia\\Core\\Shared\\Http\\Middleware\\ValidateJsonApi',
}

# 1. Update the `namespace` declaration in each file based on its new path
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.php'):
            filepath = os.path.join(root, file)
            # e.g. src/Tenant/Models/Tenant.php
            rel_path = os.path.relpath(filepath, base_path)
            # Tenant/Models/Tenant.php
            parts = rel_path.split(os.sep)
            if len(parts) > 1:
                # namespace is Alamia\Core\ + parts[0:-1]
                namespace_parts = ['Alamia', 'Core'] + parts[:-1]
                expected_namespace = '\\'.join(namespace_parts)
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Escape backslashes for the replacement string
                escaped_expected_namespace = expected_namespace.replace('\\', '\\\\')
                # Replace namespace declaration
                new_content = re.sub(r'namespace\s+Alamia\\Core\\[^;]+;', f'namespace {escaped_expected_namespace};', content)
                new_content = re.sub(r'namespace\s+Alamia\\Core;', f'namespace {escaped_expected_namespace};', new_content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated namespace for {rel_path} to {expected_namespace}")

# 2. Update `use` statements everywhere
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.php'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old_class, new_class in class_map.items():
                # Replace exact fully qualified imports
                new_content = new_content.replace(f"use {old_class};", f"use {new_class};")
                # Handle cases inside docblocks or direct references if any (optional)
                new_content = new_content.replace(f"\\{old_class}::", f"\\{new_class}::")
                new_content = new_content.replace(f"\\{old_class}\\bar", f"\\{new_class}\\bar")
                
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated imports in {filepath}")

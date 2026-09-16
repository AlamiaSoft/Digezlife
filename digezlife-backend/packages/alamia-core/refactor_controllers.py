import os
import shutil

base_path = 'src'
# mappings format: source_file_or_dir -> dest_file_or_dir
mappings = {
    'Controllers/API/V1/Auth': 'Identity/Http/Controllers',
    'Controllers/API/V1/Central/ProfileController.php': 'Administration/Http/Controllers/ProfileController.php',
    'Controllers/API/V1/Central/TenantSelectionController.php': 'Tenant/Http/Controllers/TenantSelectionController.php',
    'Controllers/API/V1/SuperAdmin': 'Administration/Http/Controllers/SuperAdmin',
    'Controllers/API/V1/System': 'Kernel/Http/Controllers/System',
    'Controllers/API/V1/Tenant': 'Tenant/Http/Controllers/API',
    'Routes/api.php': 'Kernel/Routes/api.php',
    'Routes/super-admin.php': 'Administration/Routes/super-admin.php',
    'Routes/tenant.php': 'Tenant/Routes/tenant.php',
}

def move_file(src, dest):
    src_full = os.path.join(base_path, src)
    dest_full = os.path.join(base_path, dest)
    if not os.path.exists(src_full):
        print(f"Skipping {src}, not found.")
        return
        
    os.makedirs(os.path.dirname(dest_full), exist_ok=True)
    if os.path.isdir(src_full):
        # copy contents
        for item in os.listdir(src_full):
            s = os.path.join(src_full, item)
            d = os.path.join(dest_full, item)
            if not os.path.exists(d):
                shutil.move(s, d)
    else:
        shutil.move(src_full, dest_full)
    print(f"Moved {src} to {dest}")

for src, dest in mappings.items():
    move_file(src, dest)

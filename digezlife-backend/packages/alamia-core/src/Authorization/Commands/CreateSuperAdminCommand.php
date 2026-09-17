<?php

namespace Alamia\Core\Authorization\Commands;

use Alamia\Core\Authorization\Models\SuperAdmin;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateSuperAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'tenant-engine:create-super-admin
                            {--name= : The name of the super admin}
                            {--email= : The email of the super admin}
                            {--password= : The password of the super admin}
                            {--force : Force create or update credentials if user already exists}';

    /**
     * The console command description.
     */
    protected $description = 'Create or update a super admin user';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Creating/Updating Super Admin...');
        $this->newLine();

        $name = $this->option('name') ?? $this->ask('Name');
        $email = $this->option('email') ?? $this->ask('Email');
        $password = $this->option('password') ?? $this->secret('Password');
        $force = (bool) $this->option('force');

        // Validate input
        $emailRule = $force ? 'required|email' : 'required|email|unique:super_admins,email';

        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ], [
            'name' => 'required|string|max:255',
            'email' => $emailRule,
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            $this->error('Validation failed:');
            foreach ($validator->errors()->all() as $error) {
                $this->line('  - '.$error);
            }

            return self::FAILURE;
        }

        // Create or update super admin
        try {
            $admin = SuperAdmin::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make($password),
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

            // Also synchronize with primary User model if present
            if (class_exists(\App\Models\User::class)) {
                \App\Models\User::updateOrCreate(
                    ['email' => $email],
                    [
                        'name' => $name,
                        'password' => Hash::make($password),
                        'email_verified_at' => now(),
                    ]
                );
            }

            $this->newLine();
            $this->info('✅ Super Admin configured successfully!');
            $this->newLine();

            $this->table(
                ['Field', 'Value'],
                [
                    ['ID', $admin->external_id ?? $admin->id],
                    ['Name', $admin->name],
                    ['Email', $admin->email],
                    ['Status', $admin->status],
                ]
            );

            $this->newLine();
            $this->info('You can now login with these credentials.');

            return self::SUCCESS;
        } catch (Exception $e) {
            $this->error('Failed to create/update super admin: '.$e->getMessage());

            return self::FAILURE;
        }
    }
}

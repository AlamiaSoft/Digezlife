<?php

namespace Alamia\Core\Kernel\Commands;

use Illuminate\Console\Command;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\password;
use function Laravel\Prompts\select;
use function Laravel\Prompts\spin;
use function Laravel\Prompts\text;

class InstallCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:install
                            {--force : Overwrite existing files}
                            {--non-interactive : Run installer without interactive prompts}';

    /**
     * The console command description.
     */
    protected $description = 'Initialize and configure the Alamia SaaS Platform Starter';

    /**
     * Aliases for backwards compatibility.
     */
    protected $aliases = ['alamia:init', 'tenant-engine:install'];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        intro('🚀 Alamia SaaS Platform Starter Onboarding Wizard');

        $isNonInteractive = $this->option('non-interactive');

        // Step 1: Environment Check
        note('1. System Environment Check');
        $this->performEnvironmentChecks();

        // Step 2: Tenancy Setup
        note('2. Tenancy Architecture Configuration');
        $tenancyMode = $isNonInteractive ? 'single' : select(
            label: 'Which database tenancy model do you want to use?',
            options: [
                'single' => 'Single Database (Shared Connection - Cost Effective / Fast)',
                'dedicated' => 'Multi Database (Isolated DB per Tenant - Maximum Security & Isolation)',
            ],
            default: 'single'
        );

        // Step 3: Database & Migrations
        note('3. Publishing Platform Config & Running Migrations');
        spin(function () {
            $this->publishConfiguration();
            $this->publishMigrations();
            $this->callSilent('migrate', ['--force' => true]);
        }, 'Publishing configuration and running database migrations...');

        // Step 4: Super Admin Creation
        note('4. Super Admin Provisioning');
        if (! $isNonInteractive && confirm('Would you like to create a Super Admin account now?', true)) {
            $name = text('Super Admin Name', required: true, default: 'Super Admin');
            $email = text('Super Admin Email', required: true, default: 'admin@alamia.io');
            $pass = password('Super Admin Password', required: true);

            spin(function () use ($name, $email, $pass) {
                \Alamia\Core\Authorization\Models\SuperAdmin::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => bcrypt($pass),
                    'status' => 'active',
                ]);
            }, 'Creating Super Admin user...');

            note("Super Admin [{$email}] created successfully!");
        }

        outro('✅ Alamia SaaS Platform Starter initialized successfully!');

        $this->displayNextSteps();

        return self::SUCCESS;
    }

    /**
     * Perform system environment checks.
     */
    protected function performEnvironmentChecks(): void
    {
        $phpVersion = PHP_VERSION;
        if (version_compare($phpVersion, '8.2.0', '<')) {
            $this->error("PHP version 8.2+ required, current: {$phpVersion}");
        }

        note("PHP Version: {$phpVersion} ✔");
    }

    /**
     * Publish configuration files.
     */
    protected function publishConfiguration(): void
    {
        $params = [
            '--provider' => 'Alamia\Core\Kernel\Providers\AlamiaCoreServiceProvider',
            '--tag' => 'tenant-engine-config',
        ];

        if ($this->option('force')) {
            $params['--force'] = true;
        }

        $this->callSilent('vendor:publish', $params);
    }

    /**
     * Publish migration files.
     */
    protected function publishMigrations(): void
    {
        $this->callSilent('vendor:publish', [
            '--provider' => 'Alamia\Core\Kernel\Providers\AlamiaCoreServiceProvider',
            '--tag' => 'tenant-engine-migrations-central',
            '--force' => $this->option('force'),
        ]);

        $this->callSilent('vendor:publish', [
            '--provider' => 'Alamia\Core\Kernel\Providers\AlamiaCoreServiceProvider',
            '--tag' => 'tenant-engine-migrations-tenant',
            '--force' => $this->option('force'),
        ]);
    }

    /**
     * Display next steps.
     */
    protected function displayNextSteps(): void
    {
        $this->line('Next Steps:');
        $this->line('  • Create a business module: php artisan alamia:make-module CRM');
        $this->line('  • Create a tenant:           php artisan alamia:tenant:create');
        $this->line('  • Run system health check:   php artisan alamia:doctor');
    }
}

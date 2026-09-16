<?php

namespace Alamia\Core\Administration\Commands;

use Alamia\Core\Shared\DTOs\TenantProvisioningData;
use Alamia\Core\Shared\ValueObjects\PlainPassword;
use Alamia\Core\Tenant\Services\TenantProvisioningService;
use Illuminate\Console\Command;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\password;
use function Laravel\Prompts\spin;
use function Laravel\Prompts\text;

class MakeTenantCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:tenant:create
                            {--name= : The tenant name}
                            {--email= : Admin email}
                            {--domain= : Domain or slug}
                            {--password= : Admin password}';

    /**
     * The console command description.
     */
    protected $description = 'Create and provision a new SaaS Tenant using TenantProvisioningService';

    /**
     * Execute the console command.
     */
    public function handle(TenantProvisioningService $provisioningService): int
    {
        intro('🏢 Creating New SaaS Tenant');

        $name = $this->option('name') ?? text('Tenant Organization Name', required: true, default: 'Acme Corp');
        $email = $this->option('email') ?? text('Tenant Admin Email', required: true, default: 'admin@acme.com');
        $domain = $this->option('domain') ?? text('Tenant Subdomain/Domain', required: true, default: 'acme');
        $rawPass = $this->option('password') ?? password('Tenant Admin Password', required: true);

        $dto = new TenantProvisioningData(
            subdomain: $domain,
            tenantName: $name,
            adminEmail: $email,
            adminPassword: new PlainPassword($rawPass),
            plan: 'free'
        );

        $tenant = null;

        spin(function () use ($provisioningService, $dto, &$tenant) {
            $tenant = $provisioningService->provision($dto);
        }, "Provisioning tenant [{$name}] and executing onboarding steps...");

        outro("✅ Tenant [{$tenant->name}] (ID: {$tenant->id}) provisioned successfully!");

        note('Tenant details:');
        $this->line("  • ID:     {$tenant->id}");
        $this->line("  • Domain: {$domain}");
        $this->line("  • Admin:  {$email}");

        return self::SUCCESS;
    }
}

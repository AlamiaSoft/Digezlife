<?php

namespace Alamia\Core\Kernel\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\select;
use function Laravel\Prompts\table;

class MarketplaceCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:market
                            {action? : Action to perform (list, install)}
                            {module? : Target module key}';

    /**
     * The console command description.
     */
    protected $description = 'Explore and install official Alamia SaaS Starter Business Modules';

    /**
     * Official Module Catalog
     */
    protected array $catalog = [
        'CRM' => [
            'name' => 'CRM',
            'category' => 'Sales & Support',
            'version' => '1.0.0',
            'description' => 'Customer Relationship Management, Contacts, Deals, and Pipelines',
            'requires' => ['Billing', 'Identity'],
        ],
        'Booking' => [
            'name' => 'Booking',
            'category' => 'Scheduling & Appointments',
            'version' => '1.0.0',
            'description' => 'Appointment Scheduling, Resource Allocation, and Calendar Sync',
            'requires' => ['Tenant', 'Billing'],
        ],
        'AgencyOS' => [
            'name' => 'AgencyOS',
            'category' => 'Agency Management',
            'version' => '1.0.0',
            'description' => 'Client Portals, Invoicing, Project Tracking, and File Sharing',
            'requires' => ['Billing', 'Identity', 'Tenant'],
        ],
        'OTT' => [
            'name' => 'OTT',
            'category' => 'Media & Streaming',
            'version' => '1.0.0',
            'description' => 'Video Streaming, Media Assets, Subscriptions, and Content Delivery',
            'requires' => ['Billing', 'Media'],
        ],
        'HR' => [
            'name' => 'HR',
            'category' => 'Human Resources',
            'version' => '1.0.0',
            'description' => 'Employee Directory, Leave Management, Payroll, and Onboarding',
            'requires' => ['Identity', 'Authorization'],
        ],
    ];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        intro('🛒 Alamia Official Business Module Marketplace');

        $action = $this->argument('action') ?: select(
            label: 'What would you like to do?',
            options: [
                'list' => 'Browse Available Module Catalog',
                'install' => 'Scaffold / Install a Catalog Module',
            ],
            default: 'list'
        );

        if ($action === 'list') {
            $rows = [];
            foreach ($this->catalog as $key => $item) {
                $rows[] = [$item['name'], $item['category'], "v{$item['version']}", $item['description']];
            }
            table(['Module', 'Category', 'Version', 'Description'], $rows);
            outro('Explore modules above. To install one, run: php artisan alamia:market install <Module>');

            return self::SUCCESS;
        }

        if ($action === 'install') {
            $target = $this->argument('module') ?: select(
                label: 'Select a module to install from the catalog',
                options: array_combine(array_keys($this->catalog), array_keys($this->catalog))
            );

            if (! isset($this->catalog[$target])) {
                $this->error("Module [{$target}] is not available in the official catalog.");

                return self::FAILURE;
            }

            note("Installing [{$target}] Module...");
            Artisan::call('alamia:make-module', ['name' => $target]);
            $this->line(Artisan::output());

            outro("✅ Module [{$target}] installed into modules/{$target}!");
        }

        return self::SUCCESS;
    }
}

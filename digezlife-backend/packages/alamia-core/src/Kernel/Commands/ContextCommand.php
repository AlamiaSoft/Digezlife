<?php

namespace Alamia\Core\Kernel\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;

class ContextCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:context
                            {--file= : Optional path to output context file}';

    /**
     * The console command description.
     */
    protected $description = 'Generate concise architectural context package for AI coding assistants (Claude, Gemini, Codex)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        intro('🤖 Generating Alamia AI Context Package');

        $version = \Alamia\Core\Kernel\Alamia::version();
        $modules = File::isDirectory(base_path('modules')) ? File::directories(base_path('modules')) : [];
        $moduleList = array_map('basename', $modules);

        $context = <<<MARKDOWN
# Alamia SaaS Platform Starter - AI Context Package

## Platform Metadata
- **Kernel Version**: v{$version}
- **Framework**: Laravel 13 / Octane (FrankenPHP) / PHP 8.3
- **Tenancy Package**: stancl/tenancy
- **Module Engine**: nwidart/laravel-modules + Alamia Module SDK

## 5-Layer Repository Architecture
1. **Starter Kit (Product)**: Cloned root repository.
2. **Applications (`apps/`)**: Runtime host entrypoints (admin, tenant, api).
3. **Business Modules (`modules/`)**: Self-contained DDD business capabilities (`CRM`, `Booking`, etc.).
4. **Platform Kernel (`packages/alamia-core/`)**: Core domains (`Tenant`, `Identity`, `Authorization`, `Billing`, `Audit`, `Notifications`, `Settings`, `Feature Flags`, `Journeys`).
5. **Reference Apps (`examples/`)**: Integration tests and educational reference implementations.

## Strict Architectural Rules for AI Agents
- **Public API Boundary**: Business Modules MUST depend **only** on `Alamia\Core\*` Contracts and Facades. NEVER import concrete internal kernel classes across domain boundaries.
- **DDD Standard**: 24-folder strict structure (`Actions`, `Contracts`, `DTOs`, `Events`, `Http`, `Models`, `Services`, `Policies`, `Providers`, `Tests`).
- **Tenancy Rule**: Always bind `TenantDatabaseProvisioner` via container contracts. Do not bypass `TenantProvisioningService`.
- **Quality Gates**: PHPStan clean, Deptrac 0 violations, Pest green (SQLite & PostgreSQL).

## Active Installed Business Modules
MARKDOWN;

        if (empty($moduleList)) {
            $context .= "\n- *No business modules currently installed in `modules/`.*\n";
        } else {
            foreach ($moduleList as $mod) {
                $context .= "\n- **{$mod}**: `modules/{$mod}/`";
            }
            $context .= "\n";
        }

        $outputPath = $this->option('file') ?: base_path('.ai/context-snapshot.md');
        File::ensureDirectoryExists(dirname($outputPath));
        File::put($outputPath, $context);

        outro("✅ AI Context Package exported to [{$outputPath}]");

        note('Tip: Pass this snapshot to AI coding assistants for instant context alignment!');

        return self::SUCCESS;
    }
}

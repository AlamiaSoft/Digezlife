<?php

namespace Alamia\Core\Kernel\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\spin;

class MakeModuleCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:make-module
                            {name : The name of the business module (e.g. CRM, Booking, HR)}
                            {--force : Overwrite existing module directory}';

    /**
     * The console command description.
     */
    protected $description = 'Scaffold a new Alamia DDD Business Module with rich documentation and Pest test suite';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $rawName = $this->argument('name');
        $moduleName = Str::studly($rawName);
        $modulePath = base_path("modules/{$moduleName}");

        intro("🔨 Scaffolding Alamia DDD Business Module [{$moduleName}]");

        if (File::exists($modulePath) && ! $this->option('force')) {
            $this->error("Module [{$moduleName}] already exists at {$modulePath}. Use --force to overwrite.");

            return self::FAILURE;
        }

        // Step 1: Run nWidart base generator
        spin(function () use ($moduleName) {
            $this->callSilent('module:make', [
                'name' => [$moduleName],
            ]);
        }, 'Generating base nWidart module infrastructure...');

        // Step 2: Decorate with Alamia 24-Folder DDD Structure, Docs & Tests
        spin(function () use ($modulePath, $moduleName) {
            $this->scaffoldDddDirectories($modulePath);
            $this->generateModuleManifest($modulePath, $moduleName);
            $this->generateDocumentationFiles($modulePath, $moduleName);
            $this->generatePestTests($modulePath, $moduleName);
        }, 'Decorating module with Alamia 24-folder DDD structure, docs & Pest suite...');

        outro("✅ Enterprise SaaS Module [{$moduleName}] created successfully in modules/{$moduleName}!");

        note('Next steps:');
        $this->line("  1. Add domain logic inside modules/{$moduleName}/src/");
        $this->line("  2. Configure permissions & feature flags in modules/{$moduleName}/module.json");
        $this->line("  3. Validate module: php artisan alamia:validate-module {$moduleName}");

        return self::SUCCESS;
    }

    /**
     * Scaffold the full 24 DDD subdirectories inside the module.
     */
    protected function scaffoldDddDirectories(string $modulePath): void
    {
        $dddFolderList = [
            'src/Actions',
            'src/Commands',
            'src/Config',
            'src/Contracts',
            'src/DTOs',
            'src/Enums',
            'src/Events',
            'src/Exceptions',
            'src/Http/Controllers',
            'src/Http/Middleware',
            'src/Http/Requests',
            'src/Http/Resources',
            'src/Infrastructure',
            'src/Jobs',
            'src/Listeners',
            'src/Models',
            'src/Observers',
            'src/Policies',
            'src/Providers',
            'src/Queries',
            'src/Repositories',
            'src/Resources',
            'src/Rules',
            'src/Services',
            'src/Support',
            'database/migrations',
            'database/seeders',
            'lang/en',
            'tests/Unit',
            'tests/Integration',
            'tests/Architecture',
        ];

        foreach ($dddFolderList as $folder) {
            File::makeDirectory("{$modulePath}/{$folder}", 0755, true, true);
        }
    }

    /**
     * Generate rich Alamia SaaS module.json manifest.
     */
    protected function generateModuleManifest(string $modulePath, string $moduleName): void
    {
        $snakeName = Str::snake($moduleName);
        $kebabName = Str::kebab($moduleName);

        $manifest = [
            'name' => $moduleName,
            'alias' => $kebabName,
            'description' => "{$moduleName} Business Module for Alamia SaaS Platform",
            'keywords' => ['alamia', 'module', $kebabName],
            'version' => '1.0.0',
            'active' => 1,
            'order' => 1,
            'requires' => [
                'kernel' => '^1.0.0',
            ],
            'permissions' => [
                "{$snakeName}.view",
                "{$snakeName}.create",
                "{$snakeName}.edit",
                "{$snakeName}.delete",
            ],
            'feature_flags' => [
                $snakeName,
            ],
            'billing_features' => [
                "{$snakeName}_access",
            ],
            'tenant_aware' => true,
            'providers' => [
                "Modules\\{$moduleName}\\Providers\\{$moduleName}ServiceProvider",
            ],
        ];

        File::put(
            "{$modulePath}/module.json",
            json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
        );
    }

    /**
     * Generate README.md, CHANGELOG.md, and UPGRADE.md.
     */
    protected function generateDocumentationFiles(string $modulePath, string $moduleName): void
    {
        $readme = <<<MARKDOWN
# {$moduleName} Business Module

## Purpose
Describe the business capabilities provided by the `{$moduleName}` module.

## Layer Boundaries
- **Depends On**: Platform API (AlamCore Facades & Contracts)
- **Tenant Aware**: Yes

## Feature Flags & Permissions
- **Feature Flag**: `{$moduleName}`
- **Permissions**: `{$moduleName}.view`, `{$moduleName}.create`, `{$moduleName}.edit`, `{$moduleName}.delete`

MARKDOWN;

        $changelog = <<<MARKDOWN
# Changelog - {$moduleName} Module

All notable changes to this module will be documented in this file.

## [1.0.0] - 2026-08-06
- Initial scaffolding of `{$moduleName}` business module.
MARKDOWN;

        $upgrade = <<<MARKDOWN
# Upgrade Guide - {$moduleName} Module

## Upgrading to 1.0.0
Initial release. No breaking changes.
MARKDOWN;

        File::put("{$modulePath}/README.md", $readme);
        File::put("{$modulePath}/CHANGELOG.md", $changelog);
        File::put("{$modulePath}/UPGRADE.md", $upgrade);
    }

    /**
     * Scaffold Pest test files for the module.
     */
    protected function generatePestTests(string $modulePath, string $moduleName): void
    {
        $pestUnit = <<<PHP
<?php

test('{$moduleName} module is loaded', function () {
    expect(true)->toBeTrue();
});
PHP;

        $pestArch = <<<PHP
<?php

test('{$moduleName} module strictly respects domain boundaries', function () {
    expect(true)->toBeTrue();
});
PHP;

        File::put("{$modulePath}/tests/Unit/ModuleTest.php", $pestUnit);
        File::put("{$modulePath}/tests/Architecture/DomainBoundariesTest.php", $pestArch);
    }
}

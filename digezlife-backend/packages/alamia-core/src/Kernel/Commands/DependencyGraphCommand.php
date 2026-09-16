<?php

namespace Alamia\Core\Kernel\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;

class DependencyGraphCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:deps
                            {module? : Specific module to inspect}';

    /**
     * The console command description.
     */
    protected $description = 'Render ASCII dependency graph for business modules and platform kernel domains';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        intro('🌳 Alamia Module & Domain Dependency Graph');

        $modulesDir = base_path('modules');
        if (! File::isDirectory($modulesDir)) {
            $this->error('Directory modules/ does not exist.');

            return self::FAILURE;
        }

        $targetModule = $this->argument('module');
        $moduleFolders = $targetModule
            ? ["{$modulesDir}/{$targetModule}"]
            : File::directories($modulesDir);

        if (empty($moduleFolders)) {
            $this->line('ℹ No modules found in modules/');

            return self::SUCCESS;
        }

        foreach ($moduleFolders as $dir) {
            $modName = basename($dir);
            $manifestPath = "{$dir}/module.json";

            note("Module [{$modName}]");

            if (! File::exists($manifestPath)) {
                $this->warn('  ├── ⚠ Manifest module.json missing');

                continue;
            }

            $manifest = json_decode(File::get($manifestPath), true);
            $version = $manifest['version'] ?? '1.0.0';
            $requires = $manifest['requires'] ?? [];
            $flags = $manifest['feature_flags'] ?? [];
            $permissions = $manifest['permissions'] ?? [];

            $this->line("  ├── Version: v{$version}");
            $this->line('  ├── Requires (Dependencies):');

            if (empty($requires)) {
                $this->line('  │     └── None');
            } else {
                foreach ($requires as $dep => $ver) {
                    $this->line("  │     └── {$dep}: {$ver}");
                }
            }

            $this->line('  ├── Feature Flags:');
            if (empty($flags)) {
                $this->line('  │     └── None');
            } else {
                foreach ($flags as $flag) {
                    $this->line("  │     └── {$flag}");
                }
            }

            $this->line('  └── Permissions count: '.count($permissions));
            $this->newLine();
        }

        outro('✅ Dependency Graph rendered cleanly!');

        return self::SUCCESS;
    }
}

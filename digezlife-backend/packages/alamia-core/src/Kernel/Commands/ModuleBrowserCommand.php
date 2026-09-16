<?php

namespace Alamia\Core\Kernel\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\select;
use function Laravel\Prompts\table;

class ModuleBrowserCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:modules';

    /**
     * The console command description.
     */
    protected $description = 'Interactive browser and manager for installed business modules';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        intro('📦 Alamia Business Module Manager');

        $modulesDir = base_path('modules');
        if (! File::isDirectory($modulesDir)) {
            $this->error('Directory modules/ does not exist.');

            return self::FAILURE;
        }

        $moduleFolders = File::directories($modulesDir);

        if (empty($moduleFolders)) {
            note('No business modules currently installed in modules/.');
            $this->line('  Scaffold one using: php artisan alamia:make-module <Name>');

            return self::SUCCESS;
        }

        $rows = [];
        $options = ['exit' => 'Exit Manager'];

        foreach ($moduleFolders as $dir) {
            $modName = basename($dir);
            $manifestPath = "{$dir}/module.json";

            $version = '1.0.0';
            $status = 'Active';

            if (File::exists($manifestPath)) {
                $manifest = json_decode(File::get($manifestPath), true);
                $version = $manifest['version'] ?? '1.0.0';
                $status = ($manifest['active'] ?? 1) ? 'Active' : 'Disabled';
            }

            $rows[] = [$modName, "v{$version}", $status, $dir];
            $options[$modName] = "Inspect Module: {$modName}";
        }

        table(['Module', 'Version', 'Status', 'Path'], $rows);

        $selected = select(
            label: 'Select an action',
            options: $options
        );

        if ($selected !== 'exit') {
            $manifestPath = "{$modulesDir}/{$selected}/module.json";
            if (File::exists($manifestPath)) {
                $manifest = json_decode(File::get($manifestPath), true);
                note("Module Details: {$selected}");
                $this->line('  • Version:      v'.($manifest['version'] ?? '1.0.0'));
                $this->line('  • Alias:        '.($manifest['alias'] ?? ''));
                $this->line('  • Status:       '.(($manifest['active'] ?? 1) ? 'Active' : 'Disabled'));
                $this->line('  • Tenant Aware: '.(($manifest['tenant_aware'] ?? true) ? 'Yes' : 'No'));
            }
        }

        outro('✅ Module Browser closed.');

        return self::SUCCESS;
    }
}

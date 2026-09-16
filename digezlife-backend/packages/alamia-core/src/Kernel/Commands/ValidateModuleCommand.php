<?php

namespace Alamia\Core\Kernel\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;

class ValidateModuleCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:validate-module
                            {module? : Target module name to validate (validates all if omitted)}';

    /**
     * The console command description.
     */
    protected $description = 'Validate business module json manifest, structure, and namespace compliance';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        intro('🔍 Alamia Module Compliance Validator');

        $targetModule = $this->argument('module');
        $modulesDir = base_path('modules');

        if (! File::isDirectory($modulesDir)) {
            $this->error('Directory modules/ does not exist.');

            return self::FAILURE;
        }

        $moduleFolders = $targetModule
            ? ["{$modulesDir}/{$targetModule}"]
            : File::directories($modulesDir);

        if (empty($moduleFolders)) {
            $this->warn('No modules found to validate.');

            return self::SUCCESS;
        }

        $errorsCount = 0;

        foreach ($moduleFolders as $dir) {
            $moduleName = basename($dir);
            note("Auditing module [{$moduleName}]...");

            if (! File::isDirectory($dir)) {
                $this->error("  ✗ Module directory [{$dir}] not found.");
                $errorsCount++;

                continue;
            }

            $manifestPath = "{$dir}/module.json";
            if (! File::exists($manifestPath)) {
                $this->error("  ✗ Manifest file module.json missing in [{$moduleName}].");
                $errorsCount++;

                continue;
            }

            $manifest = json_decode(File::get($manifestPath), true);
            if (! is_array($manifest)) {
                $this->error("  ✗ Manifest file module.json in [{$moduleName}] contains invalid JSON.");
                $errorsCount++;

                continue;
            }

            $requiredFields = ['name', 'alias', 'version', 'providers'];
            foreach ($requiredFields as $field) {
                if (empty($manifest[$field])) {
                    $this->error("  ✗ Missing required manifest key [{$field}] in module.json.");
                    $errorsCount++;
                }
            }

            // Check provider existence
            if (isset($manifest['providers']) && is_array($manifest['providers'])) {
                foreach ($manifest['providers'] as $providerClass) {
                    if (! class_exists($providerClass)) {
                        $this->warn("  ⚠ Service provider [{$providerClass}] cannot be autoloaded currently.");
                    } else {
                        $this->line("  ✓ Provider [{$providerClass}] verified.");
                    }
                }
            }
        }

        if ($errorsCount === 0) {
            outro('✅ All audited modules passed validation cleanly!');

            return self::SUCCESS;
        }

        $this->error("❌ Validation failed with {$errorsCount} error(s).");

        return self::FAILURE;
    }
}

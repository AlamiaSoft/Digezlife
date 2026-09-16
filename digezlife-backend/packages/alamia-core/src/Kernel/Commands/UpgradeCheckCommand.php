<?php

namespace Alamia\Core\Kernel\Commands;

use Alamia\Core\Kernel\Alamia;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;

class UpgradeCheckCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:upgrade:check';

    /**
     * The console command description.
     */
    protected $description = 'Analyze installed business modules for compatibility with current Platform Kernel version';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        intro('🔍 Alamia Platform Kernel Upgrade Impact Analyzer');

        $currentKernelVersion = Alamia::version();
        note("Current Platform Kernel Version: v{$currentKernelVersion}");

        $modulesDir = base_path('modules');
        if (! File::isDirectory($modulesDir)) {
            $this->line('ℹ No modules directory found.');

            return self::SUCCESS;
        }

        $moduleFolders = File::directories($modulesDir);
        if (empty($moduleFolders)) {
            $this->line('ℹ No business modules installed in modules/');

            return self::SUCCESS;
        }

        $incompatibilities = 0;

        foreach ($moduleFolders as $dir) {
            $modName = basename($dir);
            $manifestPath = "{$dir}/module.json";

            if (! File::exists($manifestPath)) {
                $this->warn("  ⚠ Module [{$modName}] missing manifest module.json");

                continue;
            }

            $manifest = json_decode(File::get($manifestPath), true);
            $requiredKernel = $manifest['requires']['kernel'] ?? '*';

            $this->line("Checking module [{$modName}] (Requires Kernel: {$requiredKernel})...");

            // Validate compatibility constraint
            if ($requiredKernel !== '*' && ! $this->isVersionCompatible($currentKernelVersion, $requiredKernel)) {
                $this->error("  ✗ INCOMPATIBLE: Module [{$modName}] requires Kernel {$requiredKernel}, but current is v{$currentKernelVersion}");
                $incompatibilities++;
            } else {
                $this->line("  ✓ COMPATIBLE: Module [{$modName}] matches Kernel v{$currentKernelVersion}");
            }
        }

        if ($incompatibilities === 0) {
            outro('✅ All installed business modules are 100% compatible with the current Kernel!');

            return self::SUCCESS;
        }

        $this->error("❌ Impact analysis found {$incompatibilities} module compatibility error(s).");

        return self::FAILURE;
    }

    protected function isVersionCompatible(string $currentVersion, string $constraint): string|bool
    {
        // Simple SemVer constraint checker (e.g. ^1.0.0, 1.0.0, *)
        $cleanConstraint = ltrim($constraint, '^~=v');

        return version_compare($currentVersion, $cleanConstraint, '>=');
    }
}

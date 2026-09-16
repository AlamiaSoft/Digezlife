<?php

namespace Alamia\Core\Kernel\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Throwable;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\spin;

class DoctorCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:doctor
                            {--fix : Automatically attempt to fix detected environment issues}';

    /**
     * The console command description.
     */
    protected $description = 'Run system health diagnostics and auto-repair for the Alamia SaaS Platform Starter';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        intro('🩺 Alamia System Doctor & Health Diagnostic');

        $isFix = $this->option('fix');
        $issuesFound = 0;

        // Check 1: PHP & Extension Status
        note('1. PHP & Extension Status');
        $requiredExtensions = ['pdo', 'mbstring', 'openssl', 'tokenizer', 'json'];
        foreach ($requiredExtensions as $ext) {
            if (extension_loaded($ext)) {
                $this->line("  ✓ Extension [{$ext}] is loaded");
            } else {
                $this->error("  ✗ Extension [{$ext}] is MISSING");
                $issuesFound++;
            }
        }

        // Check 2: Database Connection & Auto-Fix
        note('2. Central Database Connectivity');
        try {
            DB::connection()->getPdo();
            $driver = DB::connection()->getDriverName();
            $this->line("  ✓ Database connected successfully (Driver: {$driver})");
        } catch (Throwable $e) {
            $this->error("  ✗ Database connection failed: {$e->getMessage()}");
            $issuesFound++;

            if ($isFix && config('database.default') === 'sqlite') {
                $dbPath = config('database.connections.sqlite.database');
                if ($dbPath && ! File::exists($dbPath)) {
                    spin(function () use ($dbPath) {
                        File::ensureDirectoryExists(dirname($dbPath));
                        File::put($dbPath, '');
                    }, "Creating missing SQLite database file at {$dbPath}...");
                    $this->info('  🔧 FIXED: SQLite database file created.');
                    $issuesFound--;
                }
            }
        }

        // Check 3: Application Key
        note('3. Application Key Verification');
        if (empty(config('app.key'))) {
            $this->error('  ✗ APP_KEY is empty or missing');
            $issuesFound++;

            if ($isFix) {
                spin(function () {
                    Artisan::call('key:generate', ['--force' => true]);
                }, 'Generating application key...');
                $this->info('  🔧 FIXED: Application key generated.');
                $issuesFound--;
            }
        } else {
            $this->line('  ✓ APP_KEY is configured');
        }

        // Check 4: Directory Permissions
        note('4. Directory Write Permissions');
        $writablePaths = [storage_path(), base_path('bootstrap/cache')];
        foreach ($writablePaths as $path) {
            if (File::isWritable($path)) {
                $this->line("  ✓ Path [{$path}] is writable");
            } else {
                $this->error("  ✗ Path [{$path}] is NOT writable");
                $issuesFound++;

                if ($isFix) {
                    @chmod($path, 0775);
                    clearstatcache(true, $path);
                    // @phpstan-ignore-next-line -- chmod mutates file permissions on disk at runtime
                    if (File::isWritable($path)) {
                        $this->info("  🔧 FIXED: Permissions updated for [{$path}].");
                        $issuesFound--;
                    }
                }
            }
        }

        // Check 5: Storage Symlink
        note('5. Storage Symlink Verification');
        $publicStoragePath = public_path('storage');
        if (File::exists($publicStoragePath)) {
            $this->line('  ✓ Public storage symlink exists');
        } else {
            $this->warn('  ⚠ Public storage symlink missing');
            if ($isFix) {
                spin(function () {
                    Artisan::call('storage:link');
                }, 'Creating public storage symlink...');
                $this->info('  🔧 FIXED: Storage symlink created.');
            }
        }

        // Check 6: Installed Modules Manifest Verification
        note('6. Installed Business Modules Audit');
        $modulesPath = base_path('modules');
        if (File::isDirectory($modulesPath)) {
            $modules = File::directories($modulesPath);
            if (count($modules) === 0) {
                $this->line('  ℹ No modules installed in modules/');
            } else {
                foreach ($modules as $dir) {
                    $modName = basename($dir);
                    $manifestPath = "{$dir}/module.json";
                    if (File::exists($manifestPath)) {
                        $manifest = json_decode(File::get($manifestPath), true);
                        if (is_array($manifest) && isset($manifest['name'])) {
                            $this->line("  ✓ Module [{$modName}] manifest valid (Version: ".($manifest['version'] ?? '1.0.0').')');
                        } else {
                            $this->error("  ✗ Module [{$modName}] manifest module.json is INVALID");
                            $issuesFound++;
                        }
                    } else {
                        $this->warn("  ⚠ Module [{$modName}] is missing module.json manifest");
                    }
                }
            }
        }

        if ($issuesFound === 0) {
            outro('✅ System is 100% HEALTHY! No issues detected.');

            return self::SUCCESS;
        }

        $this->error("❌ Health check completed with {$issuesFound} issue(s) detected.");
        if (! $isFix) {
            $this->line('  Tip: Run "php artisan alamia:doctor --fix" to automatically repair detected issues.');
        }

        return self::FAILURE;
    }
}

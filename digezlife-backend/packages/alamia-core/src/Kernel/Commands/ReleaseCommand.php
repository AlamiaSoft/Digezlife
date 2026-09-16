<?php

namespace Alamia\Core\Kernel\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\spin;

class ReleaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:release
                            {version : Target release version (e.g. 1.1.0 or v1.1.0)}
                            {--skip-tests : Skip running automated quality gates}';

    /**
     * The console command description.
     */
    protected $description = 'Run pre-flight checks, bump platform version, and prepare a release';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $rawVersion = ltrim($this->argument('version'), 'v');
        intro("🚀 Preparing Alamia SaaS Platform Release v{$rawVersion}");

        // Step 1: Pre-flight Quality Gates
        if (! $this->option('skip-tests')) {
            note('1. Executing Automated Quality Gates (Pest & Deptrac)');

            $pestResult = spin(fn () => Process::run(base_path('vendor/bin/pest')), 'Running Pest test suite...');

            if ($pestResult->failed()) {
                $this->error('  ✗ Pest test suite FAILED. Aborting release.');
                $this->line($pestResult->output());

                return self::FAILURE;
            }
            $this->line('  ✓ Pest tests PASSED');

            $deptracResult = spin(fn () => Process::run(base_path('vendor/bin/deptrac')), 'Running Deptrac boundary checks...');

            if ($deptracResult->failed()) {
                $this->error('  ✗ Deptrac boundary checks FAILED. Aborting release.');

                return self::FAILURE;
            }
            $this->line('  ✓ Deptrac architecture boundaries PASSED (0 violations)');
        }

        // Step 2: Version Bumping
        note("2. Bumping Platform Kernel Version to v{$rawVersion}");
        $versionFile = base_path('packages/alamia-core/src/Kernel/Version.php');
        if (File::exists($versionFile)) {
            $versionContent = <<<PHP
<?php

namespace Alamia\Core\Kernel;

class Version
{
    public const VERSION = '{$rawVersion}';

    public static function version(): string
    {
        return self::VERSION;
    }
}
PHP;
            File::put($versionFile, $versionContent);
            $this->line("  ✓ Updated Kernel Version.php to {$rawVersion}");
        }

        // Step 3: CHANGELOG.md update
        note('3. Appending Release to CHANGELOG.md');
        $changelogPath = base_path('CHANGELOG.md');
        $date = date('Y-m-d');
        $entry = "\n## [{$rawVersion}] - {$date}\n- Pre-flight release build v{$rawVersion}.\n";

        if (File::exists($changelogPath)) {
            File::append($changelogPath, $entry);
        } else {
            File::put($changelogPath, "# Changelog\n".$entry);
        }
        $this->line("  ✓ Appended release v{$rawVersion} to CHANGELOG.md");

        outro("✅ Release v{$rawVersion} prepared successfully!");

        note('Next steps:');
        $this->line('  1. Review changes: git diff');
        $this->line("  2. Tag release:   git tag -a v{$rawVersion} -m \"Release v{$rawVersion}\"");

        return self::SUCCESS;
    }
}

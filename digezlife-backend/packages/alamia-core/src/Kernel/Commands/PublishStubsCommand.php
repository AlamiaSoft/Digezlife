<?php

namespace Alamia\Core\Kernel\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\spin;

class PublishStubsCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:stubs:publish
                            {--force : Overwrite existing published stubs}';

    /**
     * The console command description.
     */
    protected $description = 'Publish Alamia 24-folder DDD stub templates for customization';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        intro('📄 Publishing Alamia DDD Stub Templates');

        $targetDir = base_path('stubs/alamia-stubs');

        if (File::exists($targetDir) && ! $this->option('force')) {
            $this->error('Stubs directory [stubs/alamia-stubs] already exists. Use --force to overwrite.');

            return self::FAILURE;
        }

        spin(function () use ($targetDir) {
            File::ensureDirectoryExists($targetDir);
            $this->generateDefaultStubs($targetDir);
        }, 'Copying template stubs to stubs/alamia-stubs/...');

        outro('✅ Alamia DDD stubs published successfully to [stubs/alamia-stubs]!');

        note('Customization tip:');
        $this->line('  Modify files in stubs/alamia-stubs/ to customize class scaffolding for your team.');

        return self::SUCCESS;
    }

    protected function generateDefaultStubs(string $targetDir): void
    {
        $serviceStub = <<<'PHP'
<?php

namespace {{namespace}};

class {{class}}
{
    public function __construct()
    {
        // Business service initialization
    }
}
PHP;

        $dtoStub = <<<'PHP'
<?php

namespace {{namespace}};

final class {{class}}
{
    public function __construct(
        // Public readonly properties
    ) {}
}
PHP;

        $contractStub = <<<'PHP'
<?php

namespace {{namespace}};

interface {{class}}
{
    // Define contract signatures
}
PHP;

        $actionStub = <<<'PHP'
<?php

namespace {{namespace}};

class {{class}}
{
    public function handle()
    {
        // Execute atomic business action
    }
}
PHP;

        File::put("{$targetDir}/service.stub", $serviceStub);
        File::put("{$targetDir}/dto.stub", $dtoStub);
        File::put("{$targetDir}/contract.stub", $contractStub);
        File::put("{$targetDir}/action.stub", $actionStub);
    }
}

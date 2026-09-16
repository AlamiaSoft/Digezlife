<?php

namespace Alamia\Core\Kernel\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

use function Laravel\Prompts\intro;
use function Laravel\Prompts\outro;

class MakeDomainArtifactCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'alamia:make-artifact
                            {type : Artifact type (service, dto, contract, action)}
                            {module : Target Module or Domain name}
                            {name : Name of the class to generate}';

    /**
     * The console command description.
     */
    protected $description = 'Scaffold a DDD artifact (Service, DTO, Contract, Action) within a module or domain';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $type = mb_strtolower($this->argument('type'));
        $module = Str::studly($this->argument('module'));
        $name = Str::studly($this->argument('name'));

        intro("🔨 Generating DDD Artifact [{$type}] for [{$module}] -> {$name}");

        $folderMap = [
            'service' => ['dir' => 'Services', 'suffix' => 'Service', 'isInterface' => false],
            'dto' => ['dir' => 'DTOs', 'suffix' => 'Data', 'isInterface' => false],
            'contract' => ['dir' => 'Contracts', 'suffix' => 'Interface', 'isInterface' => true],
            'action' => ['dir' => 'Actions', 'suffix' => 'Action', 'isInterface' => false],
        ];

        if (! isset($folderMap[$type])) {
            $this->error("Invalid artifact type [{$type}]. Supported types: service, dto, contract, action.");

            return self::FAILURE;
        }

        $config = $folderMap[$type];
        $className = Str::endsWith($name, $config['suffix']) ? $name : $name.$config['suffix'];

        // Determine target path (Module vs Kernel Domain)
        $moduleBasePath = base_path("modules/{$module}");
        if (File::isDirectory($moduleBasePath)) {
            $targetDir = "{$moduleBasePath}/src/{$config['dir']}";
            $namespace = "Modules\\{$module}\\{$config['dir']}";
        } else {
            $targetDir = base_path("packages/alamia-core/src/{$module}/{$config['dir']}");
            $namespace = "Alamia\\Core\\{$module}\\{$config['dir']}";
        }

        File::makeDirectory($targetDir, 0755, true, true);
        $filePath = "{$targetDir}/{$className}.php";

        if (File::exists($filePath)) {
            $this->error("File [{$filePath}] already exists.");

            return self::FAILURE;
        }

        $content = $config['isInterface']
            ? $this->generateInterfaceContent($namespace, $className)
            : $this->generateClassContent($namespace, $className, $type);

        File::put($filePath, $content);

        outro("✅ Created {$className} at {$filePath}");

        return self::SUCCESS;
    }

    protected function generateClassContent(string $namespace, string $className, string $type): string
    {
        return <<<PHP
<?php

namespace {$namespace};

class {$className}
{
    public function __construct()
    {
        // ...
    }
}

PHP;
    }

    protected function generateInterfaceContent(string $namespace, string $className): string
    {
        return <<<PHP
<?php

namespace {$namespace};

interface {$className}
{
    // Define contract signatures
}

PHP;
    }
}

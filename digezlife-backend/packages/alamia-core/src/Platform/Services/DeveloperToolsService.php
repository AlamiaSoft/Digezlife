<?php

namespace Alamia\Core\Platform\Services;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class DeveloperToolsService
{
    /**
     * Call the Doctor command and parse its output.
     */
    public function runDoctor(): array
    {
        Artisan::call('alamia:doctor');
        $output = Artisan::output();
        
        $healthy = !str_contains($output, '✗') && !str_contains($output, '❌');
        
        // Count number of checks (lines with ✓ or ✗)
        $checks = substr_count($output, '✓') + substr_count($output, '✗');
        $issues = substr_count($output, '✗');
        
        $result = [
            'healthy' => $healthy,
            'checks' => $checks,
            'issues' => $issues,
            'output' => $output,
            'timestamp' => now()->toIso8601String(),
        ];
        
        Cache::put('alamia:platform:doctor', $result, now()->addMinutes(5));
        
        return $result;
    }

    /**
     * Get cached doctor results, or run if not cached.
     */
    public function getDoctorCached(): array
    {
        return Cache::remember('alamia:platform:doctor', now()->addMinutes(5), function () {
            return $this->runDoctor();
        });
    }

    /**
     * Force a refresh of the doctor results.
     */
    public function refreshDoctor(): array
    {
        Cache::forget('alamia:platform:doctor');
        return $this->runDoctor();
    }

    /**
     * Validate one or all modules.
     */
    public function validateModule(?string $name = null): array
    {
        $args = [];
        if ($name) {
            $args['module'] = $name;
        }

        $exitCode = Artisan::call('alamia:validate-module', $args);
        $output = Artisan::output();
        
        return [
            'success' => $exitCode === 0,
            'output' => $output,
        ];
    }

    /**
     * Create a new business module.
     */
    public function createModule(array $params): array
    {
        // $params should contain at least 'name'
        if (empty($params['name'])) {
            throw new \InvalidArgumentException("Module name is required.");
        }

        $args = ['name' => $params['name']];

        $exitCode = Artisan::call('alamia:make-module', $args);
        
        // We'll run optimize:clear just in case
        $this->clearCaches();

        return [
            'success' => $exitCode === 0,
            'output' => Artisan::output(),
        ];
    }

    /**
     * Clear application caches safely.
     */
    public function clearCaches(): void
    {
        Artisan::call('optimize:clear');
    }
}

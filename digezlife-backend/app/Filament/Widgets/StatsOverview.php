<?php

namespace App\Filament\Widgets;

use Alamia\Core\Tenant\Models\Tenant;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\File;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        $tenantCount = class_exists(Tenant::class) ? Tenant::count() : 0;
        $userCount = class_exists(User::class) ? User::count() : 0;

        $modulesCount = 0;
        $modulesDir = base_path('modules');
        if (File::isDirectory($modulesDir)) {
            $modulesCount = count(File::directories($modulesDir));
        }

        return [
            Stat::make('Total SaaS Tenants', (string) $tenantCount)
                ->description('Active provisioned tenant accounts')
                ->descriptionIcon('heroicon-m-building-office-2')
                ->color('success'),
            Stat::make('Platform Users', (string) $userCount)
                ->description('Registered central & tenant users')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),
            Stat::make('Business Modules', (string) $modulesCount)
                ->description('Active DDD business modules')
                ->descriptionIcon('heroicon-m-cube')
                ->color('warning'),
        ];
    }
}

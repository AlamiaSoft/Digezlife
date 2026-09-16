<?php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\Filament\AdminPanelProvider::class,
    App\Providers\Filament\TenantPanelProvider::class,
    Modules\Grocery\Providers\GroceryServiceProvider::class,
    Modules\Hisab\Providers\HisabServiceProvider::class,
    Modules\Reminders\Providers\RemindersServiceProvider::class,
];

<?php

namespace Modules\HelloModule\src\Providers;

use Illuminate\Support\ServiceProvider;

class HelloModuleServiceProvider extends ServiceProvider
{
    public function boot()
    {
        $this->loadRoutesFrom(__DIR__.'/../../routes/web.php');
    }
}

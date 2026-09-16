<?php

namespace Alamia\Core\Kernel\Experience\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @method static \Alamia\Core\Kernel\Experience\Registries\NavigationRegistry navigation()
 * @method static \Alamia\Core\Kernel\Experience\Registries\WidgetRegistry widgets()
 * @method static \Alamia\Core\Kernel\Experience\Registries\LayoutRegistry layouts()
 * @method static \Alamia\Core\Kernel\Experience\Registries\SettingsRegistry settings()
 * @method static \Alamia\Core\Kernel\Experience\Registries\PageRegistry pages()
 * @method static \Alamia\Core\Kernel\Experience\Registries\ResourceRegistry resources()
 * @method static \Alamia\Core\Kernel\Experience\Registries\CommandRegistry commands()
 * @method static \Alamia\Core\Kernel\Experience\Registries\SearchRegistry search()
 *
 * @see \Alamia\Core\Kernel\Experience\ExperienceEngine
 */
class Experience extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'experience';
    }
}

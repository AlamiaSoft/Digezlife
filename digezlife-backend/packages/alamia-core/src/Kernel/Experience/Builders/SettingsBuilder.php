<?php

namespace Alamia\Core\Kernel\Experience\Builders;

use Alamia\Core\Kernel\Experience\DTOs\SettingSection;
use Alamia\Core\Kernel\Experience\Registries\SettingsRegistry;

class SettingsBuilder
{
    protected SettingsRegistry $registry;
    protected string $scope;

    public function __construct(SettingsRegistry $registry, string $scope)
    {
        $this->registry = $registry;
        $this->scope = $scope;
    }

    public function add(SettingSection $section): static
    {
        $this->registry->registerInScope($this->scope, $section);
        return $this;
    }

    public function create(string $id, string $title): SettingSection
    {
        $section = SettingSection::make($id, $title);
        $this->add($section);
        return $section;
    }
}

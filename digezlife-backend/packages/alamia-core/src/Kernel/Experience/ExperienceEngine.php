<?php

namespace Alamia\Core\Kernel\Experience;

use Alamia\Core\Kernel\Experience\Contracts\PlatformContribution;
use Alamia\Core\Kernel\Experience\Registries\NavigationRegistry;
use Alamia\Core\Kernel\Experience\Registries\WidgetRegistry;
use Alamia\Core\Kernel\Experience\Registries\LayoutRegistry;
use Alamia\Core\Kernel\Experience\Registries\SettingsRegistry;
use Alamia\Core\Kernel\Experience\Registries\PageRegistry;
use Alamia\Core\Kernel\Experience\Registries\ResourceRegistry;
use Alamia\Core\Kernel\Experience\Registries\CommandRegistry;
use Alamia\Core\Kernel\Experience\Registries\SearchRegistry;

class ExperienceEngine
{
    protected NavigationRegistry $navigation;
    protected WidgetRegistry $widgets;
    protected LayoutRegistry $layouts;
    protected SettingsRegistry $settings;
    protected PageRegistry $pages;
    protected ResourceRegistry $resources;
    protected CommandRegistry $commands;
    protected SearchRegistry $search;

    protected array $contributionClasses = [];
    protected bool $resolved = false;

    public function __construct(
        NavigationRegistry $navigation,
        WidgetRegistry $widgets,
        LayoutRegistry $layouts,
        SettingsRegistry $settings,
        PageRegistry $pages,
        ResourceRegistry $resources,
        CommandRegistry $commands,
        SearchRegistry $search
    ) {
        $this->navigation = $navigation;
        $this->widgets = $widgets;
        $this->layouts = $layouts;
        $this->settings = $settings;
        $this->pages = $pages;
        $this->resources = $resources;
        $this->commands = $commands;
        $this->search = $search;
    }

    public function registerContribution(string $class): void
    {
        $this->contributionClasses[] = $class;
    }

    public function resolveContributions(): void
    {
        if ($this->resolved) {
            return;
        }

        $this->resolved = true;

        foreach ($this->contributionClasses as $class) {
            /** @var PlatformContribution $contribution */
            $contribution = app($class);

            $contribution->navigation();
            $contribution->widgets();
            $contribution->settings();
            $contribution->pages();
            $contribution->resources();
            $contribution->commands();
            $contribution->search();
            $contribution->layouts();
        }
    }

    public function navigation(): NavigationRegistry
    {
        $this->resolveContributions();
        return $this->navigation;
    }

    public function widgets(): WidgetRegistry
    {
        $this->resolveContributions();
        return $this->widgets;
    }

    public function layouts(): LayoutRegistry
    {
        $this->resolveContributions();
        return $this->layouts;
    }

    public function settings(): SettingsRegistry
    {
        $this->resolveContributions();
        return $this->settings;
    }

    public function pages(): PageRegistry
    {
        $this->resolveContributions();
        return $this->pages;
    }

    public function resources(): ResourceRegistry
    {
        $this->resolveContributions();
        return $this->resources;
    }

    public function commands(): CommandRegistry
    {
        $this->resolveContributions();
        return $this->commands;
    }

    public function search(): SearchRegistry
    {
        $this->resolveContributions();
        return $this->search;
    }
}

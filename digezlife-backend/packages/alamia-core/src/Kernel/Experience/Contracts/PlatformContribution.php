<?php

namespace Alamia\Core\Kernel\Experience\Contracts;

abstract class PlatformContribution
{
    public function navigation(): void {}

    public function widgets(): void {}

    public function settings(): void {}

    public function pages(): void {}

    public function resources(): void {}

    public function commands(): void {}

    public function search(): void {}

    public function layouts(): void {}
}

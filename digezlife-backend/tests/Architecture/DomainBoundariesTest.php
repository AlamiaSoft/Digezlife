<?php

test('globals')
    ->expect(['dd', 'dump', 'ray', 'die', 'var_dump', 'sleep'])
    ->not->toBeUsed();

test('billing domain cannot access tenant infrastructure')
    ->expect('Alamia\Core\Billing')
    ->not->toUse('Alamia\Core\Tenant\Providers')
    ->not->toUse('Alamia\Core\Tenant\Http')
    ->not->toUse('Alamia\Core\Tenant\Console');

test('identity domain cannot access billing')
    ->expect('Alamia\Core\Identity')
    ->not->toUse('Alamia\Core\Billing');

test('core domains should not depend on each other directly without contracts')
    ->expect('Alamia\Core\Billing')
    ->not->toUse('Alamia\Core\Identity')
    ->not->toUse('Alamia\Core\Tenant')
    ->and('Alamia\Core\Identity')
    ->not->toUse('Alamia\Core\Billing')
    ->not->toUse('Alamia\Core\Tenant')
    ->and('Alamia\Core\Tenant')
    ->not->toUse('Alamia\Core\Billing')
    ->not->toUse('Alamia\Core\Identity');

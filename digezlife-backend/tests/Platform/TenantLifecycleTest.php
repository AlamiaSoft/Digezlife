<?php

use Alamia\Core\Tenant\Models\Tenant;

test('tenant full lifecycle (create, activate, suspend, reactivate, archive, delete)', function () {
    $tenantId = 'acme_'.uniqid();

    // 1. Create (Initialize)
    $tenant = Tenant::create([
        'id' => $tenantId,
        'name' => 'Acme Corp',
        'email' => 'admin@acme.com',
        'status' => 'pending', // Initial status
    ]);
    app(Alamia\Core\Tenant\Contracts\TenantDatabaseProvisioner::class)->provision($tenant);

    expect($tenant->id)->toBe($tenantId)
        ->and($tenant->name)->toBe('Acme Corp')
        ->and($tenant->isActive())->toBeFalse();

    // 2. Activate
    $tenant->activate();
    expect($tenant->isActive())->toBeTrue()
        ->and($tenant->status)->toBe('active');

    // 3. Suspend
    $tenant->suspend();
    expect($tenant->isSuspended())->toBeTrue()
        ->and($tenant->isActive())->toBeFalse();

    // 4. Reactivate
    $tenant->activate();
    expect($tenant->isActive())->toBeTrue()
        ->and($tenant->isSuspended())->toBeFalse();

    // 5. Cancel / Archive
    $tenant->cancel();
    expect($tenant->isCancelled())->toBeTrue();

    // 6. Delete
    $tenant->delete();
    // Using soft deletes
    expect(Tenant::find($tenantId))->toBeNull()
        ->and(Tenant::withTrashed()->find($tenantId))->not->toBeNull();
});

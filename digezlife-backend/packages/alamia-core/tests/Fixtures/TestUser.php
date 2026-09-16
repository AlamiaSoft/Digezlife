<?php

namespace Alamia\Core\Tests\Fixtures;

use Alamia\Core\Shared\Traits\HasExternalId;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class TestUser extends Authenticatable
{
    use HasApiTokens, HasExternalId;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
    ];
}

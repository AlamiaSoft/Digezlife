<?php

namespace Alamia\Core\Identity\Traits;

use Alamia\Core\Shared\Traits\HasExternalId;
use Laravel\Sanctum\HasApiTokens;

/**
 * Trait AlamiaUser
 *
 * Provides the necessary traits for a User model to be compatible with Alamia Core.
 * Host applications should add `use AlamiaUser;` to their App\Models\User class.
 */
trait AlamiaUser
{
    use HasApiTokens, HasExternalId;
}

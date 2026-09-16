<?php

namespace Alamia\Core\Tenant\Http\Middleware;

use Stancl\Tenancy\Middleware\InitializeTenancyByPath;

class DebugInitTenancy extends InitializeTenancyByPath
{
    // Uses standard Stancl Path Identity logic
    // Expects path to start with tenant identifier
}

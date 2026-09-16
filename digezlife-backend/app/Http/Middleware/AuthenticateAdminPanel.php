<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Filament\Facades\Filament;
use Filament\Http\Middleware\Authenticate as BaseAuthenticate;
use Filament\Models\Contracts\FilamentUser;
use Illuminate\Database\Eloquent\Model;

class AuthenticateAdminPanel extends BaseAuthenticate
{
    /**
     * @param  array<string>  $guards
     */
    protected function authenticate($request, array $guards): void
    {
        $guard = Filament::auth();

        if (! $guard->check()) {
            $this->unauthenticated($request, $guards);

            return;
        }

        $this->auth->shouldUse(Filament::getAuthGuard());

        /** @var Model $user */
        $user = $guard->user();

        $panel = Filament::getCurrentOrDefaultPanel();

        // Conceal the SaaS admin panel completely for unauthorized users
        // Return 404 Not Found rather than 403 Forbidden to prevent route enumeration
        abort_if(
            $user instanceof FilamentUser ?
                (! $user->canAccessPanel($panel)) :
                true,
            404,
            'Page not found.'
        );
    }
}

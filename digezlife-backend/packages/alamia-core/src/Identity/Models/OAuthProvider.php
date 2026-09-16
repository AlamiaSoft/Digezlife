<?php

namespace Alamia\Core\Identity\Models;

use Alamia\Core\Shared\Traits\HasExternalId;
use App\Models\User;
use DateTimeImmutable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property-read User|null $user
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OAuthProvider active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OAuthProvider byExternalId(string $externalId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OAuthProvider expired()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OAuthProvider newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OAuthProvider newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OAuthProvider provider(string $provider)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OAuthProvider query()
 *
 * @mixin \Eloquent
 */
class OAuthProvider extends Model
{
    use HasExternalId, HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'external_id',
        'user_id',
        'provider',
        'provider_id',
        'provider_token',
        'provider_refresh_token',
        'provider_expires_at',
        'provider_data',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'provider_expires_at' => 'datetime',
        'provider_data' => 'array',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'provider_token',
        'provider_refresh_token',
    ];

    /**
     * Get the external ID prefix.
     */
    protected static function getExternalIdPrefix(): string
    {
        return config('tenant-engine.external_id_prefixes.oauth_providers', 'OAP');
    }

    /**
     * Get the user that owns the OAuth provider.
     */
    public function user()
    {
        return $this->belongsTo(config('tenant-engine.models.user'));
    }

    /**
     * Check if the token is expired.
     */
    public function isTokenExpired(): bool
    {
        if (! $this->provider_expires_at) {
            return false;
        }

        return $this->provider_expires_at->isPast();
    }

    /**
     * Check if the token needs refresh.
     */
    public function needsTokenRefresh(): bool
    {
        if (! $this->provider_expires_at) {
            return false;
        }

        // Refresh if expires within 5 minutes
        return $this->provider_expires_at->subMinutes(5)->isPast();
    }

    /**
     * Update provider token.
     */
    public function updateToken(string $token, ?string $refreshToken = null, ?DateTimeImmutable $expiresAt = null): bool
    {
        return $this->update([
            'provider_token' => $token,
            'provider_refresh_token' => $refreshToken ?? $this->provider_refresh_token,
            'provider_expires_at' => $expiresAt,
        ]);
    }

    /**
     * Scope to specific provider.
     */
    public function scopeProvider($query, string $provider)
    {
        return $query->where('provider', $provider);
    }

    /**
     * Scope to expired tokens.
     */
    public function scopeExpired($query)
    {
        return $query->whereNotNull('provider_expires_at')
            ->where('provider_expires_at', '<', now());
    }

    /**
     * Scope to active tokens.
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('provider_expires_at')
                ->orWhere('provider_expires_at', '>', now());
        });
    }
}

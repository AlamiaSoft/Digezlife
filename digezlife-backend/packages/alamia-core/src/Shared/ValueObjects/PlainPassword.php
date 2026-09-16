<?php

declare(strict_types=1);

namespace Alamia\Core\Shared\ValueObjects;

use SensitiveParameter;
use Stringable;

/**
 * Value Object wrapping a plain-text password.
 *
 * Hashes on construction so the raw value is discarded immediately.
 * Implements __toString and __debugInfo to prevent accidental logging or dumping.
 */
final class PlainPassword implements Stringable
{
    private readonly string $hashed;

    public function __construct(#[SensitiveParameter] string $plain)
    {
        $this->hashed = bcrypt($plain);
    }

    /**
     * Returns the bcrypt-hashed value suitable for storage.
     */
    public function hashed(): string
    {
        return $this->hashed;
    }

    /**
     * Prevents accidental output of the hashed value via echo/string cast.
     */
    public function __toString(): string
    {
        return '[REDACTED]';
    }

    /**
     * Prevents accidental exposure via var_dump() / dump() / dd().
     *
     * @return array<string, string>
     */
    public function __debugInfo(): array
    {
        return ['password' => '[REDACTED]'];
    }
}

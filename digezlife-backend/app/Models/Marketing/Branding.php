<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class Branding extends Model implements HasMedia
{
    use CentralConnection, InteractsWithMedia;

    protected $table = 'branding';

    protected $fillable = [
        'app_name',
        'tagline',
        'primary_color',
        'secondary_color',
        'accent_color',
        'footer_copyright',
        'facebook_url',
        'twitter_url',
        'linkedin_url',
        'instagram_url',
        'youtube_url',
        'github_url',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('logo')->singleFile();
        $this->addMediaCollection('favicon')->singleFile();
    }

    /**
     * Get or create the singleton branding record.
     */
    public static function singleton(): static
    {
        return static::firstOrCreate(['id' => 1], [
            'app_name' => config('app.name', 'Alamia'),
            'tagline'  => 'The SaaS Platform Starter',
        ]);
    }
}

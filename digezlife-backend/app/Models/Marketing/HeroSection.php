<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class HeroSection extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'hero_sections';

    protected $fillable = [
        'headline',
        'sub_headline',
        'primary_cta_text',
        'primary_cta_url',
        'secondary_cta_text',
        'secondary_cta_url',
        'video_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('hero_image')->singleFile();
        $this->addMediaCollection('background_image')->singleFile();
    }

    public static function singleton(): static
    {
        return static::firstOrCreate(['id' => 1], [
            'headline'          => 'Build Your SaaS Faster',
            'sub_headline'      => 'The complete multi-tenant SaaS starter kit for Laravel developers.',
            'primary_cta_text'  => 'Get Started',
            'primary_cta_url'   => '/register',
            'secondary_cta_text' => 'View Demo',
            'secondary_cta_url'  => '#features',
        ]);
    }
}

<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;

class SeoSetting extends Model
{
    protected $fillable = [
        'site_title',
        'meta_description',
        'og_image',
        'twitter_image',
        'analytics_id',
        'google_verification',
        'robots',
        'canonical_url',
    ];

    public static function singleton(): static
    {
        return static::firstOrCreate(['id' => 1], [
            'site_title' => config('app.name', 'Alamia'),
            'robots'     => 'index, follow',
        ]);
    }
}

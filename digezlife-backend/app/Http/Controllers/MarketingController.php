<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Marketing\HeroSection;
use App\Models\Marketing\SiteFeature;
use App\Models\Marketing\MarketingPlan;
use App\Models\Marketing\Testimonial;
use App\Models\Marketing\Faq;

class MarketingController extends Controller
{
    public function home()
    {
        return view('marketing.home', [
            'hero' => HeroSection::singleton(),
            'features' => SiteFeature::active()->take(6)->get(),
            'testimonials' => Testimonial::active()->take(3)->get(),
            'faqs' => Faq::active()->take(4)->get(),
        ]);
    }

    public function features()
    {
        return view('marketing.features', [
            'features' => SiteFeature::active()->get(),
        ]);
    }

    public function pricing()
    {
        return view('marketing.pricing', [
            'plans' => MarketingPlan::with('features')->active()->get(),
            'faqs' => Faq::active()->get(),
        ]);
    }

    public function contact()
    {
        return view('marketing.contact');
    }

    public function privacy()
    {
        return view('marketing.privacy');
    }

    public function terms()
    {
        return view('marketing.terms');
    }
}

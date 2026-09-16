<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Marketing\SiteFeature;
use App\Models\Marketing\MarketingPlan;
use App\Models\Marketing\Testimonial;
use App\Models\Marketing\Faq;
use App\Models\Marketing\NavItem;
use App\Models\Marketing\FooterSection;
use App\Models\Marketing\Branding;
use App\Models\Marketing\HeroSection;
use App\Models\Marketing\SeoSetting;

class MarketingSeeder extends Seeder
{
    public function run(): void
    {
        // Seed singletons
        Branding::singleton();
        HeroSection::singleton();
        SeoSetting::singleton();

        // Seed Site Features
        if (SiteFeature::count() === 0) {
            SiteFeature::create([
                'icon' => '<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
                'title' => 'Lightning Fast',
                'description' => 'Built on Laravel and optimized for speed and efficiency.',
                'sort_order' => 1,
            ]);
            SiteFeature::create([
                'icon' => '<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>',
                'title' => 'Secure by Default',
                'description' => 'Industry-standard security practices integrated at every level.',
                'sort_order' => 2,
            ]);
            SiteFeature::create([
                'icon' => '<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>',
                'title' => 'Multi-Tenant Architecture',
                'description' => 'Scale seamlessly with a built-in multi-tenant database strategy.',
                'sort_order' => 3,
            ]);
        }

        // Seed Marketing Plans
        if (MarketingPlan::count() === 0) {
            $basic = MarketingPlan::create([
                'name' => 'Basic',
                'slug' => 'basic',
                'price' => 19,
                'billing_period' => 'month',
                'description' => 'Perfect for individuals and small teams getting started.',
                'button_text' => 'Start Basic',
                'sort_order' => 1,
            ]);
            $basic->features()->createMany([
                ['feature' => 'Up to 5 Users', 'included' => true, 'sort_order' => 1],
                ['feature' => 'Basic Support', 'included' => true, 'sort_order' => 2],
                ['feature' => 'Analytics Dashboard', 'included' => false, 'sort_order' => 3],
            ]);

            $pro = MarketingPlan::create([
                'name' => 'Pro',
                'slug' => 'pro',
                'price' => 49,
                'billing_period' => 'month',
                'description' => 'For growing businesses that need more power.',
                'button_text' => 'Start Pro',
                'is_popular' => true,
                'sort_order' => 2,
            ]);
            $pro->features()->createMany([
                ['feature' => 'Up to 20 Users', 'included' => true, 'sort_order' => 1],
                ['feature' => 'Priority Support', 'included' => true, 'sort_order' => 2],
                ['feature' => 'Analytics Dashboard', 'included' => true, 'sort_order' => 3],
            ]);
        }

        // Seed Testimonials
        if (Testimonial::count() === 0) {
            Testimonial::create([
                'name' => 'Jane Doe',
                'company' => 'Acme Corp',
                'position' => 'CEO',
                'quote' => 'This starter kit saved us hundreds of hours of development time. Highly recommended!',
                'sort_order' => 1,
            ]);
            Testimonial::create([
                'name' => 'John Smith',
                'company' => 'Tech Solutions',
                'position' => 'CTO',
                'quote' => 'The multi-tenant architecture is brilliant. We launched our SaaS in record time.',
                'sort_order' => 2,
            ]);
        }

        // Seed FAQs
        if (Faq::count() === 0) {
            Faq::create([
                'question' => 'What is Alamia SaaS Platform Starter?',
                'answer' => 'It is a robust Laravel boilerplate designed to help you build and launch multi-tenant SaaS applications quickly.',
                'sort_order' => 1,
            ]);
            Faq::create([
                'question' => 'Can I use this for multiple projects?',
                'answer' => 'Yes, once you have the starter kit, you can use it as the foundation for as many projects as you like.',
                'sort_order' => 2,
            ]);
        }

        // Seed Nav Items
        if (NavItem::count() === 0) {
            NavItem::create(['label' => 'Features', 'url' => '/features', 'location' => 'header', 'sort_order' => 1]);
            NavItem::create(['label' => 'Pricing', 'url' => '/pricing', 'location' => 'header', 'sort_order' => 2]);
            NavItem::create(['label' => 'Contact', 'url' => '/contact', 'location' => 'header', 'sort_order' => 3]);
        }

        // Seed Footer Sections
        if (FooterSection::count() === 0) {
            FooterSection::create([
                'title' => 'Product',
                'links' => [
                    ['label' => 'Features', 'url' => '/features'],
                    ['label' => 'Pricing', 'url' => '/pricing'],
                ],
                'sort_order' => 1,
            ]);
            FooterSection::create([
                'title' => 'Legal',
                'links' => [
                    ['label' => 'Privacy Policy', 'url' => '/privacy'],
                    ['label' => 'Terms of Service', 'url' => '/terms'],
                ],
                'sort_order' => 2,
            ]);
        }
    }
}

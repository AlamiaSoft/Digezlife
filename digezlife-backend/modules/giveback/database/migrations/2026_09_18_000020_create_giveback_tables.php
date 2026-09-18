<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Revenue Records
        Schema::create('revenue_records', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->string('external_id')->unique()->nullable();
            $table->string('source'); // subscription, partner, affiliate, referral, sponsorship, merchant, other
            $table->string('source_reference')->nullable();
            $table->bigInteger('gross_amount_minor');
            $table->bigInteger('net_amount_minor');
            $table->string('currency', 3)->default('PKR');
            $table->timestamp('occurred_at');
            $table->string('status')->default('recorded'); // recorded, qualified, excluded
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // 2. Giveback Pools
        Schema::create('giveback_pools', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->string('external_id')->unique()->nullable();
            $table->timestamp('period_start');
            $table->timestamp('period_end');
            $table->bigInteger('eligible_revenue_minor');
            $table->integer('percentage_bp')->default(2000); // 20.00%
            $table->bigInteger('pool_amount_minor');
            $table->string('currency', 3)->default('PKR');
            $table->json('allocation_config')->nullable();
            $table->string('status')->default('active'); // active, distributed, closed
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 3. Rewards
        Schema::create('rewards', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->string('external_id')->unique()->nullable();
            $table->string('tenant_id')->index(); // household_id
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // member_id
            $table->string('type'); // cashback, referral, subscription_credit, points, partner_reward
            $table->string('source_type')->nullable();
            $table->string('source_id')->nullable();
            $table->foreignId('allocation_id')->nullable()->constrained('giveback_pools')->nullOnDelete();
            $table->bigInteger('amount_minor')->nullable();
            $table->bigInteger('points')->nullable();
            $table->string('currency', 3)->nullable()->default('PKR');
            $table->string('status')->default('pending'); // pending, available, redeemed, expired, reversed, cancelled
            $table->timestamp('earned_at')->useCurrent();
            $table->timestamp('available_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamp('reversed_at')->nullable();
            $table->string('idempotency_key')->unique();
            $table->string('visibility')->default('household'); // household, member_private
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
        });

        // 4. Reward Ledger Entries (Append-only)
        Schema::create('reward_ledger_entries', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->foreignId('reward_id')->constrained('rewards')->cascadeOnDelete();
            $table->string('tenant_id')->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event_type'); // REWARD_EARNED, REWARD_APPROVED, REWARD_REVERSED, REWARD_EXPIRED, REWARD_REDEEMED, REWARD_CANCELLED
            $table->bigInteger('amount_minor')->default(0);
            $table->bigInteger('points')->default(0);
            $table->string('currency', 3)->nullable()->default('PKR');
            $table->bigInteger('balance_after_minor')->default(0);
            $table->bigInteger('points_after')->default(0);
            $table->string('source_type')->nullable();
            $table->string('source_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // 5. Cashback Rules
        Schema::create('cashback_rules', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('type')->default('percentage'); // percentage, fixed
            $table->bigInteger('amount_minor')->default(0);
            $table->integer('percentage_bp')->default(0); // basis points
            $table->bigInteger('max_reward_minor')->nullable();
            $table->bigInteger('min_qualifying_minor')->default(0);
            $table->string('subscription_tier')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // 6. Referral Campaigns
        Schema::create('referral_campaigns', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->string('name');
            $table->bigInteger('referrer_reward_minor')->default(0);
            $table->bigInteger('referee_reward_minor')->default(0);
            $table->string('currency', 3)->default('PKR');
            $table->string('qualifying_event')->default('signup'); // signup, first_payment, active_month
            $table->integer('reward_delay_days')->default(0);
            $table->integer('max_referrals_per_user')->default(10);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 7. Referral Attributions
        Schema::create('referral_attributions', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->foreignId('campaign_id')->nullable()->constrained('referral_campaigns')->nullOnDelete();
            $table->foreignId('referrer_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('referee_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('qualified'); // qualified, rewarded, reversed
            $table->timestamp('qualified_at')->useCurrent();
            $table->timestamp('reward_issued_at')->nullable();
            $table->string('idempotency_key')->unique();
            $table->timestamps();
        });

        // 8. Legal Acceptances
        Schema::create('legal_acceptances', function (Blueprint $table): void {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('terms_version')->default('v1.0');
            $table->string('privacy_version')->default('v1.0');
            $table->timestamp('accepted_at')->useCurrent();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
        });

        // 9. Users Table Additions
        Schema::table('users', function (Blueprint $table): void {
            if (!Schema::hasColumn('users', 'referral_code')) {
                $table->string('referral_code')->nullable()->unique();
            }
            if (!Schema::hasColumn('users', 'referred_by_user_id')) {
                $table->foreignId('referred_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign(['referred_by_user_id']);
            $table->dropColumn(['referral_code', 'referred_by_user_id']);
        });

        Schema::dropIfExists('legal_acceptances');
        Schema::dropIfExists('referral_attributions');
        Schema::dropIfExists('referral_campaigns');
        Schema::dropIfExists('cashback_rules');
        Schema::dropIfExists('reward_ledger_entries');
        Schema::dropIfExists('rewards');
        Schema::dropIfExists('giveback_pools');
        Schema::dropIfExists('revenue_records');
    }
};

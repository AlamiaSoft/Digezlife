# Backend Session Handoff

**Date**: 2026-09-18
**Scope**: Family Members (Capability Permissions), Giveback & Rewards Module, Legal Acceptances & Referral Automation

### Key Backend Decisions & Implementations:
1. **Family Members / Ghar**:
   - Upgraded `tenant_user` with profile fields (`name`, `phone`, `display_name`, `avatar_url`, `last_activity_at`).
   - Extended `tenant_invitations` with `phone`, `name`, `capabilities`, `status`.
   - Created `household_permissions` table for fine-grained capability checks (`tenant_id`, `user_id`, `capability`, `enabled`).
   - Implemented `MemberActivityLog` for append-only audit trail.
   - Implemented `HouseholdPermissionService` and `CheckHouseholdCapability` middleware (`household_capability` alias).
   - Added household endpoints: `/api/v1/household/my-capabilities`, `/api/v1/household/activity`, `/api/v1/household/members/{userId}/role`, `/api/v1/household/members/{userId}/capabilities`.
2. **Giveback & Rewards Domain (`modules/giveback`)**:
   - Pluggable module with `RevenueRecord`, `GivebackPool`, `Reward`, `RewardLedgerEntry`, `CashbackRule`, `ReferralCampaign`, `ReferralAttribution`, `LegalAcceptance`.
   - Integer minor units enforced for all monetary values (PKR default, multi-currency schema supported).
   - Immutable append-only `reward_ledger_entries` tracking balance changes and event logs.
   - Core services: `RewardService`, `RewardLedgerService`, `ReferralRewardService`.
   - API endpoints: `/api/v1/rewards/summary`, `/api/v1/rewards`, `/api/v1/rewards/history`, `/api/v1/rewards/redeem`, `/api/v1/referrals/code`.
3. **Legal Compliance & Referral Automation**:
   - `AuthController.php` registration auto-logs versioned legal consent in `legal_acceptances` table.
   - Referral codes automatically attributed and rewarded upon new user registration via `?ref=` parameter.
4. **Database & Autoloading**:
   - All migrations executed cleanly (`2026_09_18_000010` through `2026_09_18_000020`).
   - Composer autoload and provider registered for `Modules\Giveback`.

### Target for Next Session:
- Phase 6 Household Reports & Budget Recommendations (PDF/WhatsApp export, spending breakdown).
- PakPay payment gateway integration (JazzCash, Easypaisa, Safepay) connected to giveback pools.

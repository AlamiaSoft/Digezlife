# Gharly — Revenue, Giveback & Rewards

## 1. Purpose

Build a revenue-funded rewards system that allows Gharly to share a configurable portion of platform revenue with eligible households/users.

The system must support:

* Subscription revenue
* Partner/merchant/affiliate revenue
* Referral revenue
* Sponsored offers
* Gharly-funded cashback
* Subscription credits
* Referral rewards
* Points/engagement rewards
* Reward redemption
* Reward expiry/reversal
* Complete reward ledger and audit trail

**Important product boundary:**

Gharly rewards are funded from Gharly's own revenue or partner-funded campaigns.

The system must NOT represent user balances as deposits, investments, interest, profit-sharing, guaranteed returns, or money held by Gharly on behalf of users.

Do not build a financial wallet/custody system as part of this feature.

---

# 2. Core Concepts

## Revenue

Money earned by Gharly from:

```text
subscription
partner
affiliate
referral
sponsorship
merchant
other
```

Revenue records should contain:

* source
* source_reference
* gross_amount
* Gharly_net_amount
* currency
* occurred_at
* status
* metadata

---

## Giveback Pool

A configurable portion of eligible revenue allocated to user rewards.

Example:

```text
Monthly eligible revenue = $100,000
Giveback percentage = 20%

Giveback pool = $20,000
```

The percentage must be configurable by administrator.

Do not hard-code 20%.

---

# 3. Reward Types

Create a common `Reward` abstraction with explicit types:

```text
cashback
referral
subscription_credit
points
partner_reward
```

Each reward must have:

```text
id
household_id
member_id nullable
type
source
amount nullable
points nullable
currency nullable
status
earned_at
available_at
expires_at nullable
redeemed_at nullable
reversed_at nullable
metadata
```

Recommended statuses:

```text
pending
available
redeemed
expired
reversed
cancelled
```

---

# 4. Cashback

Cashback is a Gharly-funded reward.

Example:

```text
Eligible purchase/revenue event
        ↓
Cashback rule
        ↓
Cashback earned
        ↓
Pending
        ↓
Approved
        ↓
Available
        ↓
Redeemed
```

Cashback rules must support:

* fixed amount
* percentage
* maximum reward
* minimum qualifying amount
* campaign
* merchant/partner
* subscription tier
* date range
* household eligibility

Example:

```text
Partner commission = $10
Cashback allocation = 30%
User cashback = $3
```

Never calculate cashback using floating-point arithmetic.

Use integer minor units.

---

# 5. Giveback Pool Allocation

Create an allocation engine:

```text
Revenue
  ↓
Eligible revenue
  ↓
Giveback percentage
  ↓
Giveback pool
  ↓
Reward allocation
```

Example configuration:

```text
Giveback percentage: 20%

Cashback:             55%
Referral rewards:     18%
Subscription credits: 15%
Engagement rewards:   12%
```

The percentages must total 100%.

Administrators must be able to change allocation rules without changing application code.

Every allocation must be auditable.

---

# 6. Revenue Attribution

Rewards must be traceable back to their economic source.

Example:

```text
Revenue #REV-10231
      ↓
Giveback allocation #GB-991
      ↓
Cashback reward #RW-5512
      ↓
Household #H-102
```

Never create unexplained reward balances.

Every monetary reward must have:

```text
source_type
source_id
allocation_id
calculation_rule
```

---

# 7. Redemption

Create a redemption workflow.

```text
Available Reward
      ↓
Redemption Request
      ↓
Eligibility Check
      ↓
Approval/Automatic Processing
      ↓
Redeemed
```

Initially support:

```text
subscription credit
Gharly service credit
partner voucher
```

Do NOT assume direct cash withdrawal is available.

If direct monetary payouts are introduced later, implement them as a separate regulated/payment-integration feature after legal and payment-provider review.

---

# 8. Referral Rewards

Support referral campaigns.

Example:

```text
User A refers User B
        ↓
User B becomes eligible/paid subscriber
        ↓
Referral validated
        ↓
User A receives reward
```

Prevent abuse through:

* unique referral codes
* one attribution per signup
* minimum qualifying event
* reward delay
* duplicate-account detection
* self-referral detection
* suspicious activity flags
* reversal capability

Referral rewards must remain pending until the qualifying event is confirmed.

---

# 9. Subscription Credits

Users may receive credits instead of monetary cashback.

Examples:

```text
$5 monthly subscription credit
1 free month
premium feature credit
campaign bonus
```

Credits must have:

* value
* currency
* expiry
* source
* status
* redemption history

Credits cannot automatically be converted into cash.

---

# 10. Points

Points are engagement rewards.

Possible sources:

```text
complete household challenge
maintain expense tracking streak
complete monthly budget
invite household member
complete savings goal
```

Points are NOT money.

The UI must clearly distinguish:

```text
Cashback: monetary reward
Credit: subscription/service value
Points: engagement score
```

Do not display points as currency.

---

# 11. Reward Ledger

Implement an append-oriented reward ledger.

Example entries:

```text
REWARD_EARNED
REWARD_APPROVED
REWARD_REVERSED
REWARD_EXPIRED
REWARD_REDEEMED
REWARD_CANCELLED
```

Each entry should include:

```text
id
reward_id
household_id
member_id
event_type
amount
currency
balance_after
source_type
source_id
created_at
metadata
```

Balances should be derived/reconciled from ledger events rather than silently overwritten.

---

# 12. Household Visibility

Rewards follow existing household privacy rules.

Support:

```text
household-visible
member-private
```

For example:

* Household cashback → visible to household according to permissions.
* Personal referral reward → member-private by default.
* Subscription credit → household/account level.

Do not expose personal rewards to other household members without permission.

Reuse the existing Family Members / Roles & Permissions implementation rather than rebuilding it.

---

# 13. Admin Configuration

Admin must be able to configure:

* giveback percentage
* reward categories
* cashback rules
* referral campaigns
* subscription credits
* points rules
* reward expiry
* minimum redemption amount
* campaign start/end dates
* eligible subscription tiers
* partner campaigns
* maximum reward per household/member
* fraud/abuse thresholds

Configuration changes must be audited.

---

# 14. User UI

Create a **Rewards** section.

Dashboard:

```text
Rewards
────────────────────
Cashback       $12.50
Credits         $5.00
Points           840

Available       $17.50

Recent activity
+ $2.40 Cashback
+ 100 Points
+ $5 Credit
- $5 Credit Redeemed
```

Also show:

```text
How Gharly rewards you
```

Explain that rewards come from:

* subscriptions
* partners
* referrals
* campaigns
* Gharly-funded giveback

Avoid language suggesting guaranteed earnings.

---

# 15. Reward History

Users should be able to filter:

```text
All
Cashback
Referral
Credits
Points
Redeemed
Expired
```

Each reward should show:

```text
date
amount/points
source
status
expiry
```

---

# 16. Giveback Transparency

Provide a simple transparency view.

Example:

```text
This month

Gharly eligible revenue       $100,000
Allocated to rewards            $20,000
Your household rewards           $8.50
```

Do not expose confidential company revenue details to users unless intentionally configured.

Instead, optionally show:

```text
Gharly currently allocates 20%
of eligible revenue to rewards.
```

---

# 17. Anti-Abuse

Rewards are economically sensitive.

Implement:

* idempotency keys
* duplicate reward prevention
* referral fraud detection
* account/household velocity limits
* reward caps
* campaign limits
* suspicious activity flags
* manual admin reversal
* automatic expiry
* immutable audit events

Never allow clients to submit their own reward amount.

All reward amounts must be calculated server-side.

---

# 18. Accounting Boundary

The reward subsystem must NOT modify the user's normal Hisaab transactions automatically unless the user explicitly chooses to record a redeemed reward as income/credit.

Keep separate:

```text
Household Financial Ledger
        ≠
Gharly Rewards Ledger
```

Example:

```text
Gharly Reward: +$5 cashback
```

does not automatically become:

```text
Household Income: +$5
```

unless redemption/recording rules explicitly require it.

---

# 19. APIs / Services

Suggested services:

```text
RevenueService
GivebackPoolService
RewardService
CashbackService
ReferralRewardService
SubscriptionCreditService
PointsService
RewardRedemptionService
RewardLedgerService
RewardEligibilityService
RewardFraudService
```

Suggested APIs:

```text
GET  /rewards
GET  /rewards/summary
GET  /rewards/history

POST /rewards/redeem

GET  /rewards/cashback
GET  /rewards/credits
GET  /rewards/points

GET  /admin/revenue
GET  /admin/giveback
GET  /admin/rewards
POST /admin/reward-rules
POST /admin/campaigns
```

Use policies/permissions for every admin endpoint.

---

# 20. Domain Events

Implement events such as:

```text
RevenueRecorded
RevenueQualified
GivebackPoolCreated
RewardEarned
RewardApproved
RewardReversed
RewardExpired
RewardRedeemed
ReferralQualified
SubscriptionCreditIssued
PointsAwarded
RewardCampaignStarted
RewardCampaignEnded
```

Events must be idempotent.

---

# 21. Notifications

Notify users when appropriate:

```text
Cashback earned
Cashback available
Reward expiring
Referral qualified
Referral reward issued
Subscription credit issued
Reward redeemed
Reward reversed
```

Respect existing Gharly notification preferences and quiet hours.

---

# 22. Financial Precision

All monetary calculations must use:

```text
integer minor units
```

Example:

```text
$12.50 → 1250
PKR 1,250 → 125000
```

Never use floating-point arithmetic for money.

Every reward must retain its currency.

Do not mix currencies in a single calculation.

---

# 23. Multi-Currency

Rewards should have explicit currency.

Example:

```text
PKR cashback
USD subscription credit
```

Do not perform implicit currency conversion.

If cross-currency rewards are introduced later, use a separately recorded exchange-rate snapshot.

---

# 24. Testing Requirements

Minimum tests:

### Calculation

* percentage cashback
* fixed cashback
* caps
* minimum qualifying amount
* currency precision
* rounding
* zero/negative values

### Giveback

* revenue qualification
* percentage allocation
* allocation totals
* campaign overrides
* duplicate revenue events

### Rewards

* pending → available
* available → redeemed
* expiry
* reversal
* cancellation

### Referral

* valid referral
* duplicate referral
* self-referral
* unqualified referral
* reversed qualification

### Security

* cross-household access
* member-private reward access
* unauthorized redemption
* unauthorized admin configuration

### Reliability

* duplicate event delivery
* retry
* concurrent redemption
* idempotency
* ledger reconciliation

---

# 25. Admin Reporting

Admin dashboard should show:

```text
Total revenue
Eligible revenue
Giveback pool
Rewards issued
Rewards redeemed
Rewards outstanding
Rewards expired
Rewards reversed
Reward cost / revenue %
```

Also show:

```text
Revenue per active household
Reward cost per active household
Net revenue per household
Subscription conversion
Referral revenue
Partner revenue
```

These become key unit-economics metrics for Gharly.

---

# 26. Definition of Done

The feature is complete only when:

* Revenue attribution works.
* Giveback pools are calculated correctly.
* Reward rules are configurable.
* Cashback works.
* Referral rewards work.
* Subscription credits work.
* Points work.
* Reward ledger is auditable.
* Redemption works for supported reward types.
* Rewards cannot cross household boundaries.
* Financial calculations use integer minor units.
* Duplicate events cannot create duplicate rewards.
* Rewards can be reversed/expired.
* Admin reporting exists.
* User reward dashboard exists.
* Notifications work.
* Privacy controls are respected.
* Audit history exists.
* Tests cover calculations, abuse, concurrency and permissions.

# 27. Implementation Principle

Build this as a **Reward/Giveback domain**, not as an extension of the household Wallet.

The conceptual separation must remain:

```text
Household Money
      ↓
Hisaab / Wallets

Gharly Revenue
      ↓
Giveback Pool
      ↓
Rewards
      ↓
Credits / Cashback / Points
```

This allows Gharly to evolve its monetization model without turning the core household finance system into a payment/custody product.

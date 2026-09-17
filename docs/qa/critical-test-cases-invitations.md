# Critical Test Suite: Household Invitation Lifecycle & Multi-Token Resolution

## 1. Overview & Context
This document specifies critical test cases for the household invitation lifecycle in **GharlyApp** (`gharlyapp.com`).

### Background & Observed Edge Case
When an inviter generates an invitation for a recipient, shares the link via WhatsApp, and later triggers a resend or generates a new invite for the same recipient, the backend database:
1. Deletes/replaces the previous unaccepted invitation record.
2. Generates a fresh token with a new `created_at` timestamp.
3. Renders relative time based on the **latest active token** (e.g. `Invited 14 minutes ago` instead of `30 minutes ago` if regenerated 14 minutes ago).

---

## 2. Critical Test Scenarios to Verify

### Test Case TC-INV-01: Multiple Invitation Generation & Invalidation of Stale Tokens
- **Objective**: Verify behavior when an inviter sends an invite, then generates a second invite for the same recipient.
- **Preconditions**: User A is the owner of Household A.
- **Steps**:
  1. User A generates an invite for `spouse@example.com` (Token 1 created at T=0).
  2. User A sends WhatsApp message with Token 1 link.
  3. At T=15 minutes, User A taps "Generate / Resend Invite" for `spouse@example.com` (Token 2 created at T=15).
  4. User B attempts to join using **Token 1 (Stale/Invalidated Token)**.
  5. User B attempts to join using **Token 2 (Active Token)**.
- **Expected Results**:
  - Token 1 returns HTTP 404 / 422: *"Invalid or expired invitation code."* with a friendly error prompt.
  - Token 2 successfully joins User B to Household A.
  - User A's Household screen shows the relative timestamp reflecting Token 2's creation (`Invited X minutes ago`).

---

### Test Case TC-INV-02: Auto-Join on New User Registration
- **Objective**: Verify that opening `/#/join?code=TOKEN` -> `/#/signup?invite=TOKEN` automatically attaches the newly created account to the inviting household.
- **Preconditions**: Fresh unauthenticated browser session.
- **Steps**:
  1. Open active invite link: `https://gharlyapp.alamiaconnect.com/#/join?code=VALID_TOKEN`.
  2. Tap "Sign Up & Join".
  3. Fill in registration form and submit.
- **Expected Results**:
  - Account is created.
  - API `POST /api/v1/household/join` is automatically called with `VALID_TOKEN`.
  - User is immediately switched to the inviter's household (`tenant_user` record created with `status: active`).
  - Invitation is marked `accepted_at: now()`.
  - Inviter's `#/household` screen updates `Active Members (+1)` and removes the pending invitation.

---

### Test Case TC-INV-03: Auto-Join on Existing User Login
- **Objective**: Verify that an existing user opening an invite link and logging in is linked to the inviting household.
- **Steps**:
  1. Open active invite link `https://gharlyapp.alamiaconnect.com/#/join?code=VALID_TOKEN`.
  2. Tap "Log In & Join".
  3. Enter existing credentials.
- **Expected Results**:
  - User is authenticated.
  - Invitation is accepted, session switches to the new household.
  - Success toast displayed.

---

### Test Case TC-INV-04: 1-Tap Join for Already Authenticated Session
- **Objective**: Verify that if a user is already logged in and taps the WhatsApp invite link, clicking "Accept & Join Household" immediately links them without re-authenticating.
- **Steps**:
  1. User is already logged in on PWA.
  2. User taps link in WhatsApp -> PWA opens `#/join?code=VALID_TOKEN`.
  3. Displays: *"Joining as: User Name (user@email.com)"*.
  4. User taps "Accept & Join Household".
- **Expected Results**:
  - Household switches immediately to the invited household.
  - Redirects to `#/home`.

---

### Test Case TC-INV-05: Expiration & Revocation Handling
- **Objective**: Verify that invitations older than 7 days or manually cancelled by the owner cannot be accepted.
- **Steps**:
  1. Owner clicks "Cancel Invite" on the Household screen.
  2. Invitee attempts to access the link.
- **Expected Results**:
  - Returns clear explanatory message: *"Invalid or expired invitation code. Please ask the household owner to send a new invite."*

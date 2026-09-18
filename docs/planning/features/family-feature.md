# Family Members / Ghar

## Goal

Allow a household admin to create and manage household members with role-based access and privacy controls.

## Roles

### Admin

* Full household access.
* Manage members, roles and permissions.
* Invite/remove members.
* View all household financial data.
* Cannot be removed by another member unless ownership-transfer flow exists.

### Manager

* Access household features explicitly granted by Admin.
* Default access: Sauda, reminders, bills and household activity.
* Financial visibility can be restricted.

### Viewer

* Read-only access to explicitly shared household areas.
* No member management.
* No financial editing unless explicitly granted.

## Member Profile

Each member should have:

* Name
* Avatar/photo
* Mobile number
* Role
* Active/invited status
* Permissions
* Joined date
* Last activity

## Invitation Flow

1. Admin taps **Invite Member**.
2. Enter name + mobile number.
3. Select role.
4. Select permissions.
5. Generate invitation link/code.
6. Share through WhatsApp/system share.
7. Invitee accepts → account becomes an active household member.
8. Pending invitations can be cancelled/resend.

## Permissions

Permissions should be capability-based rather than hardcoded entirely to roles.

Initial capabilities:

* `view_household`
* `view_family_activity`
* `view_sauda`
* `manage_sauda`
* `view_hisaab`
* `create_expense`
* `edit_own_expense`
* `view_financial_totals`
* `view_bills`
* `manage_bills`
* `view_reminders`
* `manage_reminders`
* `manage_members`
* `manage_permissions`

Admin always has all capabilities.

## Financial Privacy

Support separate visibility from operational access.

Example:

* A member may **manage Sauda** without seeing household income.
* A member may **create an expense** without seeing total household finances.
* Admin can enable **Mask Financial Totals** for selected members.

Do not assume role alone determines financial visibility.

## Member Management

Admin can:

* Edit member profile.
* Change role.
* Change permissions.
* Suspend/remove member.
* Resend/cancel pending invitation.

Removing a member must not delete historical transactions, activities or records created by that member.

## Activity

Record member-related events:

* Member invited
* Invitation accepted
* Role changed
* Permission changed
* Member removed

Activity should include actor, target member, timestamp and event type.

## Data Model

`households`

* id
* name
* owner/admin user reference

`household_members`

* id
* household_id
* user_id nullable for pending invitation
* name
* phone
* role
* status
* joined_at

`household_invitations`

* id
* household_id
* phone
* role
* token
* expires_at
* invited_by
* accepted_at
* status

`household_permissions`

* id
* household_member_id
* capability
* enabled

Use household scoping on every query and authorization check.

## Authorization

Never rely on frontend-hidden UI for security.

Every household resource/action must verify:

1. Authenticated user.
2. Membership in the household.
3. Required capability.
4. Resource belongs to the same household.

## UI

Family screen should provide:

* Household header
* Member list with avatar/name/role
* Pending invitations
* Invite Member action
* Member detail/edit drawer
* Permissions drawer
* Remove/suspend confirmation
* Privacy controls

Keep the UI mobile-first and consistent with the existing Gharly design system.

## MVP Boundary

Implement:
**Members + invitations + roles + capabilities + financial visibility + audit events.**

Do not implement multi-household membership, complex organizational hierarchies or granular per-record sharing in MVP.

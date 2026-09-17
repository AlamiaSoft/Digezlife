# Household & Family Member Invitation Architecture

## 1. Overview & Tenancy Model

In **DigEzLife (GharlyApp)**, data is isolated by **Household (Tenant)**. A household represents a home unit (e.g. *"Khan Family"* or *"House #42"*). 

### Key Architectural Invariant: Separate User Logins Under Shared Tenancy
Family members **never** share account passwords. Every family member creates and authenticates with their own distinct user account (phone number, email, or social login) and receives their own Sanctum authentication token. 

All family members of the same household share the same `tenant_id`, enabling real-time collaboration on:
- 🛒 **Shared Grocery Lists** (synchronized checklist items, real-time item status).
- 💰 **Household Hisab & Cashflow** (shared expenses, udhaar trackers, category totals).
- ⏰ **Bill Reminders & Family Tasks** (utility bills, rent alerts, recurring tasks).

```mermaid
erDiagram
    TENANT ||--o{ TENANT_USER : "has members"
    USER ||--o{ TENANT_USER : "belongs to"
    TENANT ||--o{ GROCERY_ITEM : "scoped to"
    TENANT ||--o{ HISAB_TRANSACTION : "scoped to"
    TENANT ||--o{ REMINDER : "scoped to"
    TENANT ||--o{ HOUSEHOLD_INVITATION : "issues"

    TENANT {
        uuid id PK
        string name "Khan Family"
        string plan_tier "free | family_plus"
        timestamp created_at
    }

    USER {
        uuid id PK
        string name "Fatima Khan"
        string phone "+923001234567"
        string email "fatima@example.com"
        string password_hash
    }

    TENANT_USER {
        uuid tenant_id FK
        uuid user_id FK
        string role "owner | admin | member"
        timestamp joined_at
    }

    HOUSEHOLD_INVITATION {
        uuid id PK
        uuid tenant_id FK
        uuid invited_by FK
        string recipient_contact
        string role "admin | member"
        string token "gharly_inv_..."
        string status "pending | accepted | expired | revoked"
        timestamp expires_at
    }
```

---

## 2. Family Roles & Permissions

| Role | Badge | Permissions |
| :--- | :---: | :--- |
| **Owner / Head** | 👑 Owner | Full access; subscription & billing management; manage all members; delete household. Cannot be removed unless ownership is transferred. |
| **Household Admin** | 🛡️ Admin | Full access to groceries, hisab, and reminders; can invite new members and edit existing members. |
| **Family Member** | 👤 Member | Can view, add, and complete grocery items, log hisab records, and view family reminders. Cannot alter household billing or remove other members. |

---

## 3. Data Attribution & Transparency

To avoid household disputes (*"Who bought the cooking oil?"* or *"Who marked the K-Electric bill paid?"*), all mutating actions record attribution:

- `created_by_user_id`: Identifies which family member created the item/transaction.
- `completed_by_user_id`: Identifies which family member checked off the item or cleared the reminder.
- `updated_at`: Real-time timestamp.

---

## 4. Invitation Lifecycle & Join Flow

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Household Head (Farhan)
    participant PWA as GharlyApp PWA
    participant API as Laravel Backend API
    actor Member as Invited Member (Fatima)

    Owner->>PWA: Clicks "Invite Family Member" (WhatsApp / Link)
    PWA->>API: POST /api/v1/household/invitations { role: 'member', contact: '+923001234567' }
    API-->>PWA: Returns invite token & deep-link: https://gharlyapp.alamiaconnect.com/#/join?code=gharly_inv_xyz
    PWA->>Member: Shares via WhatsApp / SMS with pre-filled message

    Member->>PWA: Clicks link, opens PWA /join screen
    alt If Member already has an account
        Member->>PWA: Logs in with their personal credentials
    else If New User
        Member->>PWA: Quick register (Name, Phone/Email, Password)
    end

    PWA->>API: POST /api/v1/household/invitations/accept { code: 'gharly_inv_xyz' }
    API->>API: Attach User to Tenant in tenant_user (role: 'member')
    API->>API: Invalidate / Mark invitation accepted
    API-->>PWA: Return updated Household session & Sanctum token
    PWA->>Member: Lands on Shared Household Dashboard
    PWA->>Owner: Receives real-time toast / notification: "Fatima Khan joined your household"
```

---

## 5. Capacity & Plan Tier Limits (Laravel Pennant)

| Plan Tier | Max Family Members | Features Included |
| :--- | :---: | :--- |
| **Free Tier** | **Up to 2 Members** | Shared grocery list, basic hisab, utility reminders. |
| **Family Plus (PKR 499/mo or PKR 4,999/yr)** | **Unlimited Members** | Unlimited seats, audio voice notes, bill PDF storage, advanced cashflow export. |

- If the household reaches capacity, the UI prompts the Owner to upgrade to **Family Plus** via JazzCash / Easypaisa / Card.

---

## 6. PWA Screens & Navigation

1. **Household Screen Route**: `#/household` (also aliased to `#/family`).
2. **Access Point**: Accessible from **Settings Screen** -> *"Family & Household Members"*.
3. **UI Elements**:
   - **Active Members List**: Displays avatar, name, email/phone, role badge, and status.
   - **Pending Invitations**: Displays pending tokens, remaining validity countdown, and 1-click resend buttons.
   - **Invite Drawer / Modal**: Choose role (`Admin` vs `Member`), enter contact, and trigger 1-click WhatsApp Share or clipboard copy.
   - **Tier Capacity Meter**: Visual progress bar showing `Seats: X / Y used`.

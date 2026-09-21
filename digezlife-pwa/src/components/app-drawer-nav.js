import { BRAND } from '../config/brand.js';
import { icon } from './icon.js';
import { authStore } from '../state/store.js';
import { householdStore } from '../state/household-store.js';

export function appDrawerHTML() {
  return `
    <wa-drawer id="app-nav-drawer" placement="start" style="--size: 310px;" label="GharlyApp" light-dismiss>
      <div class="app-drawer-content" id="app-drawer-content-inner" style="padding: 0.5rem 0 1.5rem 0;">
        <!-- Dynamically rendered on open/mount -->
      </div>
    </wa-drawer>
  `;
}

export function updateAppDrawerContent() {
  const container = document.getElementById('app-drawer-content-inner');
  if (!container) return;

  const authState = authStore.get();
  const storeState = householdStore.get();
  const household = storeState.household || authState.household || {};
  const user = authState.user || {};

  const householdName = household.name || 'My Household';
  const householdId = household.id || 'GH-DEFAULT';
  const currentPlan = (household.plan || 'free').toLowerCase();
  const userName = user.name || 'Household Member';
  const isOwner = household.is_owner !== undefined ? household.is_owner : true;

  let planBadge = 'Free Household';
  let planBadgeClass = 'badge-gray';
  if (currentPlan === 'plus') {
    planBadge = 'Plus Family';
    planBadgeClass = 'badge-emerald';
  } else if (currentPlan === 'vip') {
    planBadge = 'VIP Household';
    planBadgeClass = 'badge-purple';
  }

  container.innerHTML = `
    <!-- Household Profile Card -->
    <div class="drawer-household-card" style="padding: 1rem; border-radius: 12px; background: var(--wa-color-surface-muted, #f8fafc); border: 1px solid var(--wa-color-surface-border, #e2e8f0); margin-bottom: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span class="wa-tag ${planBadgeClass}" style="font-weight: 700; font-size: 0.72rem;">${planBadge}</span>
        <code style="font-size: 0.72rem; font-weight: 700; background: var(--wa-color-surface-default, #fff); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--wa-color-surface-border, #e2e8f0);">${householdId}</code>
      </div>
      <div style="font-weight: 800; font-size: 1.05rem; color: var(--wa-color-text-normal);">${householdName}</div>
      <div class="text-quiet" style="font-size: 0.8rem; margin-top: 2px; display: flex; justify-content: space-between; align-items: center;">
        <span>${userName}</span>
        <span style="font-size: 0.72rem; font-weight: 600; text-transform: uppercase;">${isOwner ? 'Owner' : 'Member'}</span>
      </div>
      ${
        currentPlan === 'free'
          ? `
        <div style="margin-top: 0.75rem;">
          <a href="#/upgrade" class="drawer-link-action" style="display: block; text-align: center; background: var(--wa-color-brand-fill, #ea580c); color: #fff; text-decoration: none; padding: 7px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 700;">
            Upgrade to Plus Family &rarr;
          </a>
        </div>
      `
          : ''
      }
    </div>

    <!-- Nav Links Sections -->
    <div class="drawer-nav-sections" style="display: flex; flex-direction: column; gap: 1.25rem;">
      <!-- Section 1: Main Modules -->
      <div>
        <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--wa-color-text-quiet); margin-bottom: 0.4rem; padding-left: 0.5rem;">
          Main Modules
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
          <a href="#/home" class="drawer-nav-link">
            <span class="drawer-nav-icon">${icon('house')}</span>
            <span>Home Dashboard</span>
          </a>
          <a href="#/grocery" class="drawer-nav-link">
            <span class="drawer-nav-icon">${icon('cart-shopping')}</span>
            <span>${BRAND.modules?.grocery || 'Gharly Sauda'}</span>
          </a>
          <a href="#/hisab" class="drawer-nav-link">
            <span class="drawer-nav-icon">${icon('wallet')}</span>
            <span>${BRAND.modules?.hisab || 'Gharly Hisab'}</span>
          </a>
          <a href="#/reminders" class="drawer-nav-link">
            <span class="drawer-nav-icon">${icon('bell')}</span>
            <span>${BRAND.modules?.reminders || 'Gharly Reminders'}</span>
          </a>
        </div>
      </div>

      <!-- Section 2: Analytics & Goals -->
      <div>
        <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--wa-color-text-quiet); margin-bottom: 0.4rem; padding-left: 0.5rem;">
          Analytics &amp; Goals
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
          <a href="#/reports" class="drawer-nav-link">
            <span class="drawer-nav-icon">${icon('chart-pie')}</span>
            <span>Monthly Reports &amp; Spend</span>
          </a>
          <a href="#/hisab?tab=savings" class="drawer-nav-link">
            <span class="drawer-nav-icon">${icon('bullseye')}</span>
            <span>Savings Goals</span>
          </a>
          <a href="#/activity" class="drawer-nav-link">
            <span class="drawer-nav-icon">${icon('bolt')}</span>
            <span>Family Activity Log</span>
          </a>
        </div>
      </div>

      <!-- Section 3: Administration & Preferences -->
      <div>
        <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--wa-color-text-quiet); margin-bottom: 0.4rem; padding-left: 0.5rem;">
          Administration
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
          <a href="#/household" class="drawer-nav-link">
            <span class="drawer-nav-icon">${icon('users')}</span>
            <span>Family Members &amp; Roles</span>
          </a>
          <a href="#/upgrade" class="drawer-nav-link">
            <span class="drawer-nav-icon">${icon('ticket')}</span>
            <span>Plans, Billing &amp; Vouchers</span>
          </a>
          <a href="#/settings" class="drawer-nav-link">
            <span class="drawer-nav-icon">${icon('gear')}</span>
            <span>Settings &amp; Theme</span>
          </a>
          <a href="https://wa.me/923001234567" target="_blank" rel="noopener" class="drawer-nav-link">
            <span class="drawer-nav-icon">${icon('comment-dots')}</span>
            <span>WhatsApp Help &amp; Support</span>
          </a>
        </div>
      </div>
    </div>
  `;

  // Attach click listener to close drawer when navigating
  container.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeAppDrawer();
    });
  });
}

export function openAppDrawer() {
  const drawer = document.getElementById('app-nav-drawer');
  if (drawer) {
    updateAppDrawerContent();
    drawer.open = true;
  }
}

export function closeAppDrawer() {
  const drawer = document.getElementById('app-nav-drawer');
  if (drawer) {
    drawer.open = false;
  }
}

export function toggleAppDrawer() {
  const drawer = document.getElementById('app-nav-drawer');
  if (drawer) {
    if (drawer.open) {
      closeAppDrawer();
    } else {
      openAppDrawer();
    }
  }
}

export function mountAppDrawer(root = document) {
  updateAppDrawerContent();

  const drawer = document.getElementById('app-nav-drawer');
  if (drawer) {
    // Prevent click events inside drawer from accidentally bubbling to outside dismissers
    drawer.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Re-update drawer when household snapshot syncs
  document.addEventListener('household:synced', () => {
    updateAppDrawerContent();
  });
}

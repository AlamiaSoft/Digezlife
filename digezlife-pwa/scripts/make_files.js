const fs = require('fs');
const path = require('path');

function write(relPath, content) {
  const fullPath = path.join(__dirname, '..', relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// ==========================================
// 1. src/components/app-topbar.js
// ==========================================
write('src/components/app-topbar.js', `
import { icon } from './icon.js';
import { authStore } from '../state/store.js';

function getInitials(name) {
  if (!name) return 'DL';
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * Renders the persistent top bar HTML.
 * @param {object} opts
 * @param {string} opts.title
 * @param {boolean} opts.back - show a back button that calls history.back()
 * @param {boolean} opts.showBrand - show DigEzLife branding
 * @param {string} opts.actionsHTML - raw HTML for trailing action buttons
 */
export function topbarHTML({ title = '', back = false, showBrand = false, actionsHTML = '' } = {}) {
  const { user, household } = authStore.get();
  const householdName = household?.name || 'My Household';
  const userName = user?.name || 'Household User';

  return \`
    <header class="app-topbar" data-topbar>
      <div class="app-topbar__side">
        \${
          back
            ? \`<button class="app-topbar__icon-btn" data-topbar-back aria-label="Back">\${icon('arrow-left')}</button>\`
            : showBrand
            ? \`<a class="app-topbar__mark-btn" href="#/home" aria-label="Home"><span class="app-brand-mark">D</span></a>\`
            : ''
        }
      </div>
      <div class="app-topbar__title">
        \${
          showBrand
            ? \`
              <div class="app-topbar__brand-wrap">
                <span class="app-topbar__brand-eyebrow">\${householdName.toUpperCase()}</span>
                <h1 class="app-topbar__brand-name">DigEzLife</h1>
              </div>
            \`
            : \`<h1>\${title}</h1>\`
        }
      </div>
      <div class="app-topbar__side app-topbar__side--end">
        \${actionsHTML}
        <a class="app-topbar__avatar-link" href="#/settings" aria-label="Profile & Settings">
          <span class="app-avatar-pill">\${getInitials(userName)}</span>
        </a>
      </div>
    </header>
  \`;
}

export function mountTopbar(root = document) {
  const back = root.querySelector('[data-topbar-back]');
  if (back) {
    back.addEventListener('click', () => history.back());
  }
}
`);

// ==========================================
// 2. src/components/app-bottom-nav.js
// ==========================================
write('src/components/app-bottom-nav.js', `
import { icon } from './icon.js';

export const NAV_ITEMS = [
  { key: 'home', path: '/home', label: 'Home', icon: 'house' },
  { key: 'grocery', path: '/grocery', label: 'Grocery', icon: 'cart-shopping' },
  { key: 'add', path: '/add', label: 'Add', icon: 'plus', isAction: true },
  { key: 'hisab', path: '/hisab', label: 'Hisab', icon: 'wallet' },
  { key: 'reminders', path: '/reminders', label: 'Alerts', icon: 'bell' },
];

export function bottomNavHTML(activeKey = 'home') {
  return \`
    <nav class="app-bottom-nav" data-bottom-nav aria-label="Primary Navigation">
      \${NAV_ITEMS.map((item) => {
        const active = item.key === activeKey;
        if (item.isAction) {
          return \`
            <a class="app-bottom-nav__fab" href="#\${item.path}" aria-label="\${item.label}">
              \${icon(item.icon)}
            </a>
          \`;
        }
        return \`
          <a class="app-bottom-nav__item \${active ? 'is-active' : ''}" href="#\${item.path}">
            \${icon(item.icon)}
            <span>\${item.label}</span>
          </a>
        \`;
      }).join('')}
    </nav>
  \`;
}
`);

// ==========================================
// 3. src/screens/splash.js
// ==========================================
write('src/screens/splash.js', `
import { navigate } from '../state/router.js';
import { authStore, login } from '../state/store.js';
import { api } from '../services/api.js';

export const splashScreen = {
  meta: { topbar: null, nav: null },
  render() {
    return \`
      <div class="screen screen--flush splash">
        <div class="splash__center">
          <div class="splash__mark">
            <span class="splash__letter">D</span>
          </div>
          <h1 class="splash__wordmark">DigEzLife</h1>
          <p class="splash__tagline text-quiet">Everyday Household OS</p>
        </div>
        <div class="splash__footer">
          <wa-spinner style="font-size:1.5rem;"></wa-spinner>
        </div>
      </div>
    \`;
  },
  async afterRender() {
    if (!api.token) {
      setTimeout(() => navigate('/login'), 600);
      return;
    }

    try {
      const meRes = await api.getCurrentUser();
      if (meRes?.data) {
        const user = {
          name: meRes.data.attributes?.name || 'Household User',
          email: meRes.data.attributes?.email || '',
        };
        const household = meRes.meta?.household || { id: 'demo-household', name: 'My Household' };
        login(user, api.token, household);
        navigate('/home');
      } else {
        navigate('/login');
      }
    } catch (err) {
      // If token expired or invalid, go to login
      navigate('/login');
    }
  },
};
`);

// ==========================================
// 4. src/screens/auth-login.js
// ==========================================
write('src/screens/auth-login.js', `
import { navigate } from '../state/router.js';
import { login, pushToast } from '../state/store.js';
import { api } from '../services/api.js';

export const loginScreen = {
  meta: { topbar: null, nav: null },
  render() {
    return \`
      <div class="screen auth-screen">
        <div class="auth-screen__header">
          <div class="auth-screen__mark"><span class="app-brand-mark">D</span></div>
          <p class="auth-screen__eyebrow">HOUSEHOLD DIGITAL OS</p>
          <h1>Welcome back</h1>
          <p class="text-quiet">Sign in to manage groceries, hisab, and household reminders.</p>
        </div>

        <form class="stack" data-login-form>
          <div id="auth-error-box" class="auth-error-alert" style="display:none;"></div>

          <wa-input type="email" label="Email Address" name="email" placeholder="name@domain.com" required></wa-input>
          <wa-input type="password" label="Password" name="password" placeholder="Enter password" required password-toggle></wa-input>

          <wa-button type="submit" variant="brand" size="large" data-submit style="width:100%; margin-top:0.5rem;">
            Sign In
          </wa-button>
        </form>

        <div class="auth-demo-banner card" style="margin-top:1.25rem;">
          <p class="text-quiet" style="font-size:0.85rem; margin:0 0 0.5rem 0;">
            <strong>Fast Evaluation:</strong> Click below to sign into the pre-seeded demo household.
          </p>
          <wa-button appearance="outlined" size="medium" style="width:100%;" data-demo-btn>
            1-Click Demo Sign In
          </wa-button>
        </div>

        <p class="auth-screen__footer text-quiet" style="margin-top:1.5rem; text-align:center;">
          Don't have an account? <a href="#/signup" style="font-weight:600;">Create Household</a>
        </p>
      </div>
    \`;
  },
  afterRender() {
    const form = document.querySelector('[data-login-form]');
    const submitBtn = document.querySelector('[data-submit]');
    const demoBtn = document.querySelector('[data-demo-btn]');
    const errorBox = document.getElementById('auth-error-box');

    const showError = (msg) => {
      if (errorBox) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
      }
    };

    const hideError = () => {
      if (errorBox) {
        errorBox.textContent = '';
        errorBox.style.display = 'none';
      }
    };

    const handleLogin = async (email, password) => {
      hideError();
      if (submitBtn) submitBtn.loading = true;
      try {
        const res = await api.login({ email, password });
        if (res?.meta?.token) {
          const user = {
            name: res.data?.attributes?.name || 'Household User',
            email: res.data?.attributes?.email || email,
          };
          const household = res.meta?.household || { id: 'demo-household', name: 'My Household' };
          login(user, res.meta.token, household);
          pushToast({ message: \`Welcome back, \${user.name}\`, variant: 'success' });
          navigate('/home');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        showError(err.message || 'Authentication failed. Please verify your credentials.');
      } finally {
        if (submitBtn) submitBtn.loading = false;
      }
    };

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('[name="email"]')?.value?.trim();
      const password = form.querySelector('[name="password"]')?.value;
      if (!email || !password) return;
      handleLogin(email, password);
    });

    demoBtn?.addEventListener('click', () => {
      handleLogin('demo@digezlife.com', 'password123');
    });
  },
};
`);

// ==========================================
// 5. src/screens/auth-signup.js
// ==========================================
write('src/screens/auth-signup.js', `
import { navigate } from '../state/router.js';
import { login, pushToast } from '../state/store.js';
import { api } from '../services/api.js';

export const signupScreen = {
  meta: { topbar: null, nav: null },
  render() {
    return \`
      <div class="screen auth-screen">
        <div class="auth-screen__header">
          <div class="auth-screen__mark"><span class="app-brand-mark">D</span></div>
          <p class="auth-screen__eyebrow">CREATE HOUSEHOLD</p>
          <h1>Join DigEzLife</h1>
          <p class="text-quiet">Set up your household space in seconds.</p>
        </div>

        <form class="stack" data-signup-form>
          <div id="signup-error-box" class="auth-error-alert" style="display:none;"></div>

          <wa-input type="text" label="Full Name" name="name" placeholder="e.g. Ali Raza" required></wa-input>
          <wa-input type="email" label="Email Address" name="email" placeholder="name@domain.com" required></wa-input>
          <wa-input type="password" label="Password" name="password" placeholder="Minimum 8 characters" minlength="8" required password-toggle></wa-input>
          <wa-input type="password" label="Confirm Password" name="password_confirmation" placeholder="Re-enter password" minlength="8" required password-toggle></wa-input>

          <wa-button type="submit" variant="brand" size="large" data-submit style="width:100%; margin-top:0.5rem;">
            Create Household Account
          </wa-button>
        </form>

        <p class="auth-screen__footer text-quiet" style="margin-top:1.5rem; text-align:center;">
          Already have an account? <a href="#/login" style="font-weight:600;">Sign in</a>
        </p>
      </div>
    \`;
  },
  afterRender() {
    const form = document.querySelector('[data-signup-form]');
    const submitBtn = document.querySelector('[data-submit]');
    const errorBox = document.getElementById('signup-error-box');

    const showError = (msg) => {
      if (errorBox) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
      }
    };

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]')?.value?.trim();
      const email = form.querySelector('[name="email"]')?.value?.trim();
      const password = form.querySelector('[name="password"]')?.value;
      const passwordConfirm = form.querySelector('[name="password_confirmation"]')?.value;

      if (password !== passwordConfirm) {
        showError('Passwords do not match.');
        return;
      }

      if (submitBtn) submitBtn.loading = true;
      try {
        const res = await api.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirm,
        });

        if (res?.meta?.token) {
          const user = {
            name: res.data?.attributes?.name || name,
            email: res.data?.attributes?.email || email,
          };
          const household = res.meta?.household || { id: 'household-' + Date.now(), name: 'My Household' };
          login(user, res.meta.token, household);
          pushToast({ message: 'Household account created successfully!', variant: 'success' });
          navigate('/home');
        }
      } catch (err) {
        showError(err.message || 'Registration failed. Please check your inputs.');
      } finally {
        if (submitBtn) submitBtn.loading = false;
      }
    });
  },
};
`);

// ==========================================
// 6. src/screens/home.js
// ==========================================
write('src/screens/home.js', `
import { navigate } from '../state/router.js';
import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';

export const homeScreen = {
  meta: { topbar: { showBrand: true }, nav: 'home' },

  async render() {
    const { household } = authStore.get();
    const householdName = household?.name || 'My Household';

    return \`
      <div class="screen home-screen">
        <section class="home-hero">
          <div class="home-hero__content">
            <span class="home-hero__badge"><span class="status-dot status-dot--active"></span> Active Household</span>
            <h2 class="home-hero__title">\${householdName}</h2>
            <p class="home-hero__subtitle text-quiet">Everything organized, in one place.</p>
          </div>
          <div class="home-hero__actions">
            <a class="home-action-chip" href="#/grocery">
              \${icon('cart-shopping')} <span>Grocery</span>
            </a>
            <a class="home-action-chip" href="#/hisab">
              \${icon('wallet')} <span>Hisab</span>
            </a>
            <a class="home-action-chip" href="#/reminders">
              \${icon('bell')} <span>Alerts</span>
            </a>
            <a class="home-action-chip" href="#/share">
              \${icon('user-plus')} <span>Invite</span>
            </a>
          </div>
        </section>

        <!-- Summary Stat Cards -->
        <div class="home-stats-grid" id="home-stats">
          <a class="home-stat-card card" href="#/grocery">
            <div class="home-stat-card__head">
              <span class="home-stat-card__label">GROCERY</span>
              <span class="home-stat-card__badge badge-blue" id="home-stat-grocery-badge">Loading...</span>
            </div>
            <div class="home-stat-card__value" id="home-stat-grocery-title">Weekly Essentials</div>
            <div class="home-stat-card__meta text-quiet">Tap to manage items</div>
          </a>

          <a class="home-stat-card card" href="#/hisab">
            <div class="home-stat-card__head">
              <span class="home-stat-card__label">HISAB LEDGER</span>
              <span class="home-stat-card__badge badge-emerald" id="home-stat-hisab-badge">Net Balance</span>
            </div>
            <div class="home-stat-card__value" id="home-stat-hisab-val">PKR 0</div>
            <div class="home-stat-card__meta text-quiet">Current Month Flow</div>
          </a>

          <a class="home-stat-card card" href="#/reminders">
            <div class="home-stat-card__head">
              <span class="home-stat-card__label">REMINDERS</span>
              <span class="home-stat-card__badge badge-purple" id="home-stat-reminders-badge">Alerts</span>
            </div>
            <div class="home-stat-card__value" id="home-stat-reminders-val">0 Due</div>
            <div class="home-stat-card__meta text-quiet" id="home-stat-reminders-sub">Bills & Tasks</div>
          </a>

          <a class="home-stat-card card" href="#/settings">
            <div class="home-stat-card__head">
              <span class="home-stat-card__label">HOUSEHOLD</span>
              <span class="home-stat-card__badge">Settings</span>
            </div>
            <div class="home-stat-card__value">\${householdName}</div>
            <div class="home-stat-card__meta text-quiet">Family access & backup</div>
          </a>
        </div>

        <!-- Quick Shared Checklist Preview -->
        <section class="home-section" style="margin-top:1.5rem;">
          <div class="home-section__header">
            <div>
              <span class="home-section__eyebrow">QUICK ACCESS</span>
              <h3 class="home-section__title">Shared Grocery List</h3>
            </div>
            <a class="text-brand" href="#/grocery" style="font-size:0.85rem; font-weight:600;">View All &rarr;</a>
          </div>

          <div class="card" id="home-grocery-preview" style="padding:0.75rem 1rem;">
            <div class="text-quiet" style="text-align:center; padding:1rem 0;">Loading grocery items...</div>
          </div>
        </section>
      </div>
    \`;
  },

  async afterRender() {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    // 1. Fetch grocery lists
    try {
      const listsRes = await api.getGroceryLists(hid);
      const lists = listsRes?.data || [];
      if (lists.length > 0) {
        const firstList = lists[0];
        const detailRes = await api.getGroceryList(firstList.id, hid).catch(() => null);
        const items = detailRes?.data?.items || firstList.items || [];
        const pending = items.filter((i) => !i.is_checked);

        const badgeEl = document.getElementById('home-stat-grocery-badge');
        if (badgeEl) badgeEl.textContent = \`\${pending.length} Pending\`;

        const titleEl = document.getElementById('home-stat-grocery-title');
        if (titleEl) titleEl.textContent = firstList.name || 'Weekly Essentials';

        const previewEl = document.getElementById('home-grocery-preview');
        if (previewEl) {
          if (items.length === 0) {
            previewEl.innerHTML = \`<p class="text-quiet" style="text-align:center; margin:0.5rem 0;">No items in list. <a href="#/grocery">Add item</a></p>\`;
          } else {
            previewEl.innerHTML = items.slice(0, 5).map((item) => \`
              <div class="grocery-row \${item.is_checked ? 'is-checked' : ''}" data-item-id="\${item.id}" style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0; border-bottom:1px solid var(--wa-color-surface-border);">
                <label style="display:flex; align-items:center; gap:0.65rem; cursor:pointer; flex:1;">
                  <wa-checkbox \${item.is_checked ? 'checked' : ''} data-toggle-home="\${item.id}"></wa-checkbox>
                  <span class="grocery-item-title \${item.is_checked ? 'text-strike text-quiet' : ''}" style="font-weight:500;">\${item.name}</span>
                </label>
                <span class="wa-tag" style="font-size:0.75rem; color:var(--wa-color-text-quiet);">\${item.quantity || 1} \${item.unit || 'pcs'}</span>
              </div>
            \`).join('');

            // Bind toggle
            previewEl.querySelectorAll('[data-toggle-home]').forEach((cb) => {
              cb.addEventListener('change', async (e) => {
                const itemId = cb.dataset.toggleHome;
                try {
                  await api.toggleGroceryItem(firstList.id, itemId, hid);
                  pushToast({ message: 'Item status updated', variant: 'success' });
                } catch (err) {
                  // Fallback
                }
              });
            });
          }
        }
      }
    } catch (e) {
      console.warn('Home grocery load fallback');
    }

    // 2. Fetch hisab summary
    try {
      const summaryRes = await api.getHisabSummary(null, hid);
      if (summaryRes?.data) {
        const income = parseFloat(summaryRes.data.total_income || 0);
        const expense = parseFloat(summaryRes.data.total_expense || 0);
        const net = income - expense;

        const valEl = document.getElementById('home-stat-hisab-val');
        if (valEl) valEl.textContent = \`PKR \${Math.abs(net).toLocaleString()}\`;

        const badgeEl = document.getElementById('home-stat-hisab-badge');
        if (badgeEl) {
          badgeEl.textContent = net >= 0 ? 'Surplus' : 'Deficit';
          badgeEl.className = \`home-stat-card__badge \${net >= 0 ? 'badge-emerald' : 'badge-rose'}\`;
        }
      }
    } catch (e) {
      console.warn('Home hisab load fallback');
    }

    // 3. Fetch reminders
    try {
      const remindersRes = await api.getReminders(null, hid);
      const reminders = remindersRes?.data || [];
      const pending = reminders.filter((r) => !r.is_completed);

      const valEl = document.getElementById('home-stat-reminders-val');
      if (valEl) valEl.textContent = \`\${pending.length} Due\`;

      const subEl = document.getElementById('home-stat-reminders-sub');
      if (subEl && pending.length > 0) {
        subEl.textContent = \`Next: \${pending[0].title}\`;
      }
    } catch (e) {
      console.warn('Home reminders load fallback');
    }
  },
};
`);

// ==========================================
// 7. src/screens/grocery.js
// ==========================================
write('src/screens/grocery.js', `
import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';

export const groceryScreen = {
  meta: { topbar: { title: 'Grocery Lists' }, nav: 'grocery' },

  render() {
    return \`
      <div class="screen grocery-screen">
        <!-- List Switcher Tabs -->
        <div class="grocery-tabs-bar" id="grocery-lists-tabs">
          <button class="filter-chip is-active" data-list-id="1">Weekly Essentials</button>
        </div>

        <!-- Quick Add Input -->
        <div class="card grocery-quick-add" style="margin-top:0.75rem; padding:0.75rem;">
          <form id="grocery-quick-form" style="display:flex; gap:0.5rem; align-items:center;">
            <wa-input id="quick-item-name" placeholder="Add item (e.g. Milk 2L, Eggs 1 Dozen)..." style="flex:1;" required></wa-input>
            <wa-button type="submit" variant="brand" data-add-btn>+ Add</wa-button>
          </form>
        </div>

        <!-- Category Filters -->
        <div class="filter-chips-row" id="category-filters" style="margin-top:0.75rem;">
          <button class="filter-chip is-active" data-cat="All">All</button>
          <button class="filter-chip" data-cat="Dairy">Dairy</button>
          <button class="filter-chip" data-cat="Bakery">Bakery</button>
          <button class="filter-chip" data-cat="Pantry">Pantry</button>
          <button class="filter-chip" data-cat="Produce">Produce</button>
          <button class="filter-chip" data-cat="Household">Household</button>
          <button class="filter-chip" data-cat="Meat">Meat</button>
        </div>

        <!-- Items Checklist -->
        <div class="card grocery-checklist-card" style="margin-top:0.75rem; padding:0.5rem 1rem;" id="grocery-items-container">
          <div class="text-quiet" style="text-align:center; padding:1.5rem 0;">Loading list items...</div>
        </div>

        <!-- Floating Actions / WhatsApp Share -->
        <div class="grocery-actions-bar" style="margin-top:1.25rem; display:flex; flex-direction:column; gap:0.5rem;">
          <wa-button variant="brand" appearance="filled" style="width:100%;" id="btn-whatsapp-share">
            \${icon('share-nodes')} Share List via WhatsApp
          </wa-button>
          <wa-button appearance="outlined" style="width:100%;" id="btn-open-add-drawer">
            \${icon('plus')} Add Detailed Item
          </wa-button>
        </div>

        <!-- Detailed Add Item Drawer -->
        <wa-drawer id="add-item-drawer" label="Add Grocery Item" placement="bottom" style="--size: 440px;">
          <form id="drawer-item-form" class="stack" style="gap:1rem;">
            <wa-input label="Item Name" id="drawer-name" placeholder="e.g. Basmati Rice" required></wa-input>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem;">
              <wa-input label="Quantity" type="number" id="drawer-qty" value="1" min="1" required></wa-input>
              <wa-select label="Unit" id="drawer-unit" value="kg">
                <wa-option value="kg">kg</wa-option>
                <wa-option value="liters">liters</wa-option>
                <wa-option value="dozen">dozen</wa-option>
                <wa-option value="pack">pack</wa-option>
                <wa-option value="pcs">pcs</wa-option>
                <wa-option value="grams">grams</wa-option>
              </wa-select>
            </div>
            <wa-select label="Category" id="drawer-cat" value="Pantry">
              <wa-option value="Pantry">Pantry</wa-option>
              <wa-option value="Dairy">Dairy</wa-option>
              <wa-option value="Bakery">Bakery</wa-option>
              <wa-option value="Produce">Produce</wa-option>
              <wa-option value="Household">Household</wa-option>
              <wa-option value="Meat">Meat</wa-option>
              <wa-option value="Beverages">Beverages</wa-option>
              <wa-option value="Other">Other</wa-option>
            </wa-select>
            <wa-button type="submit" variant="brand" size="large" style="width:100%; margin-top:0.5rem;">
              Save Item
            </wa-button>
          </form>
        </wa-drawer>
      </div>
    \`;
  },

  async afterRender() {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    let activeListId = 1;
    let activeCategory = 'All';
    let currentItems = [];
    let currentLists = [];

    const container = document.getElementById('grocery-items-container');
    const tabsBar = document.getElementById('grocery-lists-tabs');
    const drawer = document.getElementById('add-item-drawer');

    // Default seeded fallback items
    const defaultItems = [
      { id: 101, name: 'Fresh Milk', quantity: 2, unit: 'liters', category: 'Dairy', is_checked: false },
      { id: 102, name: 'Eggs (Dozen)', quantity: 1, unit: 'dozen', category: 'Dairy', is_checked: false },
      { id: 103, name: 'White Bread / Roti', quantity: 1, unit: 'pack', category: 'Bakery', is_checked: false },
      { id: 104, name: 'Basmati Rice', quantity: 2, unit: 'kg', category: 'Pantry', is_checked: false },
      { id: 105, name: 'Cooking Oil / Ghee', quantity: 1, unit: 'liters', category: 'Pantry', is_checked: false },
      { id: 106, name: 'Tea / Chai Patti', quantity: 1, unit: 'pack', category: 'Pantry', is_checked: false },
      { id: 107, name: 'Sugar / Shakkar', quantity: 1, unit: 'kg', category: 'Pantry', is_checked: false },
      { id: 108, name: 'Potatoes (Aloo)', quantity: 2, unit: 'kg', category: 'Produce', is_checked: false },
      { id: 109, name: 'Onions (Pyaz)', quantity: 2, unit: 'kg', category: 'Produce', is_checked: false },
      { id: 110, name: 'Dishwashing Soap', quantity: 1, unit: 'bottle', category: 'Household', is_checked: false },
    ];

    const renderItems = () => {
      if (!container) return;
      let filtered = currentItems;
      if (activeCategory !== 'All') {
        filtered = filtered.filter((i) => (i.category || 'General').toLowerCase() === activeCategory.toLowerCase());
      }

      if (filtered.length === 0) {
        container.innerHTML = \`<div class="text-quiet" style="text-align:center; padding:2rem 0;">No items found in this category.</div>\`;
        return;
      }

      container.innerHTML = filtered.map((item) => \`
        <div class="grocery-item-row \${item.is_checked ? 'is-checked' : ''}" style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid var(--wa-color-surface-border);">
          <label style="display:flex; align-items:center; gap:0.75rem; cursor:pointer; flex:1;">
            <wa-checkbox \${item.is_checked ? 'checked' : ''} data-toggle-item="\${item.id}"></wa-checkbox>
            <div>
              <div class="grocery-item-name \${item.is_checked ? 'text-strike text-quiet' : ''}" style="font-weight:500; font-size:0.95rem;">\${item.name}</div>
              <div class="text-quiet" style="font-size:0.78rem;">\${item.category || 'General'}</div>
            </div>
          </label>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="wa-tag" style="font-size:0.8rem;">\${item.quantity || 1} \${item.unit || 'pcs'}</span>
            <button class="app-topbar__icon-btn" data-delete-item="\${item.id}" aria-label="Delete Item" style="color:var(--wa-color-red-40); font-size:0.85rem;">
              \${icon('trash-can')}
            </button>
          </div>
        </div>
      \`).join('');

      // Wire checkboxes
      container.querySelectorAll('[data-toggle-item]').forEach((cb) => {
        cb.addEventListener('change', async () => {
          const itemId = cb.dataset.toggleItem;
          const itm = currentItems.find((i) => String(i.id) === String(itemId));
          if (itm) {
            itm.is_checked = !itm.is_checked;
            renderItems();
            try {
              await api.toggleGroceryItem(activeListId, itemId, hid);
            } catch (e) {
              // local state already toggled
            }
          }
        });
      });

      // Wire deletes
      container.querySelectorAll('[data-delete-item]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const itemId = btn.dataset.deleteItem;
          currentItems = currentItems.filter((i) => String(i.id) !== String(itemId));
          renderItems();
          pushToast({ message: 'Item removed', variant: 'neutral' });
          try {
            await api.deleteGroceryItem(activeListId, itemId, hid);
          } catch (e) {
            // local state updated
          }
        });
      });
    };

    // Fetch lists from backend
    try {
      const res = await api.getGroceryLists(hid);
      if (res?.data && res.data.length > 0) {
        currentLists = res.data;
        activeListId = currentLists[0].id;
        const detailRes = await api.getGroceryList(activeListId, hid).catch(() => null);
        currentItems = detailRes?.data?.items || defaultItems;
      } else {
        currentItems = defaultItems;
      }
    } catch (e) {
      currentItems = defaultItems;
    }

    renderItems();

    // Category filter clicking
    document.querySelectorAll('#category-filters .filter-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#category-filters .filter-chip').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeCategory = btn.dataset.cat;
        renderItems();
      });
    });

    // Quick add submit
    const quickForm = document.getElementById('grocery-quick-form');
    quickForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('quick-item-name');
      const name = input?.value?.trim();
      if (!name) return;

      const newItem = {
        id: Date.now(),
        name,
        quantity: 1,
        unit: 'pcs',
        category: activeCategory === 'All' ? 'Pantry' : activeCategory,
        is_checked: false,
      };

      currentItems.unshift(newItem);
      input.value = '';
      renderItems();
      pushToast({ message: \`Added "\${name}"\`, variant: 'success' });

      try {
        const addRes = await api.addGroceryItem(activeListId, {
          name,
          quantity: 1,
          unit: 'pcs',
          category: newItem.category,
        }, hid);
        if (addRes?.data?.id) {
          newItem.id = addRes.data.id;
        }
      } catch (err) {
        // Kept in local state
      }
    });

    // WhatsApp Share Button
    document.getElementById('btn-whatsapp-share')?.addEventListener('click', () => {
      const pending = currentItems.filter((i) => !i.is_checked);
      const listName = 'Weekly Essentials';
      let msg = \`*DigEzLife Grocery List: \${listName}*\\n\\n\`;
      if (pending.length === 0) {
        msg += 'All items have been purchased!\\n';
      } else {
        pending.forEach((i) => {
          msg += \`- [ ] \${i.name} (\${i.quantity} \${i.unit})\\n\`;
        });
      }
      msg += \`\\nShared via DigEzLife (https://digezlife.app)\`;
      window.open(\`https://wa.me/?text=\${encodeURIComponent(msg)}\`, '_blank');
    });

    // Detailed Add Drawer
    document.getElementById('btn-open-add-drawer')?.addEventListener('click', () => {
      if (drawer) drawer.open = true;
    });

    const drawerForm = document.getElementById('drawer-item-form');
    drawerForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('drawer-name')?.value?.trim();
      const qty = parseFloat(document.getElementById('drawer-qty')?.value) || 1;
      const unit = document.getElementById('drawer-unit')?.value || 'pcs';
      const cat = document.getElementById('drawer-cat')?.value || 'Pantry';

      if (!name) return;

      const newItem = {
        id: Date.now(),
        name,
        quantity: qty,
        unit,
        category: cat,
        is_checked: false,
      };

      currentItems.unshift(newItem);
      renderItems();
      if (drawer) drawer.open = false;
      drawerForm.reset();
      pushToast({ message: \`Added "\${name}"\`, variant: 'success' });

      try {
        await api.addGroceryItem(activeListId, {
          name,
          quantity: qty,
          unit,
          category: cat,
        }, hid);
      } catch (err) {
        // local
      }
    });
  },
};
`);

// ==========================================
// 8. src/screens/hisab.js
// ==========================================
write('src/screens/hisab.js', `
import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';

export const hisabScreen = {
  meta: { topbar: { title: 'Personal Hisab' }, nav: 'hisab' },

  render() {
    return \`
      <div class="screen hisab-screen">
        <!-- Summary Cards -->
        <div class="hisab-summary-cards" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:0.6rem;">
          <div class="card summary-box box-green" style="padding:0.75rem; text-align:center;">
            <div class="text-quiet" style="font-size:0.7rem; font-weight:600;">INCOME</div>
            <div style="font-size:1.05rem; font-weight:700; color:var(--wa-color-green-40); margin-top:0.2rem;" id="hisab-total-income">PKR 0</div>
          </div>
          <div class="card summary-box box-red" style="padding:0.75rem; text-align:center;">
            <div class="text-quiet" style="font-size:0.7rem; font-weight:600;">EXPENSE</div>
            <div style="font-size:1.05rem; font-weight:700; color:var(--wa-color-red-40); margin-top:0.2rem;" id="hisab-total-expense">PKR 0</div>
          </div>
          <div class="card summary-box box-net" style="padding:0.75rem; text-align:center;">
            <div class="text-quiet" style="font-size:0.7rem; font-weight:600;">NET</div>
            <div style="font-size:1.05rem; font-weight:700; margin-top:0.2rem;" id="hisab-total-net">PKR 0</div>
          </div>
        </div>

        <!-- Section Navigation Tabs -->
        <div class="filter-chips-row" id="hisab-tabs" style="margin-top:1rem;">
          <button class="filter-chip is-active" data-tab="transactions">Transactions</button>
          <button class="filter-chip" data-tab="udhaar">Udhaar & Khata</button>
        </div>

        <!-- Transactions View -->
        <div id="view-transactions" style="margin-top:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span class="text-quiet" style="font-size:0.85rem; font-weight:600;">Monthly Flow</span>
            <wa-button variant="brand" size="small" id="btn-open-tx-drawer">+ Record Entry</wa-button>
          </div>

          <div class="stack" id="transactions-list" style="gap:0.6rem;">
            <div class="card text-quiet" style="text-align:center; padding:1.5rem 0;">Loading transactions...</div>
          </div>
        </div>

        <!-- Udhaar & Khata View (Debts / Receivables) -->
        <div id="view-udhaar" style="display:none; margin-top:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span class="text-quiet" style="font-size:0.85rem; font-weight:600;">Debts & Receivables</span>
            <wa-button variant="brand" size="small" id="btn-open-debt-drawer">+ Add Debt / Khata</wa-button>
          </div>

          <div class="stack" id="debts-list" style="gap:0.6rem;">
            <div class="card text-quiet" style="text-align:center; padding:1.5rem 0;">Loading debts...</div>
          </div>
        </div>

        <!-- Add Transaction Drawer -->
        <wa-drawer id="tx-drawer" label="Record Transaction" placement="bottom" style="--size: 480px;">
          <form id="tx-form" class="stack" style="gap:1rem;">
            <wa-select label="Type" id="tx-type" value="expense">
              <wa-option value="expense">Expense</wa-option>
              <wa-option value="income">Income</wa-option>
            </wa-select>
            <wa-input label="Amount (PKR)" type="number" id="tx-amount" placeholder="e.g. 2500" required></wa-input>
            <wa-input label="Description / Title" id="tx-notes" placeholder="e.g. Groceries at Metro" required></wa-input>
            <wa-select label="Category" id="tx-category" value="Groceries">
              <wa-option value="Groceries">Groceries</wa-option>
              <wa-option value="Utilities">Utilities & Bills</wa-option>
              <wa-option value="Rent">Housing / Rent</wa-option>
              <wa-option value="Transport">Transport & Fuel</wa-option>
              <wa-option value="Medical">Medical & Health</wa-option>
              <wa-option value="Salary">Salary / Income</wa-option>
              <wa-option value="Other">Other</wa-option>
            </wa-select>
            <wa-input label="Date" type="date" id="tx-date"></wa-input>
            <wa-button type="submit" variant="brand" size="large" style="width:100%; margin-top:0.5rem;">
              Save Entry
            </wa-button>
          </form>
        </wa-drawer>

        <!-- Add Debt Drawer -->
        <wa-drawer id="debt-drawer" label="Add Udhaar / Debt Entry" placement="bottom" style="--size: 480px;">
          <form id="debt-form" class="stack" style="gap:1rem;">
            <wa-select label="Direction" id="debt-dir" value="lent">
              <wa-option value="lent">I Lent Money (Receivable)</wa-option>
              <wa-option value="borrowed">I Borrowed Money (Payable)</wa-option>
            </wa-select>
            <wa-input label="Person Name" id="debt-person" placeholder="e.g. Tariq Mehmood" required></wa-input>
            <wa-input label="Phone Number (for WhatsApp reminder)" id="debt-phone" placeholder="e.g. +923001234567"></wa-input>
            <wa-input label="Amount (PKR)" type="number" id="debt-amount" placeholder="e.g. 15000" required></wa-input>
            <wa-input label="Due Date" type="date" id="debt-due"></wa-input>
            <wa-button type="submit" variant="brand" size="large" style="width:100%; margin-top:0.5rem;">
              Save Debt Record
            </wa-button>
          </form>
        </wa-drawer>
      </div>
    \`;
  },

  async afterRender() {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    let transactions = [];
    let debts = [];
    let income = 0;
    let expense = 0;

    const txDrawer = document.getElementById('tx-drawer');
    const debtDrawer = document.getElementById('debt-drawer');

    // Default today for tx-date
    const txDateInput = document.getElementById('tx-date');
    if (txDateInput) txDateInput.value = new Date().toISOString().slice(0, 10);

    const debtDueInput = document.getElementById('debt-due');
    if (debtDueInput) debtDueInput.value = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const updateSummaries = () => {
      const net = income - expense;
      const incomeEl = document.getElementById('hisab-total-income');
      const expenseEl = document.getElementById('hisab-total-expense');
      const netEl = document.getElementById('hisab-total-net');

      if (incomeEl) incomeEl.textContent = \`PKR \${income.toLocaleString()}\`;
      if (expenseEl) expenseEl.textContent = \`PKR \${expense.toLocaleString()}\`;
      if (netEl) {
        netEl.textContent = \`PKR \${Math.abs(net).toLocaleString()}\`;
        netEl.style.color = net >= 0 ? 'var(--wa-color-green-40)' : 'var(--wa-color-red-40)';
      }
    };

    const renderTransactions = () => {
      const listEl = document.getElementById('transactions-list');
      if (!listEl) return;

      if (transactions.length === 0) {
        listEl.innerHTML = \`
          <div class="card" style="text-align:center; padding:2rem 1rem;">
            <p style="margin:0; font-weight:500;">No transactions recorded this month.</p>
            <p class="text-quiet" style="font-size:0.85rem; margin-top:0.3rem;">Tap "+ Record Entry" to log expenses or income.</p>
          </div>
        \`;
        return;
      }

      listEl.innerHTML = transactions.map((t) => \`
        <div class="card list-row" style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="list-row__icon" style="background:\${t.type === 'income' ? 'var(--wa-color-green-90)' : 'var(--wa-color-red-90)'}; color:\${t.type === 'income' ? 'var(--wa-color-green-40)' : 'var(--wa-color-red-40)'};">
              \${icon(t.type === 'income' ? 'arrow-down-left' : 'arrow-up-right')}
            </div>
            <div>
              <div style="font-weight:600; font-size:0.95rem;">\${t.notes || t.title || t.category}</div>
              <div class="text-quiet" style="font-size:0.8rem;">\${t.category} &bull; \${t.date || 'Recent'}</div>
            </div>
          </div>
          <div style="font-weight:700; font-size:1rem; color:\${t.type === 'income' ? 'var(--wa-color-green-40)' : 'var(--wa-color-red-40)'};">
            \${t.type === 'income' ? '+' : '-'} PKR \${parseFloat(t.amount || 0).toLocaleString()}
          </div>
        </div>
      \`).join('');
    };

    const renderDebts = () => {
      const listEl = document.getElementById('debts-list');
      if (!listEl) return;

      if (debts.length === 0) {
        listEl.innerHTML = \`
          <div class="card" style="text-align:center; padding:2rem 1rem;">
            <p style="margin:0; font-weight:500;">No active debts or receivables.</p>
            <p class="text-quiet" style="font-size:0.85rem; margin-top:0.3rem;">All household lendings and borrowings are settled.</p>
          </div>
        \`;
        return;
      }

      listEl.innerHTML = debts.map((d) => {
        const remaining = parseFloat(d.amount || 0) - parseFloat(d.paid || d.paid_amount || 0);
        return \`
          <div class="card" style="padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <span class="wa-tag \${d.direction === 'lent' ? 'badge-amber' : 'badge-purple'}">
                  \${d.direction === 'lent' ? 'Receivable (Lent)' : 'Payable (Borrowed)'}
                </span>
                <h4 style="margin:0.4rem 0 0.2rem 0; font-size:1.05rem;">\${d.person || d.person_name}</h4>
                <div class="text-quiet" style="font-size:0.8rem;">Due: \${d.due || d.due_date || 'N/A'} &bull; Phone: \${d.phone || d.person_phone || 'N/A'}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:1.1rem; font-weight:700;">PKR \${remaining.toLocaleString()}</div>
                <div class="text-quiet" style="font-size:0.75rem;">Total: PKR \${parseFloat(d.amount).toLocaleString()}</div>
              </div>
            </div>

            <div style="display:flex; gap:0.5rem; margin-top:0.85rem;">
              \${
                d.direction === 'lent'
                  ? \`
                    <wa-button size="small" appearance="outlined" data-whatsapp-debt="\${d.id}" style="flex:1;">
                      \${icon('comment-sms')} WhatsApp Reminder
                    </wa-button>
                  \`
                  : ''
              }
              <wa-button size="small" variant="brand" data-settle-debt="\${d.id}" style="flex:1;">
                Settle / Paid
              </wa-button>
            </div>
          </div>
        \`;
      }).join('');

      // WhatsApp reminders
      listEl.querySelectorAll('[data-whatsapp-debt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const debtId = btn.dataset.whatsappDebt;
          const d = debts.find((item) => String(item.id) === String(debtId));
          if (d) {
            const remaining = parseFloat(d.amount) - parseFloat(d.paid || d.paid_amount || 0);
            const text = \`Salam \${d.person || d.person_name}, gentle reminder regarding the pending amount of PKR \${remaining.toLocaleString()} (due \${d.due || d.due_date || 'soon'}). Please settle when convenient. Thank you! - DigEzLife\`;
            const cleanPhone = (d.phone || d.person_phone || '').replace(/[^0-9]/g, '');
            window.open(\`https://wa.me/\${cleanPhone}?text=\${encodeURIComponent(text)}\`, '_blank');
          }
        });
      });

      // Settle debt
      listEl.querySelectorAll('[data-settle-debt]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const debtId = btn.dataset.settleDebt;
          const d = debts.find((item) => String(item.id) === String(debtId));
          if (d) {
            d.paid = d.amount;
            debts = debts.filter((item) => String(item.id) !== String(debtId));
            renderDebts();
            pushToast({ message: 'Debt marked settled', variant: 'success' });
            try {
              await api.settleHisabDebt(debtId, d.amount, hid);
            } catch (e) {
              // local
            }
          }
        });
      });
    };

    // Tab switching
    document.querySelectorAll('#hisab-tabs .filter-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#hisab-tabs .filter-chip').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const tab = btn.dataset.tab;
        const txView = document.getElementById('view-transactions');
        const udhaarView = document.getElementById('view-udhaar');
        if (txView && udhaarView) {
          txView.style.display = tab === 'transactions' ? 'block' : 'none';
          udhaarView.style.display = tab === 'udhaar' ? 'block' : 'none';
        }
      });
    });

    // Fetch live summaries & transactions
    try {
      const [sumRes, txRes, debtsRes] = await Promise.all([
        api.getHisabSummary(null, hid).catch(() => null),
        api.getHisabTransactions(null, hid).catch(() => null),
        api.getHisabDebts(null, hid).catch(() => null),
      ]);

      if (sumRes?.data) {
        income = parseFloat(sumRes.data.total_income || 0);
        expense = parseFloat(sumRes.data.total_expense || 0);
      }
      if (txRes?.data) {
        transactions = txRes.data.map((t) => ({
          id: t.id,
          title: t.notes || t.category,
          amount: t.amount,
          type: t.type,
          category: t.category,
          date: t.transaction_date || 'Today',
        }));
      }
      if (debtsRes?.data) {
        debts = debtsRes.data;
      }
    } catch (e) {
      console.warn('Hisab backend fetch fallback');
    }

    updateSummaries();
    renderTransactions();
    renderDebts();

    // Drawer triggers
    document.getElementById('btn-open-tx-drawer')?.addEventListener('click', () => {
      if (txDrawer) txDrawer.open = true;
    });

    document.getElementById('btn-open-debt-drawer')?.addEventListener('click', () => {
      if (debtDrawer) debtDrawer.open = true;
    });

    // Add transaction submit
    document.getElementById('tx-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = document.getElementById('tx-type')?.value || 'expense';
      const amount = parseFloat(document.getElementById('tx-amount')?.value) || 0;
      const notes = document.getElementById('tx-notes')?.value?.trim();
      const category = document.getElementById('tx-category')?.value || 'Groceries';
      const date = document.getElementById('tx-date')?.value || new Date().toISOString().slice(0, 10);

      if (amount <= 0 || !notes) return;

      const newTx = {
        id: Date.now(),
        title: notes,
        notes,
        amount,
        type,
        category,
        date,
      };

      transactions.unshift(newTx);
      if (type === 'income') income += amount;
      else expense += amount;

      updateSummaries();
      renderTransactions();
      if (txDrawer) txDrawer.open = false;
      document.getElementById('tx-form')?.reset();
      pushToast({ message: 'Transaction recorded', variant: 'success' });

      try {
        await api.addHisabTransaction({
          type,
          amount,
          category,
          notes,
          payment_method: 'Cash',
          transaction_date: date,
        }, hid);
      } catch (err) {
        // local
      }
    });

    // Add debt submit
    document.getElementById('debt-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const direction = document.getElementById('debt-dir')?.value || 'lent';
      const person = document.getElementById('debt-person')?.value?.trim();
      const phone = document.getElementById('debt-phone')?.value?.trim();
      const amount = parseFloat(document.getElementById('debt-amount')?.value) || 0;
      const due = document.getElementById('debt-due')?.value || 'Next Week';

      if (!person || amount <= 0) return;

      const newDebt = {
        id: Date.now(),
        person,
        person_name: person,
        phone,
        person_phone: phone,
        amount,
        paid: 0,
        due,
        due_date: due,
        direction,
      };

      debts.unshift(newDebt);
      renderDebts();
      if (debtDrawer) debtDrawer.open = false;
      document.getElementById('debt-form')?.reset();
      pushToast({ message: 'Debt record added', variant: 'success' });

      try {
        await api.addHisabDebt({
          person_name: person,
          person_phone: phone,
          amount,
          direction,
          due_date: due,
        }, hid);
      } catch (err) {
        // local
      }
    });
  },
};
`);

// ==========================================
// 9. src/screens/reminders.js
// ==========================================
write('src/screens/reminders.js', `
import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';

export const remindersScreen = {
  meta: { topbar: { title: 'Reminders & Tasks' }, nav: 'reminders' },

  render() {
    return \`
      <div class="screen reminders-screen">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <div>
            <span class="text-quiet" style="font-size:0.78rem; font-weight:600; text-transform:uppercase;">SCHEDULE</span>
            <h3 style="margin:0.1rem 0 0 0; font-size:1.1rem;" id="reminders-active-heading">Active Alerts</h3>
          </div>
          <wa-button variant="brand" size="small" id="btn-open-reminder-drawer">+ Set Alert</wa-button>
        </div>

        <!-- Reminders List -->
        <div class="stack" id="reminders-list" style="gap:0.6rem;">
          <div class="card text-quiet" style="text-align:center; padding:1.5rem 0;">Loading reminders...</div>
        </div>

        <!-- Completed Tasks Section -->
        <div id="reminders-completed-section" style="margin-top:1.5rem; display:none;">
          <span class="text-quiet" style="font-size:0.78rem; font-weight:600; text-transform:uppercase;">PAST / COMPLETED</span>
          <div class="stack" id="reminders-completed-list" style="gap:0.5rem; margin-top:0.5rem;"></div>
        </div>

        <!-- Add Reminder Drawer -->
        <wa-drawer id="reminder-drawer" label="Set New Reminder" placement="bottom" style="--size: 460px;">
          <form id="reminder-form" class="stack" style="gap:1rem;">
            <wa-input label="Title / Task Name" id="reminder-title" placeholder="e.g. Electricity Bill Due" required></wa-input>
            <wa-select label="Category" id="reminder-cat" value="Bill">
              <wa-option value="Bill">Bill / Utility</wa-option>
              <wa-option value="Health & Medicine">Health & Medicine</wa-option>
              <wa-option value="Renewal">Renewal (Token / License)</wa-option>
              <wa-option value="Maintenance">Maintenance & Service</wa-option>
              <wa-option value="Occasion">Birthday / Occasion</wa-option>
              <wa-option value="General">General</wa-option>
            </wa-select>
            <wa-input label="Due Date" type="date" id="reminder-due" required></wa-input>
            <wa-select label="Repeat" id="reminder-recurrence" value="none">
              <wa-option value="none">Does not repeat</wa-option>
              <wa-option value="weekly">Weekly</wa-option>
              <wa-option value="monthly">Monthly</wa-option>
              <wa-option value="yearly">Yearly</wa-option>
            </wa-select>
            <wa-button type="submit" variant="brand" size="large" style="width:100%; margin-top:0.5rem;">
              Save Reminder
            </wa-button>
          </form>
        </wa-drawer>
      </div>
    \`;
  },

  async afterRender() {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    let reminders = [];
    const drawer = document.getElementById('reminder-drawer');
    const dueInput = document.getElementById('reminder-due');
    if (dueInput) dueInput.value = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    const renderReminders = () => {
      const activeListEl = document.getElementById('reminders-list');
      const compSection = document.getElementById('reminders-completed-section');
      const compListEl = document.getElementById('reminders-completed-list');
      const headingEl = document.getElementById('reminders-active-heading');

      const pending = reminders.filter((r) => !r.is_completed);
      const completed = reminders.filter((r) => r.is_completed);

      if (headingEl) headingEl.textContent = \`Active Alerts (\${pending.length})\`;

      if (activeListEl) {
        if (pending.length === 0) {
          activeListEl.innerHTML = \`
            <div class="card" style="text-align:center; padding:2rem 1rem;">
              <p style="margin:0; font-weight:500;">No active reminders or alerts.</p>
              <p class="text-quiet" style="font-size:0.85rem; margin-top:0.3rem;">Tap "+ Set Alert" to create bill reminders, medicine alerts, or renewals.</p>
            </div>
          \`;
        } else {
          activeListEl.innerHTML = pending.map((r) => \`
            <div class="card list-row" style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem;">
              <div style="display:flex; align-items:center; gap:0.75rem; flex:1; cursor:pointer;" data-toggle-rem="\${r.id}">
                <wa-checkbox data-cb-rem="\${r.id}"></wa-checkbox>
                <div>
                  <div style="font-weight:600; font-size:0.95rem;">\${r.title}</div>
                  <div class="text-quiet" style="font-size:0.8rem;">
                    \${r.category || 'General'} &bull; Due: \${r.due || (r.due_at ? r.due_at.slice(0, 10) : 'Upcoming')}
                    \${r.recurrence && r.recurrence !== 'none' ? \`(\${r.recurrence})\` : ''}
                  </div>
                </div>
              </div>
              <button class="app-topbar__icon-btn" data-delete-rem="\${r.id}" aria-label="Delete" style="color:var(--wa-color-red-40); font-size:0.85rem;">
                \${icon('trash-can')}
              </button>
            </div>
          \`).join('');
        }
      }

      if (compSection && compListEl) {
        if (completed.length > 0) {
          compSection.style.display = 'block';
          compListEl.innerHTML = completed.map((r) => \`
            <div class="card list-row" style="display:flex; align-items:center; justify-content:space-between; padding:0.7rem 1rem; opacity:0.65;">
              <div style="display:flex; align-items:center; gap:0.75rem; flex:1; cursor:pointer;" data-toggle-rem="\${r.id}">
                <wa-checkbox checked data-cb-rem="\${r.id}"></wa-checkbox>
                <div>
                  <div style="font-weight:500; font-size:0.9rem; text-decoration:line-through;">\${r.title}</div>
                  <div class="text-quiet" style="font-size:0.75rem;">Completed &bull; \${r.category || 'General'}</div>
                </div>
              </div>
              <button class="app-topbar__icon-btn" data-delete-rem="\${r.id}" aria-label="Delete" style="color:var(--wa-color-red-40); font-size:0.85rem;">
                \${icon('trash-can')}
              </button>
            </div>
          \`).join('');
        } else {
          compSection.style.display = 'none';
        }
      }

      // Wire checkboxes
      document.querySelectorAll('[data-toggle-rem], [data-cb-rem]').forEach((el) => {
        el.addEventListener('click', async (e) => {
          e.stopPropagation();
          const remId = el.dataset.toggleRem || el.dataset.cbRem;
          const r = reminders.find((item) => String(item.id) === String(remId));
          if (r) {
            r.is_completed = !r.is_completed;
            renderReminders();
            pushToast({ message: r.is_completed ? 'Marked complete' : 'Reminder restored', variant: 'success' });
            try {
              await api.toggleReminder(remId, hid);
            } catch (err) {
              // local
            }
          }
        });
      });

      // Wire deletes
      document.querySelectorAll('[data-delete-rem]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const remId = btn.dataset.deleteRem;
          reminders = reminders.filter((item) => String(item.id) !== String(remId));
          renderReminders();
          pushToast({ message: 'Reminder deleted', variant: 'neutral' });
          try {
            await api.deleteReminder(remId, hid);
          } catch (err) {
            // local
          }
        });
      });
    };

    // Fetch live reminders
    try {
      const res = await api.getReminders(null, hid);
      if (res?.data) {
        reminders = res.data.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category || 'General',
          due: r.due_at ? r.due_at.slice(0, 10) : 'Upcoming',
          recurrence: r.recurrence_rule || 'none',
          is_completed: !!r.is_completed,
        }));
      }
    } catch (e) {
      console.warn('Reminders fetch fallback');
    }

    renderReminders();

    document.getElementById('btn-open-reminder-drawer')?.addEventListener('click', () => {
      if (drawer) drawer.open = true;
    });

    document.getElementById('reminder-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('reminder-title')?.value?.trim();
      const category = document.getElementById('reminder-cat')?.value || 'General';
      const due = document.getElementById('reminder-due')?.value || new Date().toISOString().slice(0, 10);
      const recurrence = document.getElementById('reminder-recurrence')?.value || 'none';

      if (!title) return;

      const newRem = {
        id: Date.now(),
        title,
        category,
        due,
        recurrence,
        is_completed: false,
      };

      reminders.unshift(newRem);
      renderReminders();
      if (drawer) drawer.open = false;
      document.getElementById('reminder-form')?.reset();
      pushToast({ message: 'Alert scheduled', variant: 'success' });

      try {
        const createRes = await api.createReminder({
          title,
          category,
          due_at: new Date(due).toISOString(),
          recurrence_rule: recurrence,
        }, hid);
        if (createRes?.data?.id) {
          newRem.id = createRes.data.id;
        }
      } catch (err) {
        // local
      }
    });
  },
};
`);

// ==========================================
// 10. src/screens/settings.js
// ==========================================
write('src/screens/settings.js', `
import { navigate } from '../state/router.js';
import { authStore, logout, themeStore, setThemeMode, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';

function getInitials(name) {
  if (!name) return 'DL';
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

export const settingsScreen = {
  meta: { topbar: { title: 'Settings & Household' }, nav: null },

  render() {
    const { user, household } = authStore.get();
    const currentTheme = themeStore.get().mode;
    const householdName = household?.name || 'My Household';
    const userName = user?.name || 'Household User';
    const userEmail = user?.email || 'user@digezlife.com';

    return \`
      <div class="screen settings-screen">
        <!-- Household Profile Card -->
        <section class="card profile-card" style="display:flex; align-items:center; gap:1rem; padding:1.25rem;">
          <div class="large-avatar-pill">\${getInitials(userName)}</div>
          <div style="flex:1; min-width:0;">
            <span class="wa-tag badge-emerald" style="font-size:0.7rem;">HOUSEHOLD OWNER</span>
            <h3 style="margin:0.25rem 0 0.1rem 0; font-size:1.15rem;">\${userName}</h3>
            <p class="text-quiet" style="font-size:0.85rem; margin:0;">\${userEmail}</p>
            <p class="text-brand" style="font-size:0.8rem; font-weight:600; margin-top:0.2rem;">\${householdName}</p>
          </div>
        </section>

        <!-- Settings Groups -->
        <div class="stack" style="gap:1rem; margin-top:1.25rem;">
          <!-- Appearance -->
          <div class="card" style="padding:1rem;">
            <span class="text-quiet" style="font-size:0.75rem; font-weight:700; text-transform:uppercase;">Appearance</span>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem;">
              <div>
                <div style="font-weight:600; font-size:0.95rem;">Theme Mode</div>
                <div class="text-quiet" style="font-size:0.8rem;">Switch between light, dark, or system mode</div>
              </div>
              <wa-select id="settings-theme-select" value="\${currentTheme}" size="small" style="width:120px;">
                <wa-option value="light">Light</wa-option>
                <wa-option value="dark">Dark</wa-option>
                <wa-option value="system">System</wa-option>
              </wa-select>
            </div>
          </div>

          <!-- Household Sharing & Backup -->
          <div class="card" style="padding:0.5rem 1rem;">
            <a class="list-row" href="#/share" style="border:none; border-bottom:1px solid var(--wa-color-surface-border); border-radius:0; padding:0.75rem 0;">
              <div class="list-row__icon" style="background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet);">
                \${icon('user-plus')}
              </div>
              <div class="list-row__body">
                <div class="list-row__title">Invite Family Member</div>
                <div class="list-row__subtitle">Share grocery & hisab access</div>
              </div>
              <div style="color:var(--wa-color-text-quiet); font-size:0.9rem;">&rarr;</div>
            </a>

            <div class="list-row" id="btn-export-backup" style="border:none; border-bottom:1px solid var(--wa-color-surface-border); border-radius:0; padding:0.75rem 0; cursor:pointer;">
              <div class="list-row__icon" style="background:var(--wa-color-blue-90); color:var(--wa-color-blue-40);">
                \${icon('cloud-arrow-down')}
              </div>
              <div class="list-row__body">
                <div class="list-row__title">Export Household Backup</div>
                <div class="list-row__subtitle">Download offline JSON data file</div>
              </div>
              <div style="color:var(--wa-color-text-quiet); font-size:0.9rem;">&rarr;</div>
            </div>

            <a class="list-row" href="#/upgrade" style="border:none; border-radius:0; padding:0.75rem 0;">
              <div class="list-row__icon" style="background:var(--wa-color-purple-90); color:var(--wa-color-purple-40);">
                \${icon('crown')}
              </div>
              <div class="list-row__body">
                <div class="list-row__title">Subscription Plan</div>
                <div class="list-row__subtitle">Free Household &bull; Tap to view Plus / VIP</div>
              </div>
              <div style="color:var(--wa-color-text-quiet); font-size:0.9rem;">&rarr;</div>
            </a>
          </div>

          <!-- Sign Out Button -->
          <wa-button variant="danger" appearance="outlined" size="large" style="width:100%; margin-top:0.5rem;" id="btn-settings-logout">
            \${icon('right-from-bracket')} Sign Out
          </wa-button>
        </div>
      </div>
    \`;
  },

  afterRender() {
    // Theme select
    const themeSelect = document.getElementById('settings-theme-select');
    themeSelect?.addEventListener('change', (e) => {
      const mode = e.target.value;
      setThemeMode(mode);
      pushToast({ message: \`Theme set to \${mode}\`, variant: 'neutral' });
    });

    // Export backup
    document.getElementById('btn-export-backup')?.addEventListener('click', () => {
      const { user, household } = authStore.get();
      const backupData = {
        exported_at: new Date().toISOString(),
        user,
        household,
        app: 'DigEzLife Household OS',
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', \`digezlife-backup-\${new Date().toISOString().slice(0, 10)}.json\`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      pushToast({ message: 'Backup JSON downloaded', variant: 'success' });
    });

    // Logout
    document.getElementById('btn-settings-logout')?.addEventListener('click', async () => {
      await api.logout().catch(() => {});
      logout();
      pushToast({ message: 'Signed out successfully', variant: 'neutral' });
      navigate('/login');
    });
  },
};
`);

// ==========================================
// 11. src/screens/profile.js
// ==========================================
write('src/screens/profile.js', `
import { settingsScreen } from './settings.js';

export const profileScreen = settingsScreen;
`);

// ==========================================
// 12. src/screens/share.js
// ==========================================
write('src/screens/share.js', `
import { authStore, pushToast } from '../state/store.js';
import { icon } from '../components/icon.js';

export const shareScreen = {
  meta: { topbar: { title: 'Invite to Household', back: true }, nav: null },

  render() {
    const { household } = authStore.get();
    const householdName = household?.name || 'My Household';
    const inviteCode = (household?.id || 'demo-household').toUpperCase();
    const inviteUrl = \`https://digezlife.app/invite/\${household?.id || 'demo-household'}\`;

    return \`
      <div class="screen share-screen">
        <div class="state-panel" style="padding-top:1rem;">
          <div class="state-panel__icon state-panel__icon--brand">
            \${icon('user-plus')}
          </div>
          <h2>Invite Family Member</h2>
          <p class="text-quiet">Share your household space to collaborate in real-time on grocery lists, hisab records, and alerts.</p>
        </div>

        <div class="card" style="padding:1.25rem; margin-top:1rem;">
          <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.4rem; color:var(--wa-color-text-quiet);">HOUSEHOLD INVITE LINK</label>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <wa-input value="\${inviteUrl}" readonly style="flex:1; font-size:0.85rem;"></wa-input>
            <wa-copy-button value="\${inviteUrl}" aria-label="Copy invite link"></wa-copy-button>
          </div>

          <div style="margin-top:1rem; display:flex; justify-content:space-between; align-items:center; padding-top:0.75rem; border-top:1px solid var(--wa-color-surface-border);">
            <span class="text-quiet" style="font-size:0.85rem;">Invite Code: <strong>\${inviteCode}</strong></span>
            <wa-tag badge="brand">Active</wa-tag>
          </div>
        </div>

        <div class="stack" style="margin-top:1.25rem; gap:0.6rem;">
          <wa-button variant="brand" size="large" style="width:100%;" id="btn-share-whatsapp">
            \${icon('share-nodes')} Send WhatsApp Invite
          </wa-button>
          <wa-button appearance="outlined" size="large" style="width:100%;" id="btn-copy-link">
            \${icon('copy')} Copy Link to Clipboard
          </wa-button>
        </div>
      </div>
    \`;
  },

  afterRender() {
    const { household } = authStore.get();
    const householdName = household?.name || 'My Household';
    const inviteUrl = \`https://digezlife.app/invite/\${household?.id || 'demo-household'}\`;

    document.getElementById('btn-share-whatsapp')?.addEventListener('click', () => {
      const msg = \`Salam! Join our household "\${householdName}" on DigEzLife to share grocery lists, hisab records, and bill reminders:\\n\${inviteUrl}\`;
      window.open(\`https://wa.me/?text=\${encodeURIComponent(msg)}\`, '_blank');
    });

    document.getElementById('btn-copy-link')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(inviteUrl);
      pushToast({ message: 'Invite link copied to clipboard', variant: 'success' });
    });
  },
};
`);

// ==========================================
// 13. src/screens/paywall.js
// ==========================================
write('src/screens/paywall.js', `
import { icon } from '../components/icon.js';
import { pushToast } from '../state/store.js';

export const paywallScreen = {
  meta: { topbar: { title: 'Household Plans', back: true }, nav: null },

  render() {
    return \`
      <div class="screen paywall-screen">
        <div style="text-align:center; padding:1rem 0 1.5rem;">
          <span class="wa-tag badge-purple" style="margin-bottom:0.5rem;">PAKPAY LOCAL PLANS</span>
          <h2>Upgrade Your Household OS</h2>
          <p class="text-quiet" style="font-size:0.9rem; max-width:320px; margin:0.4rem auto 0;">Unlock unlimited family sharing, automated WhatsApp reminders, and receipt intelligence.</p>
        </div>

        <div class="stack" style="gap:1rem;">
          <!-- Plan 1: Free Household -->
          <div class="card" style="padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h3 style="margin:0; font-size:1.1rem;">Free Household</h3>
                <p class="text-quiet" style="font-size:0.8rem; margin:0.2rem 0 0 0;">Basic essentials for small families</p>
              </div>
              <span class="wa-tag">Current Plan</span>
            </div>
            <div style="font-size:1.4rem; font-weight:800; margin:0.75rem 0 0.5rem 0;">PKR 0 <small style="font-size:0.8rem; font-weight:400; color:var(--wa-color-text-quiet);">/ forever</small></div>
            <ul style="margin:0.75rem 0 0 0; padding-left:1.25rem; font-size:0.85rem; color:var(--wa-color-text-quiet); line-height:1.6;">
              <li>1 Shared grocery checklist</li>
              <li>Monthly Hisab income & expense ledger</li>
              <li>5 Active reminder tasks</li>
            </ul>
          </div>

          <!-- Plan 2: Plus Family -->
          <div class="card" style="padding:1.25rem; border:2px solid var(--wa-color-brand-fill-loud); position:relative;">
            <span class="wa-tag badge-emerald" style="position:absolute; top:-12px; right:16px;">MOST POPULAR</span>
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h3 style="margin:0; font-size:1.15rem; color:var(--wa-color-brand-on-normal);">Plus Family</h3>
                <p class="text-quiet" style="font-size:0.8rem; margin:0.2rem 0 0 0;">For full family collaboration</p>
              </div>
            </div>
            <div style="font-size:1.5rem; font-weight:800; margin:0.75rem 0 0.5rem 0; color:var(--wa-color-brand-on-normal);">PKR 499 <small style="font-size:0.8rem; font-weight:400; color:var(--wa-color-text-quiet);">/ month</small></div>
            <ul style="margin:0.75rem 0 1rem 0; padding-left:1.25rem; font-size:0.85rem; color:var(--wa-color-text-quiet); line-height:1.6;">
              <li>Unlimited grocery lists & WhatsApp export</li>
              <li>Multi-member shared Hisab with Udhaar tracking</li>
              <li>Unlimited scheduled alerts & bill tracking</li>
              <li>Automated WhatsApp payment reminders</li>
            </ul>
            <wa-button variant="brand" size="large" style="width:100%;" data-upgrade="plus">
              Upgrade to Plus (JazzCash / EasyPaisa)
            </wa-button>
          </div>

          <!-- Plan 3: VIP Household -->
          <div class="card" style="padding:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h3 style="margin:0; font-size:1.1rem;">VIP Household</h3>
                <p class="text-quiet" style="font-size:0.8rem; margin:0.2rem 0 0 0;">Multiple properties & domestic staff</p>
              </div>
            </div>
            <div style="font-size:1.4rem; font-weight:800; margin:0.75rem 0 0.5rem 0;">PKR 1,499 <small style="font-size:0.8rem; font-weight:400; color:var(--wa-color-text-quiet);">/ month</small></div>
            <ul style="margin:0.75rem 0 1rem 0; padding-left:1.25rem; font-size:0.85rem; color:var(--wa-color-text-quiet); line-height:1.6;">
              <li>Multiple household & property profiles</li>
              <li>Domestic staff salary & advance khata</li>
              <li>Automated utility bill fetcher</li>
              <li>VIP WhatsApp priority support</li>
            </ul>
            <wa-button appearance="outlined" size="large" style="width:100%;" data-upgrade="vip">
              Upgrade to VIP
            </wa-button>
          </div>
        </div>
      </div>
    \`;
  },

  afterRender() {
    document.querySelectorAll('[data-upgrade]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const plan = btn.dataset.upgrade;
        pushToast({ message: \`PakPay checkout for \${plan.toUpperCase()} tier opening...\`, variant: 'brand' });
      });
    });
  },
};
`);

// ==========================================
// 14. src/screens/search.js
// ==========================================
write('src/screens/search.js', `
import { icon } from '../components/icon.js';
import { authStore } from '../state/store.js';
import { api } from '../services/api.js';

export const searchScreen = {
  meta: { topbar: { title: 'Search Household' }, nav: null },

  render() {
    return \`
      <div class="screen search-screen">
        <div class="search-bar-wrap" style="margin-bottom:1rem;">
          <wa-input id="household-search-input" placeholder="Search groceries, transactions, alerts..." style="width:100%;">
            <wa-icon slot="start" name="magnifying-glass"></wa-icon>
          </wa-input>
        </div>

        <div id="search-results" class="stack" style="gap:0.75rem;">
          <div class="card text-quiet" style="text-align:center; padding:2rem 1rem;">
            \${icon('magnifying-glass')}
            <p style="margin:0.5rem 0 0 0;">Type above to search across your household.</p>
          </div>
        </div>
      </div>
    \`;
  },

  async afterRender() {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    const input = document.getElementById('household-search-input');
    const resultsContainer = document.getElementById('search-results');

    input?.addEventListener('input', async (e) => {
      const q = e.target.value?.trim().toLowerCase();
      if (!q || q.length < 2) {
        if (resultsContainer) {
          resultsContainer.innerHTML = \`
            <div class="card text-quiet" style="text-align:center; padding:2rem 1rem;">
              \${icon('magnifying-glass')}
              <p style="margin:0.5rem 0 0 0;">Type above to search across your household.</p>
            </div>
          \`;
        }
        return;
      }

      try {
        const [listsRes, txRes, remRes] = await Promise.all([
          api.getGroceryLists(hid).catch(() => null),
          api.getHisabTransactions(null, hid).catch(() => null),
          api.getReminders(null, hid).catch(() => null),
        ]);

        const items = [];
        if (listsRes?.data?.[0]?.items) {
          listsRes.data[0].items.forEach((i) => {
            if (i.name.toLowerCase().includes(q) || (i.category && i.category.toLowerCase().includes(q))) {
              items.push({ type: 'Grocery', title: i.name, sub: \`\${i.quantity || 1} \${i.unit || 'pcs'} &bull; \${i.category || 'Pantry'}\`, link: '#/grocery' });
            }
          });
        }

        if (txRes?.data) {
          txRes.data.forEach((t) => {
            const label = t.notes || t.category;
            if (label.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) {
              items.push({ type: 'Hisab', title: label, sub: \`PKR \${parseFloat(t.amount).toLocaleString()} &bull; \${t.type}\`, link: '#/hisab' });
            }
          });
        }

        if (remRes?.data) {
          remRes.data.forEach((r) => {
            if (r.title.toLowerCase().includes(q) || (r.category && r.category.toLowerCase().includes(q))) {
              items.push({ type: 'Reminder', title: r.title, sub: \`Due: \${r.due_at ? r.due_at.slice(0, 10) : 'Upcoming'}\`, link: '#/reminders' });
            }
          });
        }

        if (resultsContainer) {
          if (items.length === 0) {
            resultsContainer.innerHTML = \`
              <div class="card text-quiet" style="text-align:center; padding:2rem 1rem;">
                No matches found for "\${q}".
              </div>
            \`;
          } else {
            resultsContainer.innerHTML = items.map((res) => \`
              <a class="card list-row" href="\${res.link}">
                <div class="list-row__icon" style="background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet);">
                  \${icon(res.type === 'Grocery' ? 'cart-shopping' : res.type === 'Hisab' ? 'wallet' : 'bell')}
                </div>
                <div class="list-row__body">
                  <span class="wa-tag" style="font-size:0.7rem;">\${res.type}</span>
                  <div class="list-row__title" style="margin-top:0.2rem;">\${res.title}</div>
                  <div class="list-row__subtitle">\${res.sub}</div>
                </div>
              </a>
            \`).join('');
          }
        }
      } catch (err) {
        // search error
      }
    });
  },
};
`);

// ==========================================
// 15. src/screens/add.js (Action FAB Screen)
// ==========================================
write('src/screens/add.js', `
import { icon } from '../components/icon.js';

export const addScreen = {
  meta: { topbar: { title: 'Quick Actions' }, nav: 'add' },

  render() {
    return \`
      <div class="screen add-screen">
        <div style="text-align:center; padding:1rem 0 1.5rem;">
          <h2>What would you like to record?</h2>
          <p class="text-quiet" style="font-size:0.9rem;">Choose a household module to add a new entry.</p>
        </div>

        <div class="stack" style="gap:0.85rem;">
          <a class="card list-row" href="#/grocery" style="padding:1.1rem 1rem;">
            <div class="list-row__icon" style="background:var(--wa-color-blue-90); color:var(--wa-color-blue-40);">
              \${icon('cart-shopping')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title" style="font-size:1rem;">Add Grocery Items</div>
              <div class="list-row__subtitle">Add items to shared household list</div>
            </div>
            <div style="color:var(--wa-color-text-quiet);">&rarr;</div>
          </a>

          <a class="card list-row" href="#/hisab" style="padding:1.1rem 1rem;">
            <div class="list-row__icon" style="background:var(--wa-color-green-90); color:var(--wa-color-green-40);">
              \${icon('wallet')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title" style="font-size:1rem;">Record Hisab Transaction</div>
              <div class="list-row__subtitle">Log household expenses, income, or udhaar</div>
            </div>
            <div style="color:var(--wa-color-text-quiet);">&rarr;</div>
          </a>

          <a class="card list-row" href="#/reminders" style="padding:1.1rem 1rem;">
            <div class="list-row__icon" style="background:var(--wa-color-purple-90); color:var(--wa-color-purple-40);">
              \${icon('bell')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title" style="font-size:1rem;">Set Reminder / Bill Alert</div>
              <div class="list-row__subtitle">Schedule bill due dates, medicines, or renewals</div>
            </div>
            <div style="color:var(--wa-color-text-quiet);">&rarr;</div>
          </a>

          <a class="card list-row" href="#/share" style="padding:1.1rem 1rem;">
            <div class="list-row__icon" style="background:var(--wa-color-amber-90); color:var(--wa-color-amber-40);">
              \${icon('user-plus')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title" style="font-size:1rem;">Invite Family Member</div>
              <div class="list-row__subtitle">Share access with household members</div>
            </div>
            <div style="color:var(--wa-color-text-quiet);">&rarr;</div>
          </a>
        </div>
      </div>
    \`;
  },
};
`);

// ==========================================
// 16. src/main.js
// ==========================================
write('src/main.js', `
import '@awesome.me/webawesome/dist/styles/webawesome.css';
import '@awesome.me/webawesome/dist/styles/themes/default.css';
import './components/webawesome.js';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import { mountAppShell } from './layouts/app-shell.js';
import { registerRoute, registerNotFound, startRouter } from './state/router.js';
import { applyTheme, themeStore } from './state/store.js';
import { notFoundStateHTML } from './components/states.js';
import { initPwa } from './services/pwa.js';

import { splashScreen } from './screens/splash.js';
import { loginScreen } from './screens/auth-login.js';
import { signupScreen } from './screens/auth-signup.js';
import { homeScreen } from './screens/home.js';
import { groceryScreen } from './screens/grocery.js';
import { hisabScreen } from './screens/hisab.js';
import { remindersScreen } from './screens/reminders.js';
import { settingsScreen } from './screens/settings.js';
import { profileScreen } from './screens/profile.js';
import { shareScreen } from './screens/share.js';
import { paywallScreen } from './screens/paywall.js';
import { searchScreen } from './screens/search.js';
import { addScreen } from './screens/add.js';

/* ---- Theme: apply immediately ---- */
applyTheme(themeStore.get().mode);
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themeStore.get().mode === 'system') applyTheme('system');
  });
}

/* ---- Routes ---- */
registerRoute('/splash', splashScreen);
registerRoute('/login', loginScreen);
registerRoute('/signup', signupScreen);
registerRoute('/home', homeScreen);
registerRoute('/grocery', groceryScreen);
registerRoute('/hisab', hisabScreen);
registerRoute('/reminders', remindersScreen);
registerRoute('/settings', settingsScreen);
registerRoute('/profile', profileScreen);
registerRoute('/share', shareScreen);
registerRoute('/upgrade', paywallScreen);
registerRoute('/search', searchScreen);
registerRoute('/add', addScreen);
registerNotFound(() => \`<div class="screen">\${notFoundStateHTML()}</div>\`);

/* ---- Boot ---- */
mountAppShell();
startRouter();
initPwa();
`);

// ==========================================
// 17. src/styles/components.css additions
// ==========================================
write('src/styles/components.css', `
/* =========================================================
   App Topbar & Navigation
   ========================================================= */
.app-topbar {
  flex-shrink: 0;
  height: calc(var(--app-topbar-height) + var(--app-safe-top));
  padding-top: var(--app-safe-top);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  background: color-mix(in oklab, var(--wa-color-surface-lowered) 85%, transparent);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  border-bottom: 1px solid var(--wa-color-surface-border);
  position: sticky;
  top: 0;
  z-index: 20;
}

.app-topbar__side {
  flex: 0 0 auto;
  min-width: 2.25rem;
  display: flex;
  align-items: center;
}

.app-topbar__side--end {
  justify-content: flex-end;
  gap: 0.5rem;
}

.app-topbar__title {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.app-topbar__title h1 {
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.app-topbar__brand-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-topbar__brand-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--wa-color-brand-on-normal);
}

.app-topbar__brand-name {
  font-size: 1.05rem;
  font-weight: 800;
  font-family: var(--wa-font-family-heading);
  margin: 0;
  line-height: 1.1;
}

.app-brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--wa-border-radius-m);
  background: var(--wa-color-brand-fill-loud);
  color: var(--wa-color-brand-on-loud);
  font-weight: 800;
  font-size: 0.95rem;
}

.app-topbar__icon-btn {
  appearance: none;
  border: none;
  background: transparent;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--wa-border-radius-pill);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  color: var(--wa-color-text-normal);
  cursor: pointer;
}

.app-avatar-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--wa-border-radius-pill);
  background: var(--wa-color-brand-fill-quiet);
  color: var(--wa-color-brand-on-quiet);
  font-weight: 700;
  font-size: 0.78rem;
  text-decoration: none;
}

.large-avatar-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--wa-border-radius-pill);
  background: var(--wa-color-brand-fill-loud);
  color: var(--wa-color-brand-on-loud);
  font-weight: 800;
  font-size: 1.3rem;
}

/* Bottom Nav */
.app-bottom-nav {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(var(--app-bottomnav-height) + var(--app-safe-bottom));
  padding-bottom: var(--app-safe-bottom);
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: color-mix(in oklab, var(--wa-color-surface-default) 90%, transparent);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border-top: 1px solid var(--wa-color-surface-border);
  z-index: 30;
}

.app-bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  text-decoration: none;
  color: var(--wa-color-text-quiet);
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.35rem 0;
}

.app-bottom-nav__item wa-icon {
  font-size: 1.15rem;
}

.app-bottom-nav__item.is-active {
  color: var(--wa-color-brand-on-normal);
}

.app-bottom-nav__fab {
  flex: 0 0 auto;
  width: 3rem;
  height: 3rem;
  margin-top: -1.5rem;
  border-radius: var(--wa-border-radius-pill);
  background: var(--wa-color-brand-fill-loud);
  color: var(--wa-color-brand-on-loud);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  text-decoration: none;
  box-shadow: var(--app-shadow-2);
}

/* Offline banner */
.app-offline-banner {
  position: sticky;
  top: 0;
  z-index: 25;
  display: none;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  background: var(--wa-color-neutral-20);
}

.app-offline-banner.is-visible {
  display: flex;
}

.app-toast-host {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(var(--app-bottomnav-height) + var(--app-safe-bottom) + 0.75rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  pointer-events: none;
  z-index: 40;
}

/* Auth Screens */
.auth-screen {
  padding: 2rem 1.25rem;
  max-width: 420px;
  margin: 0 auto;
}

.auth-screen__header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.auth-screen__mark {
  margin-bottom: 0.75rem;
}

.auth-screen__eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--wa-color-brand-on-normal);
  margin: 0 0 0.25rem 0;
}

.auth-screen__header h1 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 0.35rem 0;
}

.auth-error-alert {
  padding: 0.65rem 0.85rem;
  background: var(--wa-color-red-90);
  color: var(--wa-color-red-30);
  border-radius: var(--wa-border-radius-m);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

/* Home Screen */
.home-hero {
  padding: 0.75rem 0 0.5rem 0;
}

.home-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--wa-color-green-40);
  background: var(--wa-color-green-90);
  padding: 0.2rem 0.6rem;
  border-radius: var(--wa-border-radius-pill);
  margin-bottom: 0.4rem;
}

.home-hero__title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}

.home-hero__actions {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.75rem 0 0.25rem 0;
  scrollbar-width: none;
}

.home-action-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: var(--wa-border-radius-pill);
  background: var(--wa-color-surface-default);
  border: 1px solid var(--wa-color-surface-border);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--wa-color-text-normal);
  white-space: nowrap;
}

.home-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.home-stat-card {
  padding: 0.85rem;
  text-decoration: none;
  color: inherit;
}

.home-stat-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.home-stat-card__label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--wa-color-text-quiet);
}

.home-stat-card__badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: var(--wa-border-radius-pill);
  background: var(--wa-color-neutral-90);
}

.badge-blue { background: var(--wa-color-blue-90); color: var(--wa-color-blue-40); }
.badge-emerald { background: var(--wa-color-green-90); color: var(--wa-color-green-40); }
.badge-rose { background: var(--wa-color-red-90); color: var(--wa-color-red-40); }
.badge-purple { background: var(--wa-color-purple-90); color: var(--wa-color-purple-40); }
.badge-amber { background: var(--wa-color-yellow-90); color: var(--wa-color-yellow-40); }

.home-stat-card__value {
  font-size: 1.15rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-stat-card__meta {
  font-size: 0.75rem;
  margin-top: 0.2rem;
}

.home-section__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 0.5rem;
}

.home-section__eyebrow {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--wa-color-text-quiet);
}

.home-section__title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
}

/* Filter chips */
.filter-chips-row {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 0.25rem;
}

.filter-chip {
  appearance: none;
  border: 1px solid var(--wa-color-surface-border);
  background: var(--wa-color-surface-default);
  color: var(--wa-color-text-quiet);
  padding: 0.35rem 0.8rem;
  border-radius: var(--wa-border-radius-pill);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.filter-chip.is-active {
  background: var(--wa-color-brand-fill-loud);
  color: var(--wa-color-brand-on-loud);
  border-color: var(--wa-color-brand-fill-loud);
}

/* General Utilities */
.card {
  background: var(--wa-color-surface-default);
  border: 1px solid var(--wa-color-surface-border);
  border-radius: var(--wa-border-radius-l);
  padding: 1rem;
  box-shadow: var(--app-shadow-1);
}

.list-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}

.list-row__icon {
  flex: 0 0 auto;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--wa-border-radius-l);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.list-row__body {
  flex: 1;
  min-width: 0;
}

.list-row__title {
  font-weight: 600;
  font-size: 0.92rem;
}

.list-row__subtitle {
  font-size: 0.8rem;
  color: var(--wa-color-text-quiet);
}

.text-strike {
  text-decoration: line-through;
}

.status-dot {
  display: inline-block;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
}
.status-dot--active { background: var(--wa-color-green-40); }

/* Splash Screen */
.splash {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 4rem 1.5rem 2rem;
  text-align: center;
}

.splash__center {
  margin-top: auto;
  margin-bottom: auto;
}

.splash__mark {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: var(--wa-border-radius-l);
  background: var(--wa-color-brand-fill-loud);
  color: var(--wa-color-brand-on-loud);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.splash__letter {
  font-size: 2.2rem;
  font-weight: 900;
  font-family: var(--wa-font-family-heading);
}

.splash__wordmark {
  font-size: 1.85rem;
  font-weight: 800;
  margin: 0;
}
`);

console.log('All parts complete');




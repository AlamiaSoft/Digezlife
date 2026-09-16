import '@awesome.me/webawesome/dist/styles/webawesome.css';
import '@awesome.me/webawesome/dist/webawesome.js';
import './styles.css';
import { AuthApi, GroceryApi, HisabApi, RemindersApi, api } from './adapters/apiAdapter.js';

// Application state with clean initial defaults
const state = {
  screen: 'home',
  authTab: 'login', // 'login' | 'register'
  authError: '',
  authLoading: false,
  theme: localStorage.getItem('digezlife-theme') || 'light',
  household: { id: localStorage.getItem('digezlife_household') || 'demo-household', name: 'My Household' },
  user: { name: 'Household User', email: '' },
  online: navigator.onLine,
  activeGroceryListId: 1,
  groceryLists: [
    {
      id: 1,
      name: 'Weekly Essentials',
      items: [
        { id: 101, name: 'Fresh Milk', quantity: 2, unit: 'liters', category: 'Dairy', is_checked: false },
        { id: 102, name: 'Eggs (Dozen)', quantity: 1, unit: 'dozen', category: 'Dairy', is_checked: false },
        { id: 103, name: 'White Bread / Roti', quantity: 1, unit: 'pack', category: 'Bakery', is_checked: false },
        { id: 104, name: 'Basmati Rice', quantity: 2, unit: 'kg', category: 'Pantry', is_checked: false },
        { id: 105, name: 'Cooking Oil / Ghee', quantity: 1, unit: 'liters', category: 'Pantry', is_checked: false },
        { id: 106, name: 'Tea / Chai Patti', quantity: 1, unit: 'pack', category: 'Pantry', is_checked: false },
        { id: 107, name: 'Sugar / Shakkar', quantity: 1, unit: 'kg', category: 'Pantry', is_checked: false },
        { id: 108, name: 'Potatoes (Aloo)', quantity: 2, unit: 'kg', category: 'Produce', is_checked: false },
        { id: 109, name: 'Onions (Pyaz)', quantity: 2, unit: 'kg', category: 'Produce', is_checked: false },
        { id: 110, name: 'Dishwashing Soap', quantity: 1, unit: 'bottle', category: 'Household', is_checked: false }
      ]
    }
  ],
  hisab: {
    month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    income: 0,
    expense: 0,
    transactions: [],
    debts: []
  },
  reminders: []
};

const app = document.querySelector('#app');

const symbol = (name) => ({
  home: '[H]',
  grocery: '[G]',
  hisab: '[$]',
  reminders: '[R]',
  profile: '[P]',
  arrow: '->',
  back: '<',
  plus: '+',
  check: 'OK',
  cross: 'X'
}[name] || name);

const button = (label, action, extra = '') => `<button class="wa-button ${extra}" data-action="${action}">${label}</button>`;

function render() {
  document.documentElement.dataset.theme = state.theme;
  const isAuth = state.screen === 'auth';

  app.innerHTML = `<div class="app-shell">
    ${state.online ? '' : `<div class="status-banner offline"><span class="pulse"></span> Offline Mode: Changes saved locally.</div>`}
    ${!isAuth ? `
      <header class="topbar">
        <div class="brand-mark">D</div>
        <div>
          <p class="eyebrow">DIGEZLIFE / ${state.household.name.toUpperCase()}</p>
          <h1>${screenTitle()}</h1>
        </div>
        <button class="avatar" data-action="profile">${getInitials(state.user.name)}</button>
      </header>
    ` : ''}
    <main class="content">${screenMarkup()}</main>
    ${!isAuth ? navMarkup() : ''}
    <div id="toast" class="toast" role="status"></div>
  </div>`;
  wire();
}

function getInitials(name) {
  if (!name) return 'DL';
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function screenTitle() {
  return {
    home: 'Everyday Overview',
    grocery: 'Grocery Lists',
    hisab: 'Personal Hisab',
    reminders: 'Reminders & Tasks',
    profile: 'Household Profile',
    auth: 'Welcome to DigEzLife',
    new_expense: 'Record Expense',
    new_reminder: 'New Reminder'
  }[state.screen] || 'DigEzLife';
}

function navMarkup() {
  const items = [
    ['home', 'Home'],
    ['grocery', 'Grocery'],
    ['hisab', 'Hisab'],
    ['reminders', 'Reminders'],
    ['profile', 'Profile']
  ];
  return `<nav class="bottom-nav" aria-label="Main Navigation">
    ${items.map(([id, label]) => `
      <button class="nav-item ${state.screen === id ? 'active' : ''}" data-action="${id}">
        <span class="nav-label-symbol">${symbol(id)}</span>
        <small>${label}</small>
      </button>
    `).join('')}
  </nav>`;
}

function screenMarkup() {
  if (state.screen === 'auth') return authMarkup();
  if (state.screen === 'home') return homeMarkup();
  if (state.screen === 'grocery') return groceryMarkup();
  if (state.screen === 'hisab') return hisabMarkup();
  if (state.screen === 'reminders') return remindersMarkup();
  if (state.screen === 'profile') return profileMarkup();
  if (state.screen === 'new_expense') return newExpenseMarkup();
  if (state.screen === 'new_reminder') return newReminderMarkup();
  return homeMarkup();
}

// 0. Auth Screen View
function authMarkup() {
  const isLogin = state.authTab === 'login';

  return `
    <div class="auth-container">
      <div class="auth-header">
        <div class="brand-mark" style="width: 44px; height: 44px; font-size: 18px; margin: 0 auto 12px;">D</div>
        <p class="eyebrow accent">HOUSEHOLD DIGITAL OS</p>
        <h2>${isLogin ? 'Sign in to DigEzLife' : 'Create your Household'}</h2>
        <p class="muted">${isLogin ? 'Manage groceries, hisab, and household reminders.' : 'Start organizing your everyday household in seconds.'}</p>
      </div>

      <div class="auth-tabs">
        <button class="auth-tab ${isLogin ? 'active' : ''}" data-auth-tab="login">Sign In</button>
        <button class="auth-tab ${!isLogin ? 'active' : ''}" data-auth-tab="register">Create Account</button>
      </div>

      ${state.authError ? `<div class="auth-error-banner" style="display: block;">${state.authError}</div>` : ''}

      ${isLogin ? `
        <form id="login-form" class="card">
          <label>Email Address
            <input class="wa-input" id="login-email" type="email" placeholder="name@domain.com" required value="${state.user.email || ''}" />
          </label>
          <label style="margin-top: 12px; display: block;">Password
            <input class="wa-input" id="login-password" type="password" placeholder="Enter your password" required />
          </label>
          <button class="wa-button primary full" type="submit" style="margin-top: 18px;" ${state.authLoading ? 'disabled' : ''}>
            ${state.authLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div class="auth-demo-card">
          <p><strong>Fast Evaluation:</strong> Click below to immediately sign into the pre-seeded demo household.</p>
          <button class="wa-button quiet full" data-action="login-demo" ${state.authLoading ? 'disabled' : ''}>1-Click Demo Sign In</button>
        </div>
      ` : `
        <form id="register-form" class="card">
          <label>Full Name
            <input class="wa-input" id="register-name" type="text" placeholder="e.g. Ali Raza" required />
          </label>
          <label style="margin-top: 12px; display: block;">Email Address
            <input class="wa-input" id="register-email" type="email" placeholder="name@domain.com" required />
          </label>
          <label style="margin-top: 12px; display: block;">Password
            <input class="wa-input" id="register-password" type="password" placeholder="Minimum 8 characters" minlength="8" required />
          </label>
          <label style="margin-top: 12px; display: block;">Confirm Password
            <input class="wa-input" id="register-password-confirm" type="password" placeholder="Re-enter password" minlength="8" required />
          </label>
          <button class="wa-button primary full" type="submit" style="margin-top: 18px;" ${state.authLoading ? 'disabled' : ''}>
            ${state.authLoading ? 'Creating Account...' : 'Create Household Account'}
          </button>
        </form>
      `}

      <div class="auth-divider">or continue with</div>

      <div class="auth-social-group">
        <button class="auth-social-btn" type="button" disabled>
          <span>Continue with Google</span>
          <span class="badge-subtle">Coming Soon</span>
        </button>
        <button class="auth-social-btn" type="button" disabled>
          <span>Continue with Facebook</span>
          <span class="badge-subtle">Coming Soon</span>
        </button>
      </div>
    </div>
  `;
}

// 1. Home Dashboard
function homeMarkup() {
  const activeList = state.groceryLists[0] || { items: [] };
  const pendingGroceries = activeList.items.filter(i => !i.is_checked).length;
  const pendingReminders = state.reminders.filter(r => !r.is_completed).length;
  const nextReminder = state.reminders.find(r => !r.is_completed);
  const netSavings = state.hisab.income - state.hisab.expense;

  return `
    <section class="hero-row">
      <div>
        <p class="eyebrow">HOUSEHOLD STATUS</p>
        <h2>Everything organized,<br><em>in one place.</em></h2>
      </div>
      <div class="progress-ring">
        <strong>${pendingGroceries}</strong>
        <small>Pending</small>
      </div>
    </section>

    <div class="quick-grid">
      <div class="stat-card" data-action="grocery">
        <div class="stat-head">
          <span class="eyebrow">GROCERY</span>
          <span class="stat-badge blue">${pendingGroceries} Items</span>
        </div>
        <p class="stat-title">${activeList.name || 'Groceries'}</p>
        <p class="stat-meta">Tap to check items</p>
      </div>

      <div class="stat-card" data-action="hisab">
        <div class="stat-head">
          <span class="eyebrow">HISAB LEDGER</span>
          <span class="stat-badge ${netSavings >= 0 ? 'emerald' : 'amber'}">${netSavings >= 0 ? 'Surplus' : 'Deficit'}</span>
        </div>
        <p class="stat-title">PKR ${Math.abs(netSavings).toLocaleString()}</p>
        <p class="stat-meta">Net Balance (${state.hisab.month})</p>
      </div>

      <div class="stat-card" data-action="reminders">
        <div class="stat-head">
          <span class="eyebrow">REMINDERS</span>
          <span class="stat-badge purple">${pendingReminders} Due</span>
        </div>
        <p class="stat-title">Bills & Tasks</p>
        <p class="stat-meta">${nextReminder ? 'Next: ' + nextReminder.title : 'No pending alerts'}</p>
      </div>

      <div class="stat-card" data-action="profile">
        <div class="stat-head">
          <span class="eyebrow">HOUSEHOLD</span>
          <span class="stat-badge">Active</span>
        </div>
        <p class="stat-title">${state.household.name}</p>
        <p class="stat-meta">Manage family access</p>
      </div>
    </div>

    <section class="section-heading" style="margin-top: 24px;">
      <div><p class="eyebrow">SHARED LIST</p><h3>${activeList.name || 'Groceries'}</h3></div>
      <button class="wa-button quiet" data-action="grocery">View All ${symbol('arrow')}</button>
    </section>

    <div class="checklist card">
      ${activeList.items.length === 0 ? '<p class="empty-state">No grocery items. Add one below.</p>' : ''}
      ${activeList.items.slice(0, 5).map(item => `
        <label class="check-item ${item.is_checked ? 'done' : ''}">
          <input type="checkbox" ${item.is_checked ? 'checked' : ''} data-toggle-grocery="${item.id}" />
          <span>${item.name}</span>
          <span class="qty">${item.quantity} ${item.unit}</span>
        </label>
      `).join('')}
    </div>
  `;
}

// 2. Grocery Module View
function groceryMarkup() {
  const activeList = state.groceryLists.find(l => l.id === state.activeGroceryListId) || state.groceryLists[0] || { items: [] };

  return `
    <div class="module-tabs">
      ${state.groceryLists.map(list => `
        <button class="tab-pill ${list.id === activeList.id ? 'active' : ''}" data-select-list="${list.id}">${list.name}</button>
      `).join('')}
    </div>

    <div class="action-bar">
      <form id="add-grocery-form" class="inline-form">
        <input class="wa-input" id="grocery-item-input" placeholder="Add item (e.g. Basmati Rice 5kg)..." required />
        <button class="wa-button primary" type="submit">+ Add</button>
      </form>
    </div>

    <div class="checklist card" style="margin-top: 14px;">
      ${activeList.items.length === 0 ? '<p class="empty-state">No items in this list yet.</p>' : ''}
      ${activeList.items.map(item => `
        <label class="check-item ${item.is_checked ? 'done' : ''}">
          <input type="checkbox" ${item.is_checked ? 'checked' : ''} data-toggle-grocery="${item.id}" />
          <span>${item.name}</span>
          <span class="qty">${item.quantity} ${item.unit}</span>
        </label>
      `).join('')}
    </div>

    <div class="floating-action-box" style="margin-top: 20px;">
      <button class="wa-button emerald full" data-action="export_whatsapp">Share List on WhatsApp</button>
    </div>
  `;
}

// 3. Hisab Module View
function hisabMarkup() {
  const net = state.hisab.income - state.hisab.expense;

  return `
    <div class="hisab-summary-cards">
      <div class="summary-box green">
        <small>TOTAL INCOME</small>
        <strong>PKR ${state.hisab.income.toLocaleString()}</strong>
      </div>
      <div class="summary-box red">
        <small>TOTAL EXPENSES</small>
        <strong>PKR ${state.hisab.expense.toLocaleString()}</strong>
      </div>
      <div class="summary-box net">
        <small>NET BALANCE</small>
        <strong>PKR ${net.toLocaleString()}</strong>
      </div>
    </div>

    <div class="section-heading" style="margin-top: 20px;">
      <div><p class="eyebrow">MONTHLY FLOW</p><h3>Recent Transactions</h3></div>
      <button class="wa-button primary" data-action="new_expense">+ Add Entry</button>
    </div>

    ${state.hisab.transactions.length === 0 ? `
      <div class="card" style="padding: 24px; text-align: center; color: var(--muted); margin-bottom: 20px;">
        <p style="margin: 0; font-weight: 500;">No transactions recorded this month.</p>
        <small>Tap "+ Add Entry" above to record income or expenses.</small>
      </div>
    ` : `
      <div class="record-list">
        ${state.hisab.transactions.map(t => `
          <div class="record-card card">
            <div class="record-icon ${t.type === 'income' ? 'emerald' : 'rose'}">${t.type === 'income' ? '+' : '-'}</div>
            <div class="record-main">
              <div class="record-top">
                <span class="tag ${t.type === 'income' ? 'emerald' : 'rose'}">${t.category}</span>
                <small>${t.date}</small>
              </div>
              <h3>${t.title}</h3>
              <p class="record-amount ${t.type === 'income' ? 'income' : 'expense'}">${t.type === 'income' ? '+' : '-'} PKR ${t.amount.toLocaleString()}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `}

    <div class="section-heading" style="margin-top: 28px;">
      <div><p class="eyebrow">UDHAAR & KHATA</p><h3>Debts & Receivables</h3></div>
    </div>

    ${state.hisab.debts.length === 0 ? `
      <div class="card" style="padding: 24px; text-align: center; color: var(--muted);">
        <p style="margin: 0; font-weight: 500;">No pending debts or receivables.</p>
        <small>All household borrowings and lendings are settled.</small>
      </div>
    ` : `
      <div class="record-list">
        ${state.hisab.debts.map(d => `
          <div class="record-card card">
            <div class="record-icon ${d.direction === 'lent' ? 'amber' : 'purple'}">${d.direction === 'lent' ? 'TO GET' : 'TO PAY'}</div>
            <div class="record-main">
              <div class="record-top">
                <span class="tag ${d.direction === 'lent' ? 'amber' : 'purple'}">${d.direction === 'lent' ? 'Lent' : 'Borrowed'}</span>
                <strong>PKR ${(d.amount - d.paid).toLocaleString()}</strong>
              </div>
              <h3>${d.person}</h3>
              <p>Due: ${d.due} · Phone: ${d.phone}</p>
              ${d.direction === 'lent' ? `<button class="wa-button quiet" style="margin-top: 8px;" data-whatsapp-debt="${d.id}">Send WhatsApp Reminder</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

// 4. Reminders Module View
function remindersMarkup() {
  const pending = state.reminders.filter(r => !r.is_completed);
  const completed = state.reminders.filter(r => r.is_completed);

  return `
    <div class="section-heading">
      <div><p class="eyebrow">SCHEDULE</p><h3>Upcoming Alerts (${pending.length})</h3></div>
      <button class="wa-button primary" data-action="new_reminder">+ Set Alert</button>
    </div>

    ${state.reminders.length === 0 ? `
      <div class="card" style="padding: 28px; text-align: center; color: var(--muted);">
        <p style="margin: 0; font-weight: 500;">No active reminders or alerts.</p>
        <small>Tap "+ Set Alert" above to create bill reminders, medicine alerts, or renewals.</small>
      </div>
    ` : `
      <div class="record-list">
        ${pending.map(r => `
          <div class="record-card card" style="cursor: pointer;" data-toggle-reminder="${r.id}">
            <div class="record-icon purple">[R]</div>
            <div class="record-main">
              <div class="record-top">
                <span class="tag purple">${r.category}</span>
                <small>${r.recurrence}</small>
              </div>
              <h3>${r.title}</h3>
              <p>Due: ${r.due}</p>
            </div>
          </div>
        `).join('')}

        ${completed.length > 0 ? `
          <div class="section-heading" style="margin-top: 24px;">
            <div><p class="eyebrow">PAST</p><h3>Completed Tasks</h3></div>
          </div>
          ${completed.map(r => `
            <div class="record-card card" style="opacity: 0.6; cursor: pointer;" data-toggle-reminder="${r.id}">
              <div class="record-icon emerald">[OK]</div>
              <div class="record-main">
                <h3 style="text-decoration: line-through;">${r.title}</h3>
                <p>Completed (${r.recurrence})</p>
              </div>
            </div>
          `).join('')}
        ` : ''}
      </div>
    `}
  `;
}

// 5. New Expense Form
function newExpenseMarkup() {
  return `
    <button class="back-link" data-action="hisab">${symbol('back')} Cancel</button>
    <div class="form-card card">
      <p class="eyebrow accent">QUICK ENTRY</p>
      <h2>Record Transaction</h2>
      <form id="expense-form">
        <label>Type
          <select class="wa-select" id="expense-type">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <label>Amount (PKR)
          <input class="wa-input" type="number" id="expense-amount" placeholder="e.g. 2500" required />
        </label>
        <label>Description / Item Name
          <input class="wa-input" id="expense-title" placeholder="e.g. Groceries at Metro" required />
        </label>
        <label>Category
          <select class="wa-select" id="expense-category">
            <option>Groceries</option>
            <option>Housing / Rent</option>
            <option>Utilities & Bills</option>
            <option>Transport & Fuel</option>
            <option>Medical & Health</option>
            <option>Salary / Income</option>
            <option>Other</option>
          </select>
        </label>
        <button class="wa-button primary full" type="submit" style="margin-top: 16px;">Save Entry</button>
      </form>
    </div>
  `;
}

// 6. New Reminder Form
function newReminderMarkup() {
  return `
    <button class="back-link" data-action="reminders">${symbol('back')} Cancel</button>
    <div class="form-card card">
      <p class="eyebrow accent">SCHEDULE ALERT</p>
      <h2>Set New Reminder</h2>
      <form id="reminder-form">
        <label>Title
          <input class="wa-input" id="reminder-title" placeholder="e.g. Renew Vehicle Token" required />
        </label>
        <label>Category
          <select class="wa-select" id="reminder-category">
            <option>Bill</option>
            <option>Health & Medicine</option>
            <option>Renewal</option>
            <option>Maintenance</option>
            <option>Birthday / Occasion</option>
          </select>
        </label>
        <label>Due Date
          <input class="wa-input" type="date" id="reminder-due" required />
        </label>
        <label>Repeat
          <select class="wa-select" id="reminder-recurrence">
            <option value="None">Does not repeat</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </label>
        <button class="wa-button primary full" type="submit" style="margin-top: 16px;">Save Reminder</button>
      </form>
    </div>
  `;
}

// 7. Profile & Settings
function profileMarkup() {
  return `
    <section class="profile-header">
      <div class="large-avatar">${getInitials(state.user.name)}</div>
      <div>
        <p class="eyebrow accent">HOUSEHOLD OWNER</p>
        <h2>${state.user.name || 'Household User'}</h2>
        <p class="muted">${state.user.email || 'Registered User'}</p>
      </div>
    </section>

    <div class="menu-card card">
      <div class="setting-row" style="padding: 12px 16px;">
        <span><strong>Appearance</strong><small>Toggle light or dark theme</small></span>
        <select class="wa-select" data-theme-select>
          <option value="light" ${state.theme === 'light' ? 'selected' : ''}>Light</option>
          <option value="dark" ${state.theme === 'dark' ? 'selected' : ''}>Dark</option>
        </select>
      </div>
      <button class="menu-row" data-action="share_household">
        <span class="menu-text"><strong>Invite Family Member</strong><small>Share grocery and hisab access</small></span>
        <span class="menu-arrow">${symbol('arrow')}</span>
      </button>
      <button class="menu-row" data-action="export_backup">
        <span class="menu-text"><strong>Export Household Backup</strong><small>Download offline JSON summary</small></span>
        <span class="menu-arrow">${symbol('arrow')}</span>
      </button>
    </div>

    <button class="wa-button secondary full" data-action="logout" style="margin-top: 20px;">Sign Out</button>
  `;
}

function wire() {
  // Navigation actions
  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => act(el.dataset.action));
  });

  // Auth tab toggle
  document.querySelectorAll('[data-auth-tab]').forEach(el => {
    el.addEventListener('click', () => {
      state.authTab = el.dataset.authTab;
      state.authError = '';
      render();
    });
  });

  // Sign In Form Submit
  const loginForm = document.querySelector('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.querySelector('#login-email')?.value.trim();
      const password = document.querySelector('#login-password')?.value;

      if (!email || !password) return;

      state.authLoading = true;
      state.authError = '';
      render();

      try {
        const res = await AuthApi.login({ email, password });
        if (res?.meta?.token) {
          api.setToken(res.meta.token);
          if (res.data?.attributes) {
            state.user.name = res.data.attributes.name;
            state.user.email = res.data.attributes.email;
          }
          if (res.meta?.household) {
            state.household = res.meta.household;
            api.setHousehold(res.meta.household.id);
          }
          await fetchTenantData();
          state.screen = 'home';
          showToast('Welcome back, ' + state.user.name);
        } else {
          throw new Error('Invalid server response');
        }
      } catch (err) {
        state.authError = err.message || 'Authentication failed. Please check credentials.';
      } finally {
        state.authLoading = false;
        render();
      }
    });
  }

  // Sign Up Form Submit
  const registerForm = document.querySelector('#register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.querySelector('#register-name')?.value.trim();
      const email = document.querySelector('#register-email')?.value.trim();
      const password = document.querySelector('#register-password')?.value;
      const passwordConfirm = document.querySelector('#register-password-confirm')?.value;

      if (password !== passwordConfirm) {
        state.authError = 'Passwords do not match.';
        render();
        return;
      }

      state.authLoading = true;
      state.authError = '';
      render();

      try {
        const res = await AuthApi.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirm
        });

        if (res?.meta?.token) {
          api.setToken(res.meta.token);
          if (res.data?.attributes) {
            state.user.name = res.data.attributes.name;
            state.user.email = res.data.attributes.email;
          }
          if (res.meta?.household) {
            state.household = res.meta.household;
            api.setHousehold(res.meta.household.id);
          }
          await fetchTenantData();
          state.screen = 'home';
          showToast('Account created successfully!');
        } else {
          throw new Error('Registration failed');
        }
      } catch (err) {
        state.authError = err.message || 'Registration failed. Please try again.';
      } finally {
        state.authLoading = false;
        render();
      }
    });
  }

  // Grocery list selector
  document.querySelectorAll('[data-select-list]').forEach(el => {
    el.addEventListener('click', () => {
      state.activeGroceryListId = parseInt(el.dataset.selectList, 10);
      render();
    });
  });

  // Grocery toggle
  document.querySelectorAll('[data-toggle-grocery]').forEach(el => {
    el.addEventListener('click', async () => {
      const id = parseInt(el.dataset.toggleGrocery, 10);
      const list = state.groceryLists.find(l => l.id === state.activeGroceryListId) || state.groceryLists[0];
      const item = list.items.find(i => i.id === id);
      if (item) {
        item.is_checked = !item.is_checked;
        showToast(item.is_checked ? 'Item marked bought' : 'Item marked pending');
        render();
        try {
          await GroceryApi.toggleItem(state.household.id, list.id, item.id);
        } catch (err) {
          console.warn('Sync failed for grocery toggle:', err.message);
        }
      }
    });
  });

  // Reminder toggle
  document.querySelectorAll('[data-toggle-reminder]').forEach(el => {
    el.addEventListener('click', async () => {
      const id = parseInt(el.dataset.toggleReminder, 10);
      const r = state.reminders.find(rem => rem.id === id);
      if (r) {
        r.is_completed = !r.is_completed;
        showToast(r.is_completed ? 'Reminder marked completed' : 'Reminder active');
        render();
        try {
          await RemindersApi.toggleReminder(state.household.id, r.id);
        } catch (err) {
          console.warn('Sync failed for reminder toggle:', err.message);
        }
      }
    });
  });

  // Add grocery form submit
  const groceryForm = document.querySelector('#add-grocery-form');
  if (groceryForm) {
    groceryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.querySelector('#grocery-item-input');
      if (input && input.value.trim()) {
        const list = state.groceryLists.find(l => l.id === state.activeGroceryListId) || state.groceryLists[0];
        const nameVal = input.value.trim();
        const tempItem = {
          id: Date.now(),
          name: nameVal,
          quantity: 1,
          unit: 'pcs',
          category: 'General',
          is_checked: false
        };
        list.items.unshift(tempItem);
        showToast('Item added to list');
        render();

        try {
          const res = await GroceryApi.addItem(state.household.id, list.id, {
            name: nameVal,
            quantity: 1,
            unit: 'pcs',
            category: 'General'
          });
          if (res?.data?.id) {
            tempItem.id = res.data.id;
          }
        } catch (err) {
          console.warn('Sync failed for add item:', err.message);
        }
      }
    });
  }

  // Expense form submit
  const expenseForm = document.querySelector('#expense-form');
  if (expenseForm) {
    expenseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = parseFloat(document.querySelector('#expense-amount').value);
      const title = document.querySelector('#expense-title').value.trim();
      const type = document.querySelector('#expense-type').value;
      const category = document.querySelector('#expense-category').value;

      state.hisab.transactions.unshift({
        id: Date.now(),
        title,
        amount,
        type,
        category,
        date: 'Today'
      });

      if (type === 'income') {
        state.hisab.income += amount;
      } else {
        state.hisab.expense += amount;
      }

      showToast('Transaction saved');
      state.screen = 'hisab';
      render();

      try {
        await HisabApi.addTransaction(state.household.id, {
          type,
          amount,
          category,
          notes: title,
          payment_method: 'Cash',
          transaction_date: new Date().toISOString().slice(0, 10)
        });
      } catch (err) {
        console.warn('Sync failed for transaction:', err.message);
      }
    });
  }

  // Reminder form submit
  const reminderForm = document.querySelector('#reminder-form');
  if (reminderForm) {
    reminderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.querySelector('#reminder-title').value.trim();
      const category = document.querySelector('#reminder-category').value;
      const due = document.querySelector('#reminder-due').value;
      const recurrence = document.querySelector('#reminder-recurrence').value;

      state.reminders.unshift({
        id: Date.now(),
        title,
        category,
        due: due || 'Upcoming',
        recurrence: recurrence || 'none',
        is_completed: false
      });

      showToast('Reminder saved');
      state.screen = 'reminders';
      render();

      try {
        await RemindersApi.createReminder(state.household.id, {
          title,
          category,
          due_at: due ? new Date(due).toISOString() : new Date().toISOString(),
          recurrence_rule: recurrence || 'none'
        });
      } catch (err) {
        console.warn('Sync failed for reminder:', err.message);
      }
    });
  }

  // Debt WhatsApp
  document.querySelectorAll('[data-whatsapp-debt]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const debtId = parseInt(el.dataset.whatsappDebt, 10);
      const d = state.hisab.debts.find(item => item.id === debtId);
      if (d) {
        const text = `Salam ${d.person}, this is a gentle reminder regarding the pending amount of PKR ${(d.amount - d.paid).toLocaleString()} (due ${d.due}). Please settle when convenient. Thank you! - DigEzLife`;
        const phone = d.phone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
      }
    });
  });

  // Theme select
  document.querySelector('[data-theme-select]')?.addEventListener('change', (e) => {
    state.theme = e.target.value;
    localStorage.setItem('digezlife-theme', state.theme);
    render();
  });
}

async function act(action) {
  if (action === 'logout') {
    api.setToken(null);
    api.setHousehold(null);
    state.user = { name: '', email: '' };
    state.household = { id: '', name: 'My Household' };
    state.authError = '';
    state.hisab = {
      month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      income: 0,
      expense: 0,
      transactions: [],
      debts: []
    };
    state.reminders = [];
    state.screen = 'auth';
    AuthApi.logout().catch(() => {});
    showToast('Signed out successfully');
    render();
    return;
  }

  if (action === 'login-demo') {
    state.authLoading = true;
    state.authError = '';
    render();

    try {
      const res = await AuthApi.login({ email: 'demo@digezlife.com', password: 'password123' });
      if (res?.meta?.token) {
        api.setToken(res.meta.token);
        if (res.data?.attributes) {
          state.user.name = res.data.attributes.name;
          state.user.email = res.data.attributes.email;
        }
        if (res.meta?.household) {
          state.household = res.meta.household;
          api.setHousehold(res.meta.household.id);
        }
        await fetchTenantData();
        state.screen = 'home';
        showToast('Signed into Demo Household');
      }
    } catch (err) {
      state.authError = err.message || 'Demo login failed';
    } finally {
      state.authLoading = false;
      render();
    }
    return;
  }

  if (action === 'export_whatsapp') {
    const list = state.groceryLists.find(l => l.id === state.activeGroceryListId) || state.groceryLists[0];
    const pending = list.items.filter(i => !i.is_checked);
    let text = `*DigEzLife Grocery List: ${list.name}*\n\n`;
    pending.forEach(i => {
      text += `- [ ] ${i.name} (${i.quantity} ${i.unit})\n`;
    });
    text += `\nShared via DigEzLife (https://digezlife.app)`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    return;
  }

  if (action === 'share_household') {
    navigator.clipboard?.writeText(`https://digezlife.app/invite/${state.household.id}`);
    showToast('Household invite link copied to clipboard');
    return;
  }

  if (action === 'export_backup') {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `digezlife-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup downloaded');
    return;
  }

  state.screen = action;
  render();
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2400);
  }
}

async function fetchTenantData() {
  const hid = state.household.id || api.currentHousehold;
  if (!hid) return;

  try {
    // Fetch Lists
    const listsRes = await GroceryApi.getLists(hid).catch(() => null);
    if (listsRes?.data && listsRes.data.length > 0) {
      const lists = [];
      for (const l of listsRes.data) {
        const detail = await GroceryApi.getList(hid, l.id).catch(() => null);
        lists.push({
          id: l.id,
          name: l.name,
          items: detail?.data?.items || []
        });
      }
      state.groceryLists = lists;
      state.activeGroceryListId = lists[0].id;
    }

    // Fetch Hisab
    const [summaryRes, txnRes, debtsRes] = await Promise.all([
      HisabApi.getSummary(hid).catch(() => null),
      HisabApi.getTransactions(hid).catch(() => null),
      HisabApi.getDebts(hid).catch(() => null)
    ]);

    if (summaryRes?.data) {
      state.hisab.income = summaryRes.data.total_income || 0;
      state.hisab.expense = summaryRes.data.total_expense || 0;
    } else {
      state.hisab.income = 0;
      state.hisab.expense = 0;
    }

    if (txnRes?.data) {
      state.hisab.transactions = txnRes.data.map(t => ({
        id: t.id,
        title: t.notes || t.category,
        amount: parseFloat(t.amount),
        type: t.type,
        category: t.category,
        date: t.transaction_date || 'Today'
      }));
    } else {
      state.hisab.transactions = [];
    }

    if (debtsRes?.data) {
      state.hisab.debts = debtsRes.data.map(d => ({
        id: d.id,
        person: d.person_name,
        phone: d.person_phone || 'N/A',
        amount: parseFloat(d.amount),
        paid: parseFloat(d.paid_amount || 0),
        due: d.due_date || 'No Date',
        direction: d.direction
      }));
    } else {
      state.hisab.debts = [];
    }

    // Fetch Reminders
    const remindersRes = await RemindersApi.getReminders(hid).catch(() => null);
    if (remindersRes?.data) {
      state.reminders = remindersRes.data.map(r => ({
        id: r.id,
        title: r.title,
        due: r.due_at ? r.due_at.slice(0, 10) : 'Ongoing',
        recurrence: r.recurrence_rule || 'none',
        category: r.category || 'General',
        is_completed: !!r.is_completed
      }));
    } else {
      state.reminders = [];
    }
  } catch (err) {
    console.warn('[LiveSync] Fetch failed:', err.message);
  }
}

async function initLiveSync() {
  try {
    if (!api.token) {
      state.screen = 'auth';
      render();
      return;
    }

    // Verify session
    const meRes = await AuthApi.me().catch(() => null);
    if (!meRes || !meRes.data) {
      api.setToken(null);
      api.setHousehold(null);
      state.screen = 'auth';
      render();
      return;
    }

    if (meRes.data?.attributes) {
      state.user.name = meRes.data.attributes.name;
      state.user.email = meRes.data.attributes.email;
    }

    if (meRes.meta?.household) {
      state.household = meRes.meta.household;
      api.setHousehold(meRes.meta.household.id);
    }

    await fetchTenantData();
    state.screen = 'home';
    render();
  } catch (err) {
    console.warn('[LiveSync] Running in fallback mode:', err.message);
    render();
  }
}

window.addEventListener('online', () => { state.online = true; render(); });
window.addEventListener('offline', () => { state.online = false; render(); });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});

render();
initLiveSync();

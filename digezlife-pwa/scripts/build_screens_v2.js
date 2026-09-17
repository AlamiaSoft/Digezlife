const fs = require('fs');
const path = require('path');

const futureDoc = `# Future Improvements & Technical Roadmap

## Task: Centralized Single-Source-of-Truth (SSOT) Brand Configuration

### 1. Objective
Eliminate hardcoded brand strings, domain URLs, app mark letters, and product names across the codebase by decoupling them into environment variables (\`.env\`) and a central branding module (\`src/config/brand.js\`).

### 2. Proposed Architecture

#### A. Environment Variables (\`.env\` / \`.env.example\`)
\`\`\`bash
VITE_APP_NAME="GharlyApp"
VITE_APP_BRAND_SHORT="Gharly"
VITE_APP_MARK="G"
VITE_APP_DOMAIN="gharlyapp.com"
VITE_APP_URL="https://gharlyapp.com"
VITE_APP_TAGLINE="Your Home, Made Easier"
VITE_APP_SLOGAN="Everything for your everyday home."
VITE_APP_SUPPORT_EMAIL="support@gharlyapp.com"
VITE_APP_DEMO_EMAIL="demo@gharlyapp.com"
\`\`\`

#### B. Central Branding Module (\`src/config/brand.js\`)
\`\`\`javascript
export const BRAND = Object.freeze({
  name: import.meta.env.VITE_APP_NAME || 'GharlyApp',
  shortName: import.meta.env.VITE_APP_BRAND_SHORT || 'Gharly',
  mark: import.meta.env.VITE_APP_MARK || 'G',
  domain: import.meta.env.VITE_APP_DOMAIN || 'gharlyapp.com',
  url: import.meta.env.VITE_APP_URL || 'https://gharlyapp.com',
  tagline: import.meta.env.VITE_APP_TAGLINE || 'Your Home, Made Easier',
  slogan: import.meta.env.VITE_APP_SLOGAN || 'Everything for your everyday home.',
  demoEmail: import.meta.env.VITE_APP_DEMO_EMAIL || 'demo@gharlyapp.com',
  supportEmail: import.meta.env.VITE_APP_SUPPORT_EMAIL || 'support@gharlyapp.com',
  products: {
    grocery: \`\${import.meta.env.VITE_APP_BRAND_SHORT || 'Gharly'} Grocery\`,
    hisab: \`\${import.meta.env.VITE_APP_BRAND_SHORT || 'Gharly'} Hisab\`,
    alerts: \`\${import.meta.env.VITE_APP_BRAND_SHORT || 'Gharly'} Alerts\`,
    family: \`\${import.meta.env.VITE_APP_BRAND_SHORT || 'Gharly'} Family\`,
  },
  getInviteUrl: (householdId) => \`https://\${import.meta.env.VITE_APP_DOMAIN || 'gharlyapp.com'}/invite/\${householdId}\`,
  getBackupFilename: (prefix = 'backup') => \`\${(import.meta.env.VITE_APP_NAME || 'gharlyapp').toLowerCase()}-\${prefix}-\${new Date().toISOString().slice(0, 10)}.json\`,
});
\`\`\`

#### C. Dynamic Translation Interpolation (\`src/i18n/\`)
Update the translation engine to automatically inject global brand parameters:
\`\`\`javascript
// Dictionaries use placeholders:
// "signin_title": "Sign in to {appName}"
// "signup_title": "Join {appName}"

export function t(keyPath, params = {}) {
  const mergedParams = {
    appName: BRAND.name,
    appShort: BRAND.shortName,
    appDomain: BRAND.domain,
    appUrl: BRAND.url,
    appTagline: BRAND.tagline,
    ...params,
  };
  // Automatically resolves {appName} etc. across all languages
}
\`\`\`

#### D. HTML & Manifest Dynamic Injection
Use Vite's built-in HTML env variable replacement:
\`\`\`html
<!-- index.html -->
<title>%VITE_APP_NAME% - %VITE_APP_TAGLINE%</title>
<meta name="description" content="%VITE_APP_NAME% - %VITE_APP_SLOGAN%" />
\`\`\`

### 3. Key Benefits
- **Zero-Code Rebranding / White-labeling**: Change brand name, URLs, or marks in one file (\`.env\`), and the entire application updates automatically.
- **Maintainability**: Eliminates drift and typos across multiple screen files.
- **Multi-Environment Ready**: Test staging vs production domains seamlessly.
`;

const target = path.resolve(__dirname, '..', '..', 'docs', 'planning', 'future-improvements.md');
fs.writeFileSync(target, futureDoc, 'utf8');
console.log('Written:', target);
process.exit(0);


// 2. app-topbar.js
replaceInFile('src/components/app-topbar.js', [
  ['DigEzLife', 'Gharly'],
  ['app-brand-mark">D<', 'app-brand-mark">G<']
]);

// 3. splash.js
replaceInFile('src/screens/splash.js', [
  ['DigEzLife', 'Gharly'],
  ['Everyday Household OS', 'Your Home, Made Easier']
]);

// 4. landing.js
replaceInFile('src/screens/landing.js', [
  ['DigEzLife', 'Gharly'],
  ['Everyday Household OS', 'Your Home, Made Easier'],
  ['Shared Grocery Lists', 'Gharly Grocery'],
  ['Personal Hisab & Udhaar', 'Gharly Hisab'],
  ['Family & Household Alerts', 'Gharly Alerts'],
  ['digezlife.app', 'gharlyapp.com']
]);

// 5. onboarding.js
replaceInFile('src/screens/onboarding.js', [
  ['DigEzLife', 'Gharly']
]);

// 6. auth-login.js & auth-signup.js
replaceInFile('src/screens/auth-login.js', [
  ['DigEzLife', 'Gharly'],
  ['demo@digezlife.com', 'demo@gharlyapp.com']
]);
replaceInFile('src/screens/auth-signup.js', [
  ['DigEzLife', 'Gharly']
]);

// 7. settings.js
replaceInFile('src/screens/settings.js', [
  ['DigEzLife Household OS', 'Gharly Household OS'],
  ['user@digezlife.com', 'user@gharlyapp.com'],
  ['digezlife-backup', 'gharly-backup'],
  ['DigEzLife', 'Gharly']
]);

// 8. share.js
replaceInFile('src/screens/share.js', [
  ['https://digezlife.app/invite/', 'https://gharlyapp.com/invite/'],
  ['on DigEzLife', 'on Gharly']
]);

// 9. grocery.js & hisab.js
replaceInFile('src/screens/grocery.js', [
  ['*DigEzLife Grocery List:', '*Gharly Grocery List:'],
  ['via DigEzLife (https://digezlife.app)', 'via Gharly (https://gharlyapp.com)']
]);
replaceInFile('src/screens/hisab.js', [
  ['- DigEzLife', '- Gharly']
]);

// 10. i18n locales
const localesDir = path.resolve(__dirname, '..', 'src', 'i18n', 'locales');
if (fs.existsSync(localesDir)) {
  fs.readdirSync(localesDir).forEach(file => {
    if (file.endsWith('.json')) {
      replaceInFile(path.join('src', 'i18n', 'locales', file), [
        ['DigEzLife', 'Gharly'],
        ['Everyday Household OS', 'Your Home, Made Easier'],
        ['Everyday life, organized in one place.', 'Your home, made easier. Everything for your everyday home.']
      ]);
    }
  });
}

console.log('Brand rename to GharlyApp complete.');
          <p style="font-size:0.85rem; color:var(--wa-color-text-quiet); margin-top:0.35rem;">
            Zero complex configuration. Add your household members with one link and manage your everyday essentials together.
          </p>
          <a class="wa-button primary" href="#/signup" style="margin-top:1rem; width:100%;">
            Create Your Free Household
          </a>
        </section>

        <!-- Footer -->
        <footer class="landing-footer text-quiet" style="padding:2rem 1rem 3rem; text-align:center; font-size:0.8rem;">
          <p>DigEzLife &bull; Everyday Household OS</p>
          <p style="margin-top:0.35rem; font-size:0.75rem;">Made with precision for Pakistani households</p>
        </footer>
      </div>
    \`;
  },
};
`);

// ==========================================
// 2. src/screens/onboarding.js (3-Step Setup)
// ==========================================
write('screens/onboarding.js', `
import { navigate } from '../state/router.js';
import { icon } from '../components/icon.js';
import { writeLocal } from '../services/storage.js';

export const onboardingScreen = {
  meta: { topbar: null, nav: null },

  render() {
    return \`
      <div class="screen screen--flush onboarding-screen">
        <div class="onboarding-container" id="onboarding-track">
          <!-- Step 1: Welcome -->
          <div class="onboarding-step" data-step="1">
            <div class="onboarding-step__hero">
              <div class="onboarding-step__icon">
                <span class="app-brand-mark" style="width:4.5rem; height:4.5rem; font-size:2rem;">D</span>
              </div>
              <h2>Welcome to DigEzLife</h2>
              <p class="text-quiet" style="font-size:0.95rem; max-width:300px; margin:0.5rem auto 0;">
                Your everyday groceries, hisab, and household reminders in one simple mobile app.
              </p>
            </div>
            <div class="onboarding-step__footer">
              <wa-button variant="brand" size="large" style="width:100%;" data-next-step="2">
                Continue &rarr;
              </wa-button>
            </div>
          </div>

          <!-- Step 2: Choose Utilities -->
          <div class="onboarding-step" data-step="2" style="display:none;">
            <div class="onboarding-step__hero">
              <span class="wa-tag badge-emerald" style="margin-bottom:0.5rem;">STEP 2 OF 3</span>
              <h2>What will you use?</h2>
              <p class="text-quiet" style="font-size:0.85rem; margin-top:0.25rem;">
                Select the household utilities you'd like to organize:
              </p>

              <div class="stack" style="gap:0.65rem; margin-top:1.25rem; text-align:left; width:100%;">
                <label class="card list-row" style="cursor:pointer; padding:0.85rem;">
                  <wa-checkbox checked style="flex:0 0 auto;"></wa-checkbox>
                  <div class="list-row__body">
                    <div class="list-row__title">Grocery & Ration Lists</div>
                    <div class="list-row__subtitle">Shared checklists & WhatsApp export</div>
                  </div>
                </label>

                <label class="card list-row" style="cursor:pointer; padding:0.85rem;">
                  <wa-checkbox checked style="flex:0 0 auto;"></wa-checkbox>
                  <div class="list-row__body">
                    <div class="list-row__title">Daily Hisab & Khata</div>
                    <div class="list-row__subtitle">Income, spending, & debt reminders</div>
                  </div>
                </label>

                <label class="card list-row" style="cursor:pointer; padding:0.85rem;">
                  <wa-checkbox checked style="flex:0 0 auto;"></wa-checkbox>
                  <div class="list-row__body">
                    <div class="list-row__title">Bills & Due Alerts</div>
                    <div class="list-row__subtitle">Electricity, token tax, & renewals</div>
                  </div>
                </label>
              </div>
            </div>

            <div class="onboarding-step__footer">
              <wa-button variant="brand" size="large" style="width:100%;" data-next-step="3">
                Continue to Setup &rarr;
              </wa-button>
            </div>
          </div>

          <!-- Step 3: Household Setup -->
          <div class="onboarding-step" data-step="3" style="display:none;">
            <div class="onboarding-step__hero">
              <span class="wa-tag badge-purple" style="margin-bottom:0.5rem;">STEP 3 OF 3</span>
              <h2>Set Up Your Household</h2>
              <p class="text-quiet" style="font-size:0.85rem; margin-top:0.25rem;">
                Create your household space to start adding items:
              </p>

              <div class="stack" style="gap:0.75rem; margin-top:1.5rem; text-align:left; width:100%;">
                <wa-input label="Household Name" value="My Household" id="onboarding-household-name" required></wa-input>
              </div>
            </div>

            <div class="onboarding-step__footer stack" style="gap:0.5rem;">
              <wa-button variant="brand" size="large" style="width:100%;" id="btn-finish-onboarding">
                Get Started &rarr;
              </wa-button>
              <wa-button appearance="outlined" size="medium" style="width:100%;" id="btn-login-existing">
                Already have an account? Sign In
              </wa-button>
            </div>
          </div>
        </div>
      </div>
    \`;
  },

  afterRender() {
    writeLocal('onboarding.seen', true);

    const showStep = (num) => {
      document.querySelectorAll('.onboarding-step').forEach((el) => {
        el.style.display = el.dataset.step === String(num) ? 'flex' : 'none';
      });
    };

    document.querySelectorAll('[data-next-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.nextStep;
        showStep(next);
      });
    });

    document.getElementById('btn-finish-onboarding')?.addEventListener('click', () => {
      navigate('/signup');
    });

    document.getElementById('btn-login-existing')?.addEventListener('click', () => {
      navigate('/login');
    });
  },
};
`);

// ==========================================
// 3. src/screens/home.js (Action/Attention Dashboard)
// ==========================================
write('screens/home.js', `
import { navigate } from '../state/router.js';
import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return t('greetings.morning');
  if (hour < 17) return t('greetings.afternoon');
  return t('greetings.evening');
}

export const homeScreen = {
  meta: { topbar: { showBrand: true }, nav: 'home' },

  render() {
    const { user, household } = authStore.get();
    const householdName = household?.name || 'My Household';
    const userName = user?.name ? user.name.split(' ')[0] : 'there';
    const greeting = \`\${getTimeGreeting()}, \${userName}\`;

    return \`
      <div class="screen home-screen">
        <!-- Greeting Header -->
        <section class="home-greeting-row">
          <div>
            <span class="home-hero__badge"><span class="status-dot status-dot--active"></span> \${householdName}</span>
            <h2 class="home-greeting-title">\${greeting}</h2>
          </div>
        </section>

        <!-- ATTENTION AREA: What needs attention right now? -->
        <div class="card home-attention-card" id="home-attention-box">
          <div class="home-attention-card__inner">
            <div class="list-row__icon" id="attention-icon" style="background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet);">
              \${icon('sparkles')}
            </div>
            <div style="flex:1; min-width:0;">
              <div class="home-attention-card__headline" id="attention-headline">\${t('greetings.whats_happening')}</div>
              <div class="home-attention-card__sub text-quiet" id="attention-sub">Checking your household tasks...</div>
            </div>
          </div>
        </div>

        <!-- 1-TAP QUICK ACTIONS -->
        <section class="home-section" style="margin-top:1.25rem;">
          <div class="home-quick-actions-bar">
            <a class="home-action-btn" href="#/hisab">
              <span class="home-action-btn__icon bg-green">\${icon('plus')}</span>
              <span>\${t('home.add_expense')}</span>
            </a>
            <a class="home-action-btn" href="#/grocery">
              <span class="home-action-btn__icon bg-blue">\${icon('cart-shopping')}</span>
              <span>\${t('home.add_grocery')}</span>
            </a>
            <a class="home-action-btn" href="#/reminders">
              <span class="home-action-btn__icon bg-purple">\${icon('bell')}</span>
              <span>\${t('home.add_alert')}</span>
            </a>
            <a class="home-action-btn" href="#/share">
              <span class="home-action-btn__icon bg-amber">\${icon('user-plus')}</span>
              <span>\${t('home.invite_family')}</span>
            </a>
          </div>
        </section>

        <!-- UTILITY STATS OVERVIEW -->
        <div class="home-stats-grid" id="home-stats" style="margin-top:1.25rem;">
          <a class="home-stat-card card" href="#/grocery">
            <div class="home-stat-card__head">
              <span class="home-stat-card__label">\${t('nav.grocery').toUpperCase()}</span>
              <span class="home-stat-card__badge badge-blue" id="home-stat-grocery-badge">Loading...</span>
            </div>
            <div class="home-stat-card__value" id="home-stat-grocery-title">Weekly Essentials</div>
            <div class="home-stat-card__meta text-quiet">Tap to view checklist</div>
          </a>

          <a class="home-stat-card card" href="#/hisab">
            <div class="home-stat-card__head">
              <span class="home-stat-card__label">\${t('hisab.this_month').toUpperCase()}</span>
              <span class="home-stat-card__badge badge-emerald" id="home-stat-hisab-badge">Remaining</span>
            </div>
            <div class="home-stat-card__value" id="home-stat-hisab-val">PKR 0</div>
            <div class="home-stat-card__meta text-quiet" id="home-stat-hisab-meta">Net Balance</div>
          </a>
        </div>

        <!-- SHARED GROCERY QUICK CHECKLIST -->
        <section class="home-section" style="margin-top:1.25rem;">
          <div class="home-section__header">
            <div>
              <span class="home-section__eyebrow">ACTIVE CHECKLIST</span>
              <h3 class="home-section__title">\${t('home.shared_grocery')}</h3>
            </div>
            <a class="text-brand" href="#/grocery" style="font-size:0.85rem; font-weight:600;">\${t('home.view_all')} &rarr;</a>
          </div>

          <div class="card" id="home-grocery-preview" style="padding:0.6rem 1rem;">
            <div class="text-quiet" style="text-align:center; padding:1rem 0;">Loading grocery list...</div>
          </div>
        </section>
      </div>
    \`;
  },

  async afterRender() {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    let pendingGroceries = 0;
    let pendingReminders = 0;
    let nextReminderTitle = '';
    let netSavings = 0;

    // 1. Fetch grocery
    try {
      const listsRes = await api.getGroceryLists(hid);
      const lists = listsRes?.data || [];
      if (lists.length > 0) {
        const firstList = lists[0];
        const detailRes = await api.getGroceryList(firstList.id, hid).catch(() => null);
        const items = detailRes?.data?.items || firstList.items || [];
        const pending = items.filter((i) => !i.is_checked);
        pendingGroceries = pending.length;

        const badgeEl = document.getElementById('home-stat-grocery-badge');
        if (badgeEl) badgeEl.textContent = \`\${pendingGroceries} Pending\`;

        const titleEl = document.getElementById('home-stat-grocery-title');
        if (titleEl) titleEl.textContent = firstList.name || 'Weekly Essentials';

        const previewEl = document.getElementById('home-grocery-preview');
        if (previewEl) {
          if (items.length === 0) {
            previewEl.innerHTML = \`<p class="text-quiet" style="text-align:center; margin:0.5rem 0;">No items in list. <a href="#/grocery">Add item</a></p>\`;
          } else {
            previewEl.innerHTML = items.slice(0, 5).map((item) => \`
              <div class="grocery-row \${item.is_checked ? 'is-checked' : ''}" style="display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0; border-bottom:1px solid var(--wa-color-surface-border);">
                <label style="display:flex; align-items:center; gap:0.65rem; cursor:pointer; flex:1; min-width:0;">
                  <wa-checkbox \${item.is_checked ? 'checked' : ''} data-toggle-home="\${item.id}"></wa-checkbox>
                  <span class="grocery-item-title \${item.is_checked ? 'text-strike text-quiet' : ''}" style="font-weight:500; font-size:0.92rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">\${item.name}</span>
                </label>
                <span class="wa-tag" style="font-size:0.75rem; flex-shrink:0;">\${item.quantity || 1} \${item.unit || 'pcs'}</span>
              </div>
            \`).join('');

            previewEl.querySelectorAll('[data-toggle-home]').forEach((cb) => {
              cb.addEventListener('change', async () => {
                const itemId = cb.dataset.toggleHome;
                try {
                  await api.toggleGroceryItem(firstList.id, itemId, hid);
                  pushToast({ message: 'Item updated', variant: 'success' });
                } catch (e) {}
              });
            });
          }
        }
      }
    } catch (e) {}

    // 2. Fetch Hisab
    try {
      const summaryRes = await api.getHisabSummary(null, hid);
      if (summaryRes?.data) {
        const income = parseFloat(summaryRes.data.total_income || 0);
        const expense = parseFloat(summaryRes.data.total_expense || 0);
        netSavings = income - expense;

        const valEl = document.getElementById('home-stat-hisab-val');
        if (valEl) valEl.textContent = \`PKR \${Math.abs(netSavings).toLocaleString()}\`;

        const badgeEl = document.getElementById('home-stat-hisab-badge');
        if (badgeEl) {
          badgeEl.textContent = netSavings >= 0 ? t('hisab.surplus') : t('hisab.deficit');
          badgeEl.className = \`home-stat-card__badge \${netSavings >= 0 ? 'badge-emerald' : 'badge-rose'}\`;
        }
      }
    } catch (e) {}

    // 3. Fetch Reminders
    try {
      const remindersRes = await api.getReminders(null, hid);
      const reminders = remindersRes?.data || [];
      const pending = reminders.filter((r) => !r.is_completed);
      pendingReminders = pending.length;
      if (pending.length > 0) {
        nextReminderTitle = pending[0].title;
      }
    } catch (e) {}

    // Update Attention Area
    const headlineEl = document.getElementById('attention-headline');
    const subEl = document.getElementById('attention-sub');
    const iconEl = document.getElementById('attention-icon');

    if (headlineEl && subEl) {
      if (pendingGroceries === 0 && pendingReminders === 0) {
        headlineEl.textContent = t('greetings.all_caught_up');
        subEl.textContent = 'No pending groceries or urgent alerts today.';
        if (iconEl) iconEl.style.background = 'var(--wa-color-green-90)';
        if (iconEl) iconEl.style.color = 'var(--wa-color-green-40)';
      } else {
        const itemsMsg = [];
        if (pendingGroceries > 0) itemsMsg.push(\`\${pendingGroceries} grocery items to buy\`);
        if (pendingReminders > 0) itemsMsg.push(\`\${pendingReminders} upcoming alert\${pendingReminders > 1 ? 's' : ''}\`);
        headlineEl.textContent = itemsMsg.join(' &bull; ');
        subEl.textContent = nextReminderTitle ? \`Next due: \${nextReminderTitle}\` : 'Tap cards below to review and take action.';
      }
    }
  },
};
`);

// ==========================================
// 4. src/screens/add.js (Universal Create Bottom Sheet)
// ==========================================
write('screens/add.js', `
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';

export const addScreen = {
  meta: { topbar: { title: t('universal_create.title'), back: true }, nav: 'add' },

  render() {
    return \`
      <div class="screen add-screen">
        <div style="text-align:center; padding:0.75rem 0 1.25rem;">
          <h2>\${t('universal_create.title')}</h2>
          <p class="text-quiet" style="font-size:0.88rem; margin-top:0.3rem;">\${t('universal_create.subtitle')}</p>
        </div>

        <div class="stack" style="gap:0.75rem;">
          <a class="card list-row universal-create-row" href="#/hisab" style="padding:1rem;">
            <div class="list-row__icon" style="background:var(--wa-color-red-90); color:var(--wa-color-red-40);">
              \${icon('arrow-up-right')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title">\${t('universal_create.expense_title')}</div>
              <div class="list-row__subtitle">\${t('universal_create.expense_sub')}</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>

          <a class="card list-row universal-create-row" href="#/hisab" style="padding:1rem;">
            <div class="list-row__icon" style="background:var(--wa-color-green-90); color:var(--wa-color-green-40);">
              \${icon('arrow-down-left')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title">\${t('universal_create.income_title')}</div>
              <div class="list-row__subtitle">\${t('universal_create.income_sub')}</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>

          <a class="card list-row universal-create-row" href="#/grocery" style="padding:1rem;">
            <div class="list-row__icon" style="background:var(--wa-color-blue-90); color:var(--wa-color-blue-40);">
              \${icon('cart-shopping')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title">\${t('universal_create.grocery_title')}</div>
              <div class="list-row__subtitle">\${t('universal_create.grocery_sub')}</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>

          <a class="card list-row universal-create-row" href="#/reminders" style="padding:1rem;">
            <div class="list-row__icon" style="background:var(--wa-color-purple-90); color:var(--wa-color-purple-40);">
              \${icon('bell')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title">\${t('universal_create.reminder_title')}</div>
              <div class="list-row__subtitle">\${t('universal_create.reminder_sub')}</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>
        </div>
      </div>
    \`;
  },
};
`);

// ==========================================
// 5. src/screens/settings.js (with Multilingual Selector)
// ==========================================
write('screens/settings.js', `
import { navigate } from '../state/router.js';
import { authStore, logout, themeStore, setThemeMode, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { LOCALES } from '../i18n/locales.js';
import { getLocale, setLocale, t } from '../i18n/index.js';

function getInitials(name) {
  if (!name) return 'DL';
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

export const settingsScreen = {
  meta: { topbar: { title: 'Settings & Household', back: true }, nav: 'home' },

  render() {
    const { user, household } = authStore.get();
    const currentTheme = themeStore.get().mode;
    const currentLocale = getLocale();
    const householdName = household?.name || 'My Household';
    const userName = user?.name || 'Household User';
    const userEmail = user?.email || 'user@digezlife.com';

    return \`
      <div class="screen settings-screen">
        <!-- Household Profile Card -->
        <section class="card profile-card" style="display:flex; align-items:center; gap:1rem; padding:1.25rem;">
          <div class="large-avatar-pill">\${getInitials(userName)}</div>
          <div style="flex:1; min-width:0;">
            <span class="wa-tag badge-emerald" style="font-size:0.7rem;">\${t('settings.owner_badge')}</span>
            <h3 style="margin:0.25rem 0 0.1rem 0; font-size:1.15rem;">\${userName}</h3>
            <p class="text-quiet" style="font-size:0.85rem; margin:0;">\${userEmail}</p>
            <p class="text-brand" style="font-size:0.8rem; font-weight:600; margin-top:0.2rem;">\${householdName}</p>
          </div>
        </section>

        <!-- Settings Groups -->
        <div class="stack" style="gap:1rem; margin-top:1.25rem;">
          <!-- Language Selector -->
          <div class="card" style="padding:1rem;">
            <span class="text-quiet" style="font-size:0.75rem; font-weight:700; text-transform:uppercase;">\${t('settings.language')}</span>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem;">
              <div>
                <div style="font-weight:600; font-size:0.95rem;">\${t('settings.select_language')}</div>
                <div class="text-quiet" style="font-size:0.8rem;">Urdu, Roman Urdu, English, Punjabi, etc.</div>
              </div>
              <wa-select id="settings-locale-select" value="\${currentLocale}" size="small" style="width:140px;">
                \${LOCALES.map((l) => \`
                  <wa-option value="\${l.code}">\${l.nativeName}</wa-option>
                \`).join('')}
              </wa-select>
            </div>
          </div>

          <!-- Appearance -->
          <div class="card" style="padding:1rem;">
            <span class="text-quiet" style="font-size:0.75rem; font-weight:700; text-transform:uppercase;">\${t('settings.appearance')}</span>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem;">
              <div>
                <div style="font-weight:600; font-size:0.95rem;">\${t('settings.theme_mode')}</div>
                <div class="text-quiet" style="font-size:0.8rem;">Light, Dark, or System auto</div>
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
                <div class="list-row__title">\${t('settings.invite_member')}</div>
                <div class="list-row__subtitle">\${t('settings.invite_sub')}</div>
              </div>
              <div style="color:var(--wa-color-text-quiet); font-size:0.9rem;">&rarr;</div>
            </a>

            <div class="list-row" id="btn-export-backup" style="border:none; border-bottom:1px solid var(--wa-color-surface-border); border-radius:0; padding:0.75rem 0; cursor:pointer;">
              <div class="list-row__icon" style="background:var(--wa-color-blue-90); color:var(--wa-color-blue-40);">
                \${icon('cloud-arrow-down')}
              </div>
              <div class="list-row__body">
                <div class="list-row__title">\${t('settings.export_backup')}</div>
                <div class="list-row__subtitle">\${t('settings.export_sub')}</div>
              </div>
              <div style="color:var(--wa-color-text-quiet); font-size:0.9rem;">&rarr;</div>
            </div>

            <a class="list-row" href="#/upgrade" style="border:none; border-radius:0; padding:0.75rem 0;">
              <div class="list-row__icon" style="background:var(--wa-color-purple-90); color:var(--wa-color-purple-40);">
                \${icon('crown')}
              </div>
              <div class="list-row__body">
                <div class="list-row__title">\${t('settings.subscription')}</div>
                <div class="list-row__subtitle">Free Household &bull; View Plus / VIP</div>
              </div>
              <div style="color:var(--wa-color-text-quiet); font-size:0.9rem;">&rarr;</div>
            </a>
          </div>

          <!-- Sign Out Button -->
          <wa-button variant="danger" appearance="outlined" size="large" style="width:100%; margin-top:0.5rem;" id="btn-settings-logout">
            \${icon('right-from-bracket')} \${t('settings.sign_out')}
          </wa-button>
        </div>
      </div>
    \`;
  },

  afterRender() {
    // Locale select
    const localeSelect = document.getElementById('settings-locale-select');
    localeSelect?.addEventListener('change', (e) => {
      const code = e.target.value;
      setLocale(code);
      pushToast({ message: \`Language changed to \${code}\`, variant: 'success' });
      navigate('/settings');
    });

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
// 6. src/main.js (Updated Routes)
// ==========================================
write('main.js', `
import '@awesome.me/webawesome/dist/styles/webawesome.css';
import '@awesome.me/webawesome/dist/styles/themes/default.css';
import './components/webawesome.js';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import './i18n/index.js';

import { mountAppShell } from './layouts/app-shell.js';
import { registerRoute, registerNotFound, startRouter } from './state/router.js';
import { applyTheme, themeStore } from './state/store.js';
import { notFoundStateHTML } from './components/states.js';
import { initPwa } from './services/pwa.js';

import { splashScreen } from './screens/splash.js';
import { landingScreen } from './screens/landing.js';
import { onboardingScreen } from './screens/onboarding.js';
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
registerRoute('/landing', landingScreen);
registerRoute('/onboarding', onboardingScreen);
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
*/


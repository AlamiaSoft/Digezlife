import { navigate } from '../state/router.js';
import { authStore, logout, themeStore, setThemeMode, setPalette, PALETTES, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { openInstallPrompt } from '../components/install-prompt.js';
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
    const currentPalette = themeStore.get().palette || 'emerald';
    const currentLocale = getLocale();
    const householdName = household?.name || 'My Household';
    const userName = user?.name || 'Household User';
    const userEmail = user?.email || 'user@gharlyapp.com';

    return `
      <div class="screen settings-screen">
        <!-- Household Profile Card -->
        <section class="card profile-card" style="display:flex; align-items:center; gap:1rem; padding:1.25rem;">
          <div class="large-avatar-pill">${getInitials(userName)}</div>
          <div style="flex:1; min-width:0;">
            <span class="wa-tag badge-emerald" style="font-size:0.7rem;">${t('settings.owner_badge')}</span>
            <h3 style="margin:0.25rem 0 0.1rem 0; font-size:1.15rem;">${userName}</h3>
            <p class="text-quiet" style="font-size:0.85rem; margin:0;">${userEmail}</p>
            <p class="text-brand" style="font-size:0.8rem; font-weight:600; margin-top:0.2rem;">${householdName}</p>
          </div>
        </section>

        <!-- Settings Groups -->
        <div class="stack" style="gap:1rem; margin-top:1.25rem;">
          <!-- Language Selector -->
          <div class="card" style="padding:1rem;">
            <span class="text-quiet" style="font-size:0.75rem; font-weight:700; text-transform:uppercase;">${t('settings.language')}</span>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem;">
              <div>
                <div style="font-weight:600; font-size:0.95rem;">${t('settings.select_language')}</div>
                <div class="text-quiet" style="font-size:0.8rem;">Urdu, Roman Urdu, English, Punjabi, etc.</div>
              </div>
              <wa-select id="settings-locale-select" value="${currentLocale}" size="small" style="width:140px;">
                ${LOCALES.map((l) => `
                  <wa-option value="${l.code}">${l.nativeName}</wa-option>
                `).join('')}
              </wa-select>
            </div>
          </div>

          <!-- Appearance & Palette Presets -->
          <div class="card" style="padding:1rem;">
            <span class="text-quiet" style="font-size:0.75rem; font-weight:700; text-transform:uppercase;">${t('settings.appearance')}</span>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem;">
              <div>
                <div style="font-weight:600; font-size:0.95rem;">${t('settings.theme_mode')}</div>
                <div class="text-quiet" style="font-size:0.8rem;">Light, Dark, or System auto</div>
              </div>
              <wa-select id="settings-theme-select" value="${currentTheme}" size="small" style="width:120px;">
                <wa-option value="light">Light</wa-option>
                <wa-option value="dark">Dark</wa-option>
                <wa-option value="system">System</wa-option>
              </wa-select>
            </div>

            <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--wa-color-surface-border);">
              <div style="font-weight:700; font-size:0.85rem; margin-bottom:0.6rem; color:var(--wa-color-text-normal);">Color Scheme / Palette</div>
              <div class="presets-bar" id="settings-palette-chips">
                ${Object.values(PALETTES).map((p) => `
                  <button class="preset-chip ${p.id === currentPalette ? 'active' : ''}" data-palette="${p.id}" type="button">
                    <span class="preset-chip-dot" style="background:${p.color};"></span>
                    <span>${p.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Household & Features Management -->
          <div class="card" style="padding:0.5rem 1rem;">
            <a class="list-row" href="#/rewards" style="border:none; border-bottom:1px solid var(--wa-color-surface-border); border-radius:0; padding:0.75rem 0; text-decoration:none; color:inherit;">
              <div class="list-row__icon" style="background:var(--wa-color-green-90, #dcfce7); color:var(--wa-color-green-40, #16a34a);">
                ${icon('gift')}
              </div>
              <div class="list-row__body">
                <div class="list-row__title">Gharly Rewards &amp; Giveback</div>
                <div class="list-row__subtitle">View cashback balance, credits, points &amp; referral link</div>
              </div>
              <div style="color:var(--wa-color-text-quiet); font-size:0.9rem;">&rarr;</div>
            </a>

            <a class="list-row" href="#/household" style="border:none; border-bottom:1px solid var(--wa-color-surface-border); border-radius:0; padding:0.75rem 0; text-decoration:none; color:inherit;">
              <div class="list-row__icon" style="background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet);">
                ${icon('users')}
              </div>
              <div class="list-row__body">
                <div class="list-row__title">Family &amp; Household Members</div>
                <div class="list-row__subtitle">Manage active members, roles &amp; WhatsApp invites</div>
              </div>
              <div style="color:var(--wa-color-text-quiet); font-size:0.9rem;">&rarr;</div>
            </a>

            <!-- Install App Option -->
            <div class="list-row" id="btn-settings-install-pwa" style="border:none; border-bottom:1px solid var(--wa-color-surface-border); border-radius:0; padding:0.75rem 0; cursor:pointer;">
              <div class="list-row__icon" style="background:rgba(13, 107, 104, 0.15); color:#0d6b68;">
                ${icon('download')}
              </div>
              <div class="list-row__body">
                <div class="list-row__title" style="display:flex; align-items:center; gap:0.4rem;">
                  <span>Install GharlyApp</span>
                  <span class="wa-tag badge-emerald" style="font-size:0.65rem; padding:1px 6px;">PWA</span>
                </div>
                <div class="list-row__subtitle">Fast 1-tap home screen launch &amp; offline mode</div>
              </div>
              <div style="color:var(--wa-color-brand-on-normal); font-size:0.9rem; font-weight:700;">Install &rarr;</div>
            </div>

            <div class="list-row" id="btn-export-backup" style="border:none; border-bottom:1px solid var(--wa-color-surface-border); border-radius:0; padding:0.75rem 0; cursor:pointer;">
              <div class="list-row__icon" style="background:var(--wa-color-blue-90); color:var(--wa-color-blue-40);">
                ${icon('cloud-arrow-down')}
              </div>
              <div class="list-row__body">
                <div class="list-row__title">${t('settings.export_backup')}</div>
                <div class="list-row__subtitle">${t('settings.export_sub')}</div>
              </div>
              <div style="color:var(--wa-color-text-quiet); font-size:0.9rem;">&rarr;</div>
            </div>

            <a class="list-row" href="#/upgrade" style="border:none; border-radius:0; padding:0.75rem 0; text-decoration:none; color:inherit;">
              <div class="list-row__icon" style="background:var(--wa-color-purple-90); color:var(--wa-color-purple-40);">
                ${icon('crown')}
              </div>
              <div class="list-row__body">
                <div class="list-row__title">${t('settings.subscription')}</div>
                <div class="list-row__subtitle">Free Household &bull; View Plus / VIP</div>
              </div>
              <div style="color:var(--wa-color-text-quiet); font-size:0.9rem;">&rarr;</div>
            </a>
          </div>

          <!-- Legal & Privacy Section -->
          <div class="card" style="padding:1rem;">
            <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.75rem;">
              <span style="color:var(--wa-color-brand-fill); display:inline-flex;">${icon('shield-halved')}</span>
              <span class="text-quiet" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Legal &amp; Policies</span>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:0.25rem;">
              <a class="list-row" href="#/privacy" style="border:none; border-bottom:1px solid var(--wa-color-surface-border); border-radius:0; padding:0.6rem 0; text-decoration:none; color:inherit;">
                <div class="list-row__body">
                  <div style="font-weight:600; font-size:0.88rem;">Privacy Policy</div>
                  <div class="text-quiet" style="font-size:0.76rem;">Data collection, retention &amp; isolation standards</div>
                </div>
                <div style="color:var(--wa-color-text-quiet); font-size:0.85rem;">&rarr;</div>
              </a>

              <a class="list-row" href="#/terms" style="border:none; border-bottom:1px solid var(--wa-color-surface-border); border-radius:0; padding:0.6rem 0; text-decoration:none; color:inherit;">
                <div class="list-row__body">
                  <div style="font-weight:600; font-size:0.88rem;">Terms of Service</div>
                  <div class="text-quiet" style="font-size:0.76rem;">User responsibilities &amp; referral program terms</div>
                </div>
                <div style="color:var(--wa-color-text-quiet); font-size:0.85rem;">&rarr;</div>
              </a>

              <a class="list-row" href="#/acceptable-use" style="border:none; border-bottom:1px solid var(--wa-color-surface-border); border-radius:0; padding:0.6rem 0; text-decoration:none; color:inherit;">
                <div class="list-row__body">
                  <div style="font-weight:600; font-size:0.88rem;">Acceptable Use Policy</div>
                  <div class="text-quiet" style="font-size:0.76rem;">Rules on fair usage, bot prevention &amp; conduct</div>
                </div>
                <div style="color:var(--wa-color-text-quiet); font-size:0.85rem;">&rarr;</div>
              </a>

              <a class="list-row" href="#/subscriptions" style="border:none; border-bottom:1px solid var(--wa-color-surface-border); border-radius:0; padding:0.6rem 0; text-decoration:none; color:inherit;">
                <div class="list-row__body">
                  <div style="font-weight:600; font-size:0.88rem;">Subscription &amp; Refund Policy</div>
                  <div class="text-quiet" style="font-size:0.76rem;">Billing, renewal, grace period &amp; cancellation</div>
                </div>
                <div style="color:var(--wa-color-text-quiet); font-size:0.85rem;">&rarr;</div>
              </a>

              <a class="list-row" href="#/security" style="border:none; border-radius:0; padding:0.6rem 0; text-decoration:none; color:inherit;">
                <div class="list-row__body">
                  <div style="font-weight:600; font-size:0.88rem;">Security Posture</div>
                  <div class="text-quiet" style="font-size:0.76rem;">Encryption, tenant security &amp; disclosure</div>
                </div>
                <div style="color:var(--wa-color-text-quiet); font-size:0.85rem;">&rarr;</div>
              </a>
            </div>
          </div>

          <!-- Sign Out Button -->
          <wa-button variant="danger" appearance="outlined" size="l" style="width:100%; margin-top:0.5rem;" id="btn-settings-logout">
            ${icon('right-from-bracket')} ${t('settings.sign_out')}
          </wa-button>
        </div>
      </div>
    `;
  },

  afterRender() {
    // Locale select
    const localeSelect = document.getElementById('settings-locale-select');
    localeSelect?.addEventListener('change', (e) => {
      const code = e.target.value;
      setLocale(code);
      pushToast({ message: `Language changed to ${code}`, variant: 'success' });
      navigate('/settings');
    });

    // Theme select
    const themeSelect = document.getElementById('settings-theme-select');
    themeSelect?.addEventListener('change', (e) => {
      const mode = e.target.value;
      setThemeMode(mode);
      pushToast({ message: `Theme set to ${mode}`, variant: 'neutral' });
    });

    // Palette chips
    document.querySelectorAll('#settings-palette-chips .preset-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const paletteId = chip.getAttribute('data-palette');
        setPalette(paletteId);
        document.querySelectorAll('#settings-palette-chips .preset-chip').forEach((c) => {
          c.classList.remove('active');
        });
        chip.classList.add('active');
        pushToast({ message: `Applied ${PALETTES[paletteId]?.name || 'palette'} theme`, variant: 'success' });
      });
    });

    // Install PWA button
    document.getElementById('btn-settings-install-pwa')?.addEventListener('click', () => {
      openInstallPrompt({ force: true });
    });

    // Export backup
    document.getElementById('btn-export-backup')?.addEventListener('click', () => {
      const { user, household } = authStore.get();
      const backupData = {
        exported_at: new Date().toISOString(),
        user,
        household,
        app: 'GharlyApp Household OS',
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `gharlyapp-backup-${new Date().toISOString().slice(0, 10)}.json`);
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

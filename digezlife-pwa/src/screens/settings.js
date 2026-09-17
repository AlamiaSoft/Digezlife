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

          <!-- Appearance -->
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
          </div>

          <!-- Household Sharing & Backup -->
          <div class="card" style="padding:0.5rem 1rem;">
            <a class="list-row" href="#/share" style="border:none; border-bottom:1px solid var(--wa-color-surface-border); border-radius:0; padding:0.75rem 0;">
              <div class="list-row__icon" style="background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet);">
                ${icon('user-plus')}
              </div>
              <div class="list-row__body">
                <div class="list-row__title">${t('settings.invite_member')}</div>
                <div class="list-row__subtitle">${t('settings.invite_sub')}</div>
              </div>
              <div style="color:var(--wa-color-text-quiet); font-size:0.9rem;">&rarr;</div>
            </a>

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

            <a class="list-row" href="#/upgrade" style="border:none; border-radius:0; padding:0.75rem 0;">
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

          <!-- Sign Out Button -->
          <wa-button variant="danger" appearance="outlined" size="large" style="width:100%; margin-top:0.5rem;" id="btn-settings-logout">
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

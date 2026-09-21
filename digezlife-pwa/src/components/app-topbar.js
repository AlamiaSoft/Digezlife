import { icon } from './icon.js';
import { authStore } from '../state/store.js';
import { BRAND } from '../config/brand.js';
import { openAppDrawer } from './app-drawer-nav.js';

function getInitials(name) {
  if (!name) return 'DL';
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * Renders the persistent top bar HTML.
 * @param {object} opts
 * @param {string} opts.title
 * @param {boolean} opts.back - show a back button that calls history.back()
 * @param {boolean} opts.showBrand - show GharlyApp branding
 * @param {string} opts.actionsHTML - raw HTML for trailing action buttons
 */
export function topbarHTML({ title = '', back = false, showBrand = false, actionsHTML = '' } = {}) {
  const { user, household } = authStore.get();
  const householdName = household?.name || 'My Household';
  const userName = user?.name || 'Household User';

  return `
    <header class="app-topbar" data-topbar>
      <div class="app-topbar__side">
        ${
          back
            ? `<button class="app-topbar__icon-btn" data-topbar-back aria-label="Back">${icon('arrow-left')}</button>`
            : `<button class="app-topbar__icon-btn" data-topbar-menu aria-label="Open Menu">${icon('bars')}</button>`
        }
      </div>
      <div class="app-topbar__title">
        ${
          showBrand
            ? `
              <div class="app-topbar__brand-wrap">
                <span class="app-topbar__brand-eyebrow">${householdName.toUpperCase()}</span>
                <h1 class="app-topbar__brand-name">${BRAND.name}</h1>
              </div>
            `
            : `<h1>${title}</h1>`
        }
      </div>
      <div class="app-topbar__side app-topbar__side--end">
        ${actionsHTML}
        <a class="app-topbar__avatar-link" href="#/settings" aria-label="Profile & Settings">
          <span class="app-avatar-pill">${getInitials(userName)}</span>
        </a>
      </div>
    </header>
  `;
}

export function mountTopbar(root = document) {
  const back = root.querySelector('[data-topbar-back]');
  if (back) {
    back.addEventListener('click', () => {
      if (window.history.length > 1) {
        history.back();
      } else {
        location.hash = '#/home';
      }
    });
  }

  const menu = root.querySelector('[data-topbar-menu]');
  if (menu) {
    menu.addEventListener('click', () => {
      openAppDrawer();
    });
  }
}

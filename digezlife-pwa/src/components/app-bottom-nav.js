import { icon } from './icon.js';
import { t } from '../i18n/index.js';

export function getNavItems() {
  return [
    { key: 'home', path: '/home', label: t('nav.home', {}, 'Home'), icon: 'house' },
    { key: 'grocery', path: '/grocery', label: t('nav.grocery', {}, 'Grocery'), icon: 'cart-shopping' },
    { key: 'add', path: '/add', label: t('nav.add', {}, 'Add'), icon: 'plus', isAction: true },
    { key: 'hisab', path: '/hisab', label: t('nav.hisab', {}, 'Hisab'), icon: 'wallet' },
    { key: 'reminders', path: '/reminders', label: t('nav.alerts', {}, 'Alerts'), icon: 'bell' },
  ];
}

export function bottomNavHTML(activeKey = 'home') {
  const items = getNavItems();
  return `
    <nav class="app-bottom-nav" data-bottom-nav aria-label="Primary Navigation">
      ${items.map((item) => {
        const active = item.key === activeKey;
        if (item.isAction) {
          return `
            <a class="app-bottom-nav__fab" href="#${item.path}" aria-label="${item.label}">
              ${icon(item.icon)}
            </a>
          `;
        }
        return `
          <a class="app-bottom-nav__item ${active ? 'is-active' : ''}" href="#${item.path}">
            ${icon(item.icon)}
            <span>${item.label}</span>
          </a>
        `;
      }).join('')}
    </nav>
  `;
}


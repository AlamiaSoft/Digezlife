import { topbarHTML, mountTopbar } from '../components/app-topbar.js';
import { bottomNavHTML } from '../components/app-bottom-nav.js';
import { toastHostHTML, mountToastHost } from '../components/toast-host.js';
import { installPromptHTML, mountInstallPrompt } from '../components/install-prompt.js';
import { pullToRefreshHTML, mountPullToRefresh } from '../components/pull-to-refresh.js';
import { networkStore } from '../state/store.js';

/**
 * Renders the persistent app shell once into #app. The router only
 * ever touches #screen-outlet's innerHTML after this is mounted;
 * chrome (topbar/bottom nav/offline banner) updates in response to
 * the `screen:mounted` event's meta payload.
 */
export function mountAppShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app-shell" data-app-shell>
      <div class="app-offline-banner" data-offline-banner>You're offline — showing saved data</div>
      <div data-topbar-slot></div>
      ${pullToRefreshHTML()}
      <main class="app-shell__content" id="screen-outlet"></main>
      <div data-bottomnav-slot></div>
      ${toastHostHTML()}
      ${installPromptHTML()}
    </div>
  `;

  mountToastHost();
  mountInstallPrompt();
  mountPullToRefresh();

  document.addEventListener('screen:mounted', (e) => updateChrome(e.detail.meta || {}));

  networkStore.subscribe((state) => {
    document.querySelector('[data-offline-banner]')?.classList.toggle('is-visible', !state.online);
  });
}

function updateChrome(meta) {
  const shell = document.querySelector('[data-app-shell]');
  const topbarSlot = document.querySelector('[data-topbar-slot]');
  const bottomnavSlot = document.querySelector('[data-bottomnav-slot]');

  if (meta.topbar === null) {
    topbarSlot.innerHTML = '';
    shell.classList.add('app-shell--no-topbar');
  } else {
    shell.classList.remove('app-shell--no-topbar');
    topbarSlot.innerHTML = topbarHTML(meta.topbar || {});
    mountTopbar(topbarSlot);
  }

  if (meta.nav) {
    bottomnavSlot.innerHTML = bottomNavHTML(meta.nav);
    shell.classList.remove('app-shell--no-nav');
  } else {
    bottomnavSlot.innerHTML = '';
    shell.classList.add('app-shell--no-nav');
  }
}

import { canInstall, promptInstall } from '../services/pwa.js';
import { icon } from './icon.js';
import { pushToast } from '../state/store.js';

const DISMISS_STORAGE_KEY = 'gharly_pwa_install_dismissed_at';
const DISMISS_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

export function isIos() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && !window.MSStream;
}

export function isDismissedRecently() {
  try {
    const ts = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!ts) return false;
    return Date.now() - parseInt(ts, 10) < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

export function recordDismissal() {
  try {
    localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
  } catch {}
}

export function clearDismissal() {
  try {
    localStorage.removeItem(DISMISS_STORAGE_KEY);
  } catch {}
}

export function installPromptHTML() {
  return `
    <div id="pwa-install-drawer-backdrop" class="pwa-install-backdrop" style="display:none;" aria-hidden="true">
      <div class="pwa-install-drawer" role="dialog" aria-modal="true" aria-labelledby="pwa-install-title">
        <div class="pwa-install-drag-handle"></div>

        <button class="pwa-install-close-btn" id="btn-pwa-install-close" aria-label="Close">
          ${icon('xmark')}
        </button>

        <!-- Header with Branding -->
        <div class="pwa-install-header">
          <div class="pwa-install-icon-wrap">
            <img src="/icons/icon-192.png" alt="GharlyApp" class="pwa-install-app-icon" onerror="this.src='/icon.svg'" />
            <div class="pwa-install-icon-badge">PRO</div>
          </div>
          <div class="pwa-install-header-text">
            <h3 id="pwa-install-title">Install GharlyApp</h3>
            <p>Your Everyday Home &amp; Family OS</p>
          </div>
        </div>

        <!-- Android / Desktop Install Flow -->
        <div id="pwa-native-install-section" class="pwa-install-body">
          <p class="pwa-install-tagline">
            Install on your phone for lightning-fast 1-tap home screen access, offline groceries &amp; family bill alerts.
          </p>

          <div class="pwa-install-features">
            <div class="pwa-feature-item">
              <div class="pwa-feature-icon" style="background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet);">
                ${icon('bolt')}
              </div>
              <div>
                <strong>Instant 1-Tap Launch</strong>
                <span>Opens in fullscreen mode without browser URL bars</span>
              </div>
            </div>

            <div class="pwa-feature-item">
              <div class="pwa-feature-icon" style="background:rgba(16, 185, 129, 0.15); color:#059669;">
                ${icon('cloud-arrow-down')}
              </div>
              <div>
                <strong>Offline Grocery &amp; Hisab</strong>
                <span>View &amp; check off items even without mobile data</span>
              </div>
            </div>

            <div class="pwa-feature-item">
              <div class="pwa-feature-icon" style="background:rgba(99, 102, 241, 0.15); color:#4f46e5;">
                ${icon('shield-check')}
              </div>
              <div>
                <strong>Lightweight &amp; Zero Storage Clutter</strong>
                <span>Less than 2MB &bull; Updates automatically</span>
              </div>
            </div>
          </div>

          <div class="pwa-install-actions">
            <wa-button variant="brand" size="large" id="btn-pwa-install-action" class="pwa-install-primary-btn">
              ${icon('download')} Install GharlyApp
            </wa-button>
            <wa-button appearance="plain" size="medium" id="btn-pwa-install-dismiss" class="pwa-install-dismiss-btn">
              Maybe Later
            </wa-button>
          </div>
        </div>

        <!-- iOS Safari Install Guide -->
        <div id="pwa-ios-install-section" class="pwa-install-body" style="display:none;">
          <p class="pwa-install-tagline">
            Follow these 2 quick steps to add <strong>GharlyApp</strong> to your iPhone home screen:
          </p>

          <div class="pwa-ios-steps">
            <div class="pwa-ios-step">
              <div class="pwa-ios-step-num">1</div>
              <div class="pwa-ios-step-content">
                <span>Tap the <strong>Share button</strong> in Safari's bottom navigation bar.</span>
                <div class="pwa-ios-step-badge">
                  ${icon('arrow-up-from-bracket')} <span>Share</span>
                </div>
              </div>
            </div>

            <div class="pwa-ios-step">
              <div class="pwa-ios-step-num">2</div>
              <div class="pwa-ios-step-content">
                <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                <div class="pwa-ios-step-badge">
                  ${icon('square-plus')} <span>Add to Home Screen</span>
                </div>
              </div>
            </div>

            <div class="pwa-ios-step">
              <div class="pwa-ios-step-num">3</div>
              <div class="pwa-ios-step-content">
                <span>Tap <strong>Add</strong> in the top-right corner. All done!</span>
              </div>
            </div>
          </div>

          <div class="pwa-install-actions" style="margin-top:1rem;">
            <wa-button variant="brand" size="large" id="btn-pwa-ios-gotit" class="pwa-install-primary-btn">
              ${icon('check')} Got it!
            </wa-button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function openInstallPrompt(options = {}) {
  const { force = false } = options;

  if (isStandalone() && !force) {
    return;
  }

  if (!force && isDismissedRecently()) {
    return;
  }

  const modal = document.getElementById('pwa-install-drawer-backdrop');
  if (!modal) return;

  const nativeSection = document.getElementById('pwa-native-install-section');
  const iosSection = document.getElementById('pwa-ios-install-section');

  const isApple = isIos();

  if (isApple) {
    if (nativeSection) nativeSection.style.display = 'none';
    if (iosSection) iosSection.style.display = 'block';
  } else {
    if (nativeSection) nativeSection.style.display = 'block';
    if (iosSection) iosSection.style.display = 'none';
  }

  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('pwa-modal-open');
}

export function closeInstallPrompt() {
  const modal = document.getElementById('pwa-install-drawer-backdrop');
  if (modal) {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('pwa-modal-open');
}

export function mountInstallPrompt() {
  const modal = document.getElementById('pwa-install-drawer-backdrop');
  if (!modal) return;

  // Backdrop click to dismiss
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      recordDismissal();
      closeInstallPrompt();
    }
  });

  // Close button
  document.getElementById('btn-pwa-install-close')?.addEventListener('click', () => {
    recordDismissal();
    closeInstallPrompt();
  });

  // Maybe later button
  document.getElementById('btn-pwa-install-dismiss')?.addEventListener('click', () => {
    recordDismissal();
    closeInstallPrompt();
    pushToast({ message: 'You can install GharlyApp anytime from Settings', variant: 'neutral', duration: 4000 });
  });

  // iOS Got it button
  document.getElementById('btn-pwa-ios-gotit')?.addEventListener('click', () => {
    recordDismissal();
    closeInstallPrompt();
  });

  // Android / Desktop Install Action
  document.getElementById('btn-pwa-install-action')?.addEventListener('click', async () => {
    if (canInstall()) {
      const result = await promptInstall();
      if (result.outcome === 'accepted') {
        pushToast({ message: 'Installing GharlyApp...', variant: 'success' });
        closeInstallPrompt();
      } else {
        closeInstallPrompt();
      }
    } else {
      // Fallback if browser deferred prompt is not directly available
      pushToast({
        message: 'Tap your browser menu (⋮) and choose "Install App" or "Add to Home Screen"',
        variant: 'brand',
        duration: 6000,
      });
      closeInstallPrompt();
    }
  });

  // Listen for custom trigger events
  window.addEventListener('pwa:open-install-modal', (e) => {
    openInstallPrompt({ force: e.detail?.force ?? true });
  });

  // Auto prompt after short delay if installable or mobile
  window.addEventListener('pwa:installable', () => {
    setTimeout(() => {
      openInstallPrompt({ force: false });
    }, 2500);
  });

  // If mobile and not standalone, show initial prompt after 4 seconds
  if (!isStandalone() && !isDismissedRecently()) {
    setTimeout(() => {
      openInstallPrompt({ force: false });
    }, 4000);
  }
}

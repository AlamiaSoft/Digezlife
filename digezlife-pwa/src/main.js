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
import { householdScreen } from './screens/household.js';
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
registerRoute('/household', householdScreen);
registerRoute('/family', householdScreen);
registerRoute('/profile', profileScreen);
registerRoute('/share', shareScreen);
registerRoute('/upgrade', paywallScreen);
registerRoute('/search', searchScreen);
registerRoute('/add', addScreen);
registerNotFound(() => `<div class="screen">${notFoundStateHTML()}</div>`);

/* ---- Boot ---- */
mountAppShell();
startRouter();
initPwa();

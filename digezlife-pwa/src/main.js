import '@awesome.me/webawesome/dist/styles/webawesome.css';
import '@awesome.me/webawesome/dist/styles/themes/default.css';
import './components/webawesome.js';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import './i18n/index.js';

import { mountAppShell } from './layouts/app-shell.js';
import { registerRoute, registerNotFound, startRouter } from './state/router.js';
import { applyTheme, applyPalette, themeStore } from './state/store.js';
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
import { joinScreen } from './screens/join.js';
import { shareScreen } from './screens/share.js';
import { paywallScreen } from './screens/paywall.js';
import { searchScreen } from './screens/search.js';
import { addScreen } from './screens/add.js';
import { activityScreen } from './screens/activity.js';
import { rewardsScreen } from './screens/rewards.js';
import { legalPrivacyScreen } from './screens/legal-privacy.js';
import { legalTermsScreen } from './screens/legal-terms.js';
import { legalAcceptableUseScreen } from './screens/legal-acceptable-use.js';
import { legalSubscriptionsScreen } from './screens/legal-subscriptions.js';
import { legalSecurityScreen } from './screens/legal-security.js';

/* ---- Theme: apply immediately ---- */
applyTheme(themeStore.get().mode);
applyPalette(themeStore.get().palette);
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
registerRoute('/join', joinScreen);
registerRoute('/invite', joinScreen);
registerRoute('/profile', profileScreen);
registerRoute('/share', shareScreen);
registerRoute('/upgrade', paywallScreen);
registerRoute('/search', searchScreen);
registerRoute('/add', addScreen);
registerRoute('/activity', activityScreen);
registerRoute('/rewards', rewardsScreen);
registerRoute('/privacy', legalPrivacyScreen);
registerRoute('/terms', legalTermsScreen);
registerRoute('/acceptable-use', legalAcceptableUseScreen);
registerRoute('/subscriptions', legalSubscriptionsScreen);
registerRoute('/security', legalSecurityScreen);
registerNotFound(() => `<div class="screen">${notFoundStateHTML()}</div>`);

/* ---- Boot ---- */
mountAppShell();
startRouter();
initPwa();

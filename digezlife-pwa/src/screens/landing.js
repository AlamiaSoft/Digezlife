import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';

export const landingScreen = {
  meta: { topbar: null, nav: null },

  render() {
    return `
      <div class="screen screen--flush landing-screen">
        <!-- Top Hero Navigation -->
        <header class="landing-header">
          <div class="landing-header__brand">
            <span class="app-brand-mark">G</span>
            <span class="landing-header__name">GharlyApp</span>
          </div>
          <a class="wa-button quiet" href="#/login" style="font-weight:600; font-size:0.85rem;">
            ${t('auth.signin_btn')}
          </a>
        </header>

        <!-- Hero Section -->
        <section class="landing-hero">
          <span class="wa-tag badge-emerald" style="margin-bottom:0.75rem;">
            EVERYDAY HOUSEHOLD OS
          </span>
          <h1 class="landing-hero__title">
            Your home,<br><em>made easier.</em>
          </h1>
          <p class="landing-hero__tagline text-quiet">
            The simple, shared mobile app for your household groceries, hisab ledger, and scheduled reminders.
          </p>
          <div class="landing-hero__cta-group">
            <a class="wa-button primary large full" href="#/signup" style="box-shadow:var(--app-shadow-2); font-weight:700;">
              Get Started Free &rarr;
            </a>
            <a class="wa-button quiet full" href="#/login">
              1-Click Demo Sign In
            </a>
          </div>
        </section>

        <!-- 3 Core Consumer Utilities -->
        <section class="landing-features stack" style="gap:1rem; padding:1.5rem 1rem;">
          <div class="card landing-feature-card">
            <div class="list-row__icon" style="background:var(--wa-color-blue-90); color:var(--wa-color-blue-40); margin-bottom:0.75rem;">
              ${icon('cart-shopping')}
            </div>
            <h3>Gharly Grocery</h3>
            <p class="text-quiet" style="font-size:0.88rem; line-height:1.5; margin-top:0.35rem;">
              Real-time synchronized checklist for your family. Tick bought items, add staples in one tap, and share directly via WhatsApp.
            </p>
          </div>

          <div class="card landing-feature-card">
            <div class="list-row__icon" style="background:var(--wa-color-green-90); color:var(--wa-color-green-40); margin-bottom:0.75rem;">
              ${icon('wallet')}
            </div>
            <h3>Gharly Hisab</h3>
            <p class="text-quiet" style="font-size:0.88rem; line-height:1.5; margin-top:0.35rem;">
              Simpler than accounting. Track monthly spending, see remaining flow, and manage family Udhaar & debts with gentle WhatsApp reminders.
            </p>
          </div>

          <div class="card landing-feature-card">
            <div class="list-row__icon" style="background:var(--wa-color-purple-90); color:var(--wa-color-purple-40); margin-bottom:0.75rem;">
              ${icon('bell')}
            </div>
            <h3>Gharly Alerts</h3>
            <p class="text-quiet" style="font-size:0.88rem; line-height:1.5; margin-top:0.35rem;">
              Never miss an electricity bill, token tax renewal, or family medicine dose with automated due date tracking.
            </p>
          </div>
        </section>

        <!-- Family & Trust Banner -->
        <section class="card" style="margin:1rem; padding:1.5rem; text-align:center; background:var(--wa-color-brand-fill-quiet); border-color:var(--wa-color-brand-fill-quiet);">
          <div class="list-row__icon" style="background:var(--wa-color-brand-fill-loud); color:var(--wa-color-brand-on-loud); margin:0 auto 0.75rem;">
            ${icon('users')}
          </div>
          <h3 style="color:var(--wa-color-brand-on-normal);">Gharly Family</h3>
          <p style="font-size:0.85rem; color:var(--wa-color-text-quiet); margin-top:0.35rem;">
            Zero complex configuration. Add your household members with one link and manage your everyday essentials together.
          </p>
          <a class="wa-button primary" href="#/signup" style="margin-top:1rem; width:100%;">
            Create Your Free Household
          </a>
        </section>

        <!-- Footer -->
        <footer class="landing-footer text-quiet" style="padding:2rem 1rem 3rem; text-align:center; font-size:0.8rem;">
          <p>GharlyApp &bull; Your Home, Made Easier</p>
          <p style="margin-top:0.35rem; font-size:0.75rem;">Everything for your everyday home &bull; gharlyapp.com</p>
        </footer>
      </div>
    `;
  },
};

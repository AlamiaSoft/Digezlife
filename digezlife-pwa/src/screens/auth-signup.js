import { navigate } from '../state/router.js';
import { login, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { BRAND } from '../config/brand.js';

export const signupScreen = {
  meta: { topbar: null, nav: null },
  render() {
    return `
      <div class="screen auth-screen">
        <div class="auth-screen__header">
          <div class="auth-screen__mark"><span class="app-brand-mark">${BRAND.mark}</span></div>
          <p class="auth-screen__eyebrow">CREATE HOUSEHOLD</p>
          <h1>Join ${BRAND.name}</h1>
          <p class="text-quiet">Set up your household space in seconds.</p>
        </div>

        <form class="stack" data-signup-form>
          <div id="signup-error-box" class="auth-error-alert" style="display:none;"></div>

          <wa-input type="text" label="Full Name" name="name" placeholder="e.g. Ali Raza" required></wa-input>
          <wa-input type="email" label="Email Address" name="email" placeholder="name@domain.com" required></wa-input>
          <wa-input type="password" label="Password" name="password" placeholder="Minimum 8 characters" minlength="8" required password-toggle></wa-input>
          <wa-input type="password" label="Confirm Password" name="password_confirmation" placeholder="Re-enter password" minlength="8" required password-toggle></wa-input>

          <div style="margin-top:0.5rem; font-size:0.82rem;">
            <wa-checkbox id="chk-accept-terms" required>
              I agree to the <a href="#/terms" target="_blank" style="color:var(--wa-color-brand-fill); font-weight:600;">Terms of Service</a> and acknowledge the <a href="#/privacy" target="_blank" style="color:var(--wa-color-brand-fill); font-weight:600;">Privacy Policy</a>.
            </wa-checkbox>
          </div>

          <wa-button type="submit" variant="brand" size="l" data-submit style="width:100%; margin-top:0.5rem;">
            Create Household Account
          </wa-button>
        </form>

        <p class="auth-screen__footer text-quiet" style="margin-top:1.5rem; text-align:center;">
          Already have an account? <a href="#/login" style="font-weight:600;">Sign in</a>
        </p>
      </div>
    `;
  },
  afterRender() {
    const form = document.querySelector('[data-signup-form]');
    const submitBtn = document.querySelector('[data-submit]');
    const errorBox = document.getElementById('signup-error-box');

    const showError = (msg) => {
      if (errorBox) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
      }
    };

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]')?.value?.trim();
      const email = form.querySelector('[name="email"]')?.value?.trim();
      const password = form.querySelector('[name="password"]')?.value;
      const passwordConfirm = form.querySelector('[name="password_confirmation"]')?.value;

      if (password !== passwordConfirm) {
        showError('Passwords do not match.');
        return;
      }

      if (submitBtn) submitBtn.loading = true;
      try {
        const res = await api.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirm,
        });

        if (res?.meta?.token) {
          const user = {
            name: res.data?.attributes?.name || name,
            email: res.data?.attributes?.email || email,
          };
          let household = res.meta?.household || { id: 'household-' + Date.now(), name: 'My Household' };
          login(user, res.meta.token, household);

          // Extract invite code from URL hash or query if present
          const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
          const urlParams = new URLSearchParams(hashQuery || window.location.search);
          const inviteCode = urlParams.get('invite') || urlParams.get('code');

          if (inviteCode) {
            try {
              const joinRes = await api.joinHousehold(inviteCode);
              if (joinRes?.data?.household) {
                household = joinRes.data.household;
                login(user, res.meta.token, household);
                api.setHousehold(household.id);
                pushToast({ message: `Successfully joined ${household.name}!`, variant: 'success' });
              }
            } catch (inviteErr) {
              console.warn('Auto-join on registration failed:', inviteErr);
              pushToast({ message: `Account created, but invite could not be linked: ${inviteErr.message}`, variant: 'warning' });
            }
          } else {
            const pendingHshName = sessionStorage.getItem('gharly_pending_household_name');
            if (pendingHshName) {
              try {
                await api.updateHousehold({ name: pendingHshName });
                household = { ...household, name: pendingHshName };
                login(user, res.meta.token, household);
                sessionStorage.removeItem('gharly_pending_household_name');
              } catch (err) {
                console.warn('Failed to apply pending household name:', err);
              }
            }
            pushToast({ message: 'Household account created successfully!', variant: 'success' });
          }

          navigate('/home');
        }
      } catch (err) {
        showError(err.message || 'Registration failed. Please check your inputs.');
      } finally {
        if (submitBtn) submitBtn.loading = false;
      }
    });
  },
};

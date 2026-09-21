import { navigate } from '../state/router.js';
import { icon } from '../components/icon.js';
import { writeLocal } from '../services/storage.js';
import { authStore } from '../state/store.js';
import { api } from '../services/api.js';
import { householdStore } from '../state/household-store.js';

export const onboardingScreen = {
  meta: { topbar: null, nav: null },

  render() {
    return `
      <div class="screen screen--flush onboarding-screen">
        <div class="onboarding-container" id="onboarding-track">
          <!-- Step 1: Welcome -->
          <div class="onboarding-step" data-step="1">
            <div class="onboarding-step__hero">
              <div class="onboarding-step__icon">
                <span class="app-brand-mark" style="width:4.5rem; height:4.5rem; font-size:2rem;">G</span>
              </div>
              <h2>Welcome to GharlyApp</h2>
              <p class="text-quiet" style="font-size:0.95rem; max-width:300px; margin:0.5rem auto 0;">
                Your everyday groceries, hisab, and household reminders in one simple mobile app.
              </p>
            </div>
            <div class="onboarding-step__footer">
              <wa-button variant="brand" size="l" style="width:100%;" data-next-step="2">
                Continue &rarr;
              </wa-button>
            </div>
          </div>

          <!-- Step 2: Choose Utilities -->
          <div class="onboarding-step" data-step="2" style="display:none;">
            <div class="onboarding-step__hero">
              <span class="wa-tag badge-emerald" style="margin-bottom:0.5rem;">STEP 2 OF 3</span>
              <h2>What will you use?</h2>
              <p class="text-quiet" style="font-size:0.85rem; margin-top:0.25rem;">
                Select the household utilities you'd like to organize:
              </p>

              <div class="stack" style="gap:0.65rem; margin-top:1.25rem; text-align:left; width:100%;">
                <label class="card list-row" style="cursor:pointer; padding:0.85rem;">
                  <wa-checkbox checked style="flex:0 0 auto;"></wa-checkbox>
                  <div class="list-row__body">
                    <div class="list-row__title">Grocery & Ration Lists</div>
                    <div class="list-row__subtitle">Shared checklists & WhatsApp export</div>
                  </div>
                </label>

                <label class="card list-row" style="cursor:pointer; padding:0.85rem;">
                  <wa-checkbox checked style="flex:0 0 auto;"></wa-checkbox>
                  <div class="list-row__body">
                    <div class="list-row__title">Daily Hisab & Khata</div>
                    <div class="list-row__subtitle">Income, spending, & debt reminders</div>
                  </div>
                </label>

                <label class="card list-row" style="cursor:pointer; padding:0.85rem;">
                  <wa-checkbox checked style="flex:0 0 auto;"></wa-checkbox>
                  <div class="list-row__body">
                    <div class="list-row__title">Bills & Due Alerts</div>
                    <div class="list-row__subtitle">Electricity, token tax, & renewals</div>
                  </div>
                </label>
              </div>
            </div>

            <div class="onboarding-step__footer">
              <wa-button variant="brand" size="l" style="width:100%;" data-next-step="3">
                Continue to Setup &rarr;
              </wa-button>
            </div>
          </div>

          <!-- Step 3: Household Setup -->
          <div class="onboarding-step" data-step="3" style="display:none;">
            <div class="onboarding-step__hero">
              <span class="wa-tag badge-purple" style="margin-bottom:0.5rem;">STEP 3 OF 3</span>
              <h2>Set Up Your Household</h2>
              <p class="text-quiet" style="font-size:0.85rem; margin-top:0.25rem;">
                Give your household a recognizable name to start:
              </p>

              <div class="stack" style="gap:0.75rem; margin-top:1.5rem; text-align:left; width:100%;">
                <wa-input label="Household Name" value="My Household" id="onboarding-household-name" placeholder="e.g. Khan Family" required></wa-input>
              </div>
            </div>

            <div class="onboarding-step__footer stack" style="gap:0.5rem;">
              <wa-button variant="brand" size="l" style="width:100%;" id="btn-finish-onboarding">
                Get Started &rarr;
              </wa-button>
              <wa-button appearance="outlined" size="m" style="width:100%;" id="btn-login-existing">
                Already have an account? Sign In
              </wa-button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    writeLocal('onboarding.seen', true);

    const showStep = (num) => {
      document.querySelectorAll('.onboarding-step').forEach((el) => {
        el.style.display = el.dataset.step === String(num) ? 'flex' : 'none';
      });
    };

    document.querySelectorAll('[data-next-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.nextStep;
        showStep(next);
      });
    });

    document.getElementById('btn-finish-onboarding')?.addEventListener('click', async () => {
      const nameInput = document.getElementById('onboarding-household-name');
      const householdName = nameInput?.value?.trim() || nameInput?.getAttribute('value') || 'My Household';
      
      const { isAuthenticated, household } = authStore.get();
      if (isAuthenticated) {
        if (householdName && householdName !== household?.name) {
          try {
            await api.updateHousehold({ name: householdName });
            const updated = { ...household, name: householdName };
            authStore.set({ household: updated });
            householdStore.set({ household: updated });
          } catch (e) {
            console.warn('Failed to update household during onboarding:', e);
          }
        }
        navigate('/home');
      } else {
        sessionStorage.setItem('gharly_pending_household_name', householdName);
        navigate('/signup');
      }
    });

    document.getElementById('btn-login-existing')?.addEventListener('click', () => {
      navigate('/login');
    });
  },
};


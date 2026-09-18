import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';

export const addScreen = {
  meta: { topbar: { title: t('universal_create.title', {}, 'Quick Add'), back: true }, nav: 'add' },

  render() {
    return `
      <div class="screen add-screen">
        <div style="text-align:center; padding:0.75rem 0 1.25rem;">
          <h2 style="margin:0 0 0.25rem 0; font-size:1.35rem; font-weight:800;">${t('universal_create.title', {}, 'Quick Add')}</h2>
          <p class="text-quiet" style="font-size:0.88rem; margin:0;">${t('universal_create.subtitle', {}, 'What would you like to log for your household?')}</p>
        </div>

        <div class="stack" style="gap:0.75rem;">
          <!-- 1. Record Expense -->
          <a class="card list-row universal-create-row" href="#/hisab?action=record&type=expense" style="padding:1rem; text-decoration:none; color:inherit;">
            <div class="list-row__icon" style="background:var(--wa-color-red-90); color:var(--wa-color-red-40);">
              ${icon('arrow-up-right')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title" style="font-weight:700;">${t('universal_create.expense_title', {}, 'Record Expense')}</div>
              <div class="list-row__subtitle text-quiet">${t('universal_create.expense_sub', {}, 'Log groceries, bills, fuel, dining, or shopping')}</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>

          <!-- 2. Add Income -->
          <a class="card list-row universal-create-row" href="#/hisab?action=record&type=income" style="padding:1rem; text-decoration:none; color:inherit;">
            <div class="list-row__icon" style="background:var(--wa-color-green-90); color:var(--wa-color-green-40);">
              ${icon('arrow-down')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title" style="font-weight:700;">${t('universal_create.income_title', {}, 'Add Income')}</div>
              <div class="list-row__subtitle text-quiet">${t('universal_create.income_sub', {}, 'Salary, freelance earnings, or cash deposits')}</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>

          <!-- 3. Add to Sauda List -->
          <a class="card list-row universal-create-row" href="#/grocery?action=add" style="padding:1rem; text-decoration:none; color:inherit;">
            <div class="list-row__icon" style="background:var(--wa-color-blue-90); color:var(--wa-color-blue-40);">
              ${icon('cart-shopping')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title" style="font-weight:700;">${t('universal_create.grocery_title', {}, 'Add to Sauda List')}</div>
              <div class="list-row__subtitle text-quiet">${t('universal_create.grocery_sub', {}, 'Add kitchen rashan, milk, veggies, or household items')}</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>

          <!-- 4. Set Reminder / Bill Due -->
          <a class="card list-row universal-create-row" href="#/reminders?action=add" style="padding:1rem; text-decoration:none; color:inherit;">
            <div class="list-row__icon" style="background:var(--wa-color-purple-90); color:var(--wa-color-purple-40);">
              ${icon('bell')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title" style="font-weight:700;">${t('universal_create.reminder_title', {}, 'Set Bill / Reminder')}</div>
              <div class="list-row__subtitle text-quiet">${t('universal_create.reminder_sub', {}, 'Utility due date, car service, or medicine alert')}</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>

          <!-- 5. Add Udhaar / Debt -->
          <a class="card list-row universal-create-row" href="#/hisab?action=debt" style="padding:1rem; text-decoration:none; color:inherit;">
            <div class="list-row__icon" style="background:var(--wa-color-amber-90); color:var(--wa-color-amber-40);">
              ${icon('handshake')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title" style="font-weight:700;">Add Udhaar / Khata</div>
              <div class="list-row__subtitle text-quiet">Money lent or borrowed with WhatsApp reminder</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>
        </div>
      </div>
    `;
  },
};

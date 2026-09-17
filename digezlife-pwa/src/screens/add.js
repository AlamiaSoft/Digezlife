import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';

export const addScreen = {
  meta: { topbar: { title: t('universal_create.title'), back: true }, nav: 'add' },

  render() {
    return `
      <div class="screen add-screen">
        <div style="text-align:center; padding:0.75rem 0 1.25rem;">
          <h2>${t('universal_create.title')}</h2>
          <p class="text-quiet" style="font-size:0.88rem; margin-top:0.3rem;">${t('universal_create.subtitle')}</p>
        </div>

        <div class="stack" style="gap:0.75rem;">
          <a class="card list-row universal-create-row" href="#/hisab" style="padding:1rem;">
            <div class="list-row__icon" style="background:var(--wa-color-red-90); color:var(--wa-color-red-40);">
              ${icon('arrow-up-right')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title">${t('universal_create.expense_title')}</div>
              <div class="list-row__subtitle">${t('universal_create.expense_sub')}</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>

          <a class="card list-row universal-create-row" href="#/hisab" style="padding:1rem;">
            <div class="list-row__icon" style="background:var(--wa-color-green-90); color:var(--wa-color-green-40);">
              ${icon('arrow-down-left')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title">${t('universal_create.income_title')}</div>
              <div class="list-row__subtitle">${t('universal_create.income_sub')}</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>

          <a class="card list-row universal-create-row" href="#/grocery" style="padding:1rem;">
            <div class="list-row__icon" style="background:var(--wa-color-blue-90); color:var(--wa-color-blue-40);">
              ${icon('cart-shopping')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title">${t('universal_create.grocery_title')}</div>
              <div class="list-row__subtitle">${t('universal_create.grocery_sub')}</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>

          <a class="card list-row universal-create-row" href="#/reminders" style="padding:1rem;">
            <div class="list-row__icon" style="background:var(--wa-color-purple-90); color:var(--wa-color-purple-40);">
              ${icon('bell')}
            </div>
            <div class="list-row__body">
              <div class="list-row__title">${t('universal_create.reminder_title')}</div>
              <div class="list-row__subtitle">${t('universal_create.reminder_sub')}</div>
            </div>
            <div style="color:var(--wa-color-text-quiet); font-size:1.1rem;">&rarr;</div>
          </a>
        </div>
      </div>
    `;
  },
};

import { api } from '../services/api.js';
import { navigate } from '../state/router.js';
import { pushToast } from '../state/store.js';
import { CATEGORIES } from '../services/mock-data/items.js';

export const editScreen = {
  meta: { topbar: { title: 'New record', back: true }, nav: null },
  async render(params) {
    const isEdit = !!params.id;
    const item = isEdit ? await api.getItem(params.id) : null;
    this._title = isEdit ? 'Edit record' : 'New record';
    return `
      <div class="screen">
        <form class="stack" data-item-form style="margin-top:0.5rem;">
          <wa-input label="Title" name="title" value="${item?.title || ''}" required placeholder="e.g. Vendor invoice"></wa-input>
          <wa-input label="Subtitle" name="subtitle" value="${item?.subtitle || ''}" placeholder="Short description"></wa-input>
          <wa-select label="Category" name="category" value="${item?.category || 'Active'}">
            ${CATEGORIES.filter((c) => c !== 'All')
              .map((c) => `<wa-option value="${c}">${c}</wa-option>`)
              .join('')}
          </wa-select>
          <wa-input type="number" label="Amount (optional)" name="amount" value="${item?.amount || ''}" placeholder="0.00">
            <span slot="start">$</span>
          </wa-input>
          <wa-textarea label="Notes" name="notes" placeholder="Add any relevant context" rows="3"></wa-textarea>
          <wa-button type="submit" variant="brand" size="large" data-submit style="width:100%;margin-top:0.5rem;">
            ${isEdit ? 'Save changes' : 'Create record'}
          </wa-button>
        </form>
      </div>
    `;
  },
  async afterRender(params) {
    const form = document.querySelector('[data-item-form]');
    const submitBtn = document.querySelector('[data-submit]');
    const titleEl = document.querySelector('.app-topbar__title h1');
    if (titleEl) titleEl.textContent = params.id ? 'Edit record' : 'New record';

    const handleSubmit = async (e) => {
      if (e && e.preventDefault) e.preventDefault();
      submitBtn.loading = true;
      const getVal = (name) => form.querySelector(`[name="${name}"]`)?.value ?? form[name]?.value ?? '';
      const payload = {
        title: getVal('title'),
        subtitle: getVal('subtitle'),
        category: getVal('category') || 'Active',
        amount: parseFloat(getVal('amount')) || 0,
        notes: getVal('notes'),
      };
      try {
        if (params.id) {
          await api.updateItem(params.id, payload);
        } else {
          await api.createItem(payload);
        }
        navigate(`/success?type=${params.id ? 'update' : 'create'}`);
      } catch {
        pushToast({ message: 'Something went wrong saving this record.', variant: 'danger' });
      } finally {
        submitBtn.loading = false;
      }
    };

    form.addEventListener('submit', handleSubmit);
    submitBtn?.addEventListener('click', (e) => {
      if (form.reportValidity && !form.reportValidity()) return;
      handleSubmit(e);
    });
  },
};

import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';

export const groceryScreen = {
  meta: { topbar: { title: 'Grocery Lists' }, nav: 'grocery' },

  render() {
    return `
      <div class="screen grocery-screen">
        <!-- List Switcher Tabs -->
        <div class="grocery-tabs-bar" id="grocery-lists-tabs">
          <button class="filter-chip is-active" data-list-id="1">Weekly Essentials</button>
        </div>

        <!-- Quick Add Input -->
        <div class="card grocery-quick-add" style="margin-top:0.75rem; padding:0.65rem 0.75rem;">
          <form id="grocery-quick-form" style="display:flex; gap:0.5rem; align-items:center; width:100%;">
            <wa-input id="quick-item-name" placeholder="${t('grocery.quick_add_placeholder', {}, 'Add item (e.g. Milk 2L, Eggs)...')}" style="flex:1 1 0; min-width:0; width:100%;" required></wa-input>
            <wa-button type="submit" variant="brand" data-add-btn style="flex-shrink:0; white-space:nowrap;">${t('grocery.add_btn', {}, '+ Add')}</wa-button>
          </form>
        </div>

        <!-- Category Filters -->
        <div class="filter-chips-row" id="category-filters" style="margin-top:0.75rem;">
          <button class="filter-chip is-active" data-cat="All">${t('grocery.categories.all', {}, 'All')}</button>
          <button class="filter-chip" data-cat="Dairy">${t('grocery.categories.dairy', {}, 'Dairy')}</button>
          <button class="filter-chip" data-cat="Bakery">${t('grocery.categories.bakery', {}, 'Bakery')}</button>
          <button class="filter-chip" data-cat="Pantry">${t('grocery.categories.pantry', {}, 'Pantry')}</button>
          <button class="filter-chip" data-cat="Produce">${t('grocery.categories.produce', {}, 'Produce')}</button>
          <button class="filter-chip" data-cat="Household">${t('grocery.categories.household', {}, 'Household')}</button>
          <button class="filter-chip" data-cat="Meat">${t('grocery.categories.meat', {}, 'Meat')}</button>
          <button class="filter-chip" data-cat="Beverages">${t('grocery.categories.beverages', {}, 'Beverages')}</button>
        </div>

        <!-- Items Checklist -->
        <div class="card grocery-checklist-card" style="margin-top:0.75rem; padding:0.5rem 1rem;" id="grocery-items-container">
          <div class="text-quiet" style="text-align:center; padding:1.5rem 0;">Loading list items...</div>
        </div>

        <!-- Floating Actions / WhatsApp Share -->
        <div class="grocery-actions-bar" style="margin-top:1.25rem; display:flex; flex-direction:column; gap:0.5rem;">
          <wa-button variant="brand" appearance="filled" style="width:100%;" id="btn-whatsapp-share">
            ${icon('share-nodes')} ${t('grocery.share_whatsapp', {}, 'Share List via WhatsApp')}
          </wa-button>
          <wa-button appearance="outlined" style="width:100%;" id="btn-open-add-drawer">
            ${icon('plus')} ${t('grocery.add_detailed', {}, 'Add Detailed Item')}
          </wa-button>
        </div>

        <!-- Detailed Add Item Drawer -->
        <wa-drawer id="add-item-drawer" label="${t('grocery.add_detailed', {}, 'Add Detailed Item')}" placement="bottom" style="--size: 440px;">
          <form id="drawer-item-form" class="stack" style="gap:1rem;">
            <wa-input label="${t('grocery.item_name', {}, 'Item Name')}" id="drawer-name" placeholder="e.g. Basmati Rice" required></wa-input>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem;">
              <wa-input label="${t('grocery.quantity', {}, 'Quantity')}" type="number" id="drawer-qty" value="1" min="1" required></wa-input>
              <wa-select label="${t('grocery.unit', {}, 'Unit')}" id="drawer-unit" value="kg">
                <wa-option value="kg">kg</wa-option>
                <wa-option value="liters">liters</wa-option>
                <wa-option value="dozen">dozen</wa-option>
                <wa-option value="pack">pack</wa-option>
                <wa-option value="pcs">pcs</wa-option>
                <wa-option value="grams">grams</wa-option>
              </wa-select>
            </div>
            <wa-select label="${t('grocery.category', {}, 'Category')}" id="drawer-cat" value="Pantry">
              <wa-option value="Pantry">${t('grocery.categories.pantry', {}, 'Pantry')}</wa-option>
              <wa-option value="Dairy">${t('grocery.categories.dairy', {}, 'Dairy')}</wa-option>
              <wa-option value="Bakery">${t('grocery.categories.bakery', {}, 'Bakery')}</wa-option>
              <wa-option value="Produce">${t('grocery.categories.produce', {}, 'Produce')}</wa-option>
              <wa-option value="Household">${t('grocery.categories.household', {}, 'Household')}</wa-option>
              <wa-option value="Meat">${t('grocery.categories.meat', {}, 'Meat')}</wa-option>
              <wa-option value="Beverages">${t('grocery.categories.beverages', {}, 'Beverages')}</wa-option>
              <wa-option value="Other">${t('grocery.categories.other', {}, 'Other')}</wa-option>
            </wa-select>
            <wa-button type="submit" variant="brand" size="large" style="width:100%; margin-top:0.5rem;">
              Save Item
            </wa-button>
          </form>
        </wa-drawer>
      </div>
    `;
  },

  async afterRender(params = {}) {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    let activeListId = 1;
    let activeCategory = 'All';
    let currentItems = [];
    let currentLists = [];

    const container = document.getElementById('grocery-items-container');
    const tabsBar = document.getElementById('grocery-lists-tabs');
    const drawer = document.getElementById('add-item-drawer');

    if (params?.action === 'add') {
      if (drawer) {
        setTimeout(() => { drawer.open = true; }, 100);
      }
    }

    const renderItems = () => {
      if (!container) return;
      let filtered = currentItems;
      if (activeCategory !== 'All') {
        filtered = filtered.filter((i) => (i.category || 'General').toLowerCase() === activeCategory.toLowerCase());
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="text-quiet" style="text-align:center; padding:2rem 0;">
            <p style="margin:0; font-weight:600;">No items found in this list.</p>
            <p style="margin:0.25rem 0 0 0; font-size:0.8rem;">Type an item name above to quickly add it.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map((item) => `
        <div class="grocery-item-row ${item.is_checked ? 'is-checked' : ''}" style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid var(--wa-color-surface-border);">
          <label style="display:flex; align-items:center; gap:0.75rem; cursor:pointer; flex:1;">
            <wa-checkbox ${item.is_checked ? 'checked' : ''} data-toggle-item="${item.id}"></wa-checkbox>
            <div>
              <div class="grocery-item-name ${item.is_checked ? 'text-strike text-quiet' : ''}" style="font-weight:500; font-size:0.95rem;">${item.name}</div>
              <div class="text-quiet" style="font-size:0.78rem;">${item.category || 'General'}</div>
            </div>
          </label>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="wa-tag" style="font-size:0.8rem;">${item.quantity || 1} ${item.unit || 'pcs'}</span>
            <button class="app-topbar__icon-btn" data-delete-item="${item.id}" aria-label="Delete Item" style="color:var(--wa-color-red-40); font-size:0.85rem;">
              ${icon('trash-can')}
            </button>
          </div>
        </div>
      `).join('');

      // Wire checkboxes
      container.querySelectorAll('[data-toggle-item]').forEach((cb) => {
        cb.addEventListener('change', async () => {
          const itemId = cb.dataset.toggleItem;
          const itm = currentItems.find((i) => String(i.id) === String(itemId));
          if (itm) {
            itm.is_checked = !itm.is_checked;
            renderItems();
            try {
              await api.toggleGroceryItem(activeListId, itemId, hid);
            } catch (e) {
              // local state already toggled
            }
          }
        });
      });

      // Wire deletes
      container.querySelectorAll('[data-delete-item]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const itemId = btn.dataset.deleteItem;
          currentItems = currentItems.filter((i) => String(i.id) !== String(itemId));
          renderItems();
          pushToast({ message: 'Item removed', variant: 'neutral' });
          try {
            await api.deleteGroceryItem(activeListId, itemId, hid);
          } catch (e) {
            // local state updated
          }
        });
      });
    };

    // Fetch lists from backend
    try {
      const res = await api.getGroceryLists(hid);
      if (res?.data && res.data.length > 0) {
        currentLists = res.data;
        activeListId = currentLists[0].id;
        
        // Render tabs
        if (tabsBar) {
          tabsBar.innerHTML = currentLists.map((l, idx) => `
            <button class="filter-chip ${idx === 0 ? 'is-active' : ''}" data-list-id="${l.id}">${l.name}</button>
          `).join('');

          tabsBar.querySelectorAll('.filter-chip').forEach((btn) => {
            btn.addEventListener('click', async () => {
              tabsBar.querySelectorAll('.filter-chip').forEach((b) => b.classList.remove('is-active'));
              btn.classList.add('is-active');
              activeListId = btn.dataset.listId;
              const dRes = await api.getGroceryList(activeListId, hid).catch(() => null);
              currentItems = dRes?.data?.items || [];
              renderItems();
            });
          });
        }

        const detailRes = await api.getGroceryList(activeListId, hid).catch(() => null);
        currentItems = detailRes?.data?.items || currentLists[0].items || [];
      } else {
        currentItems = [];
      }
    } catch (e) {
      currentItems = [];
    }

    renderItems();

    // Category filter clicking
    document.querySelectorAll('#category-filters .filter-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#category-filters .filter-chip').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeCategory = btn.dataset.cat;
        renderItems();
      });
    });

    // Quick add submit
    const quickForm = document.getElementById('grocery-quick-form');
    quickForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('quick-item-name');
      const name = input?.value?.trim();
      if (!name) return;

      const newItem = {
        id: Date.now(),
        name,
        quantity: 1,
        unit: 'pcs',
        category: activeCategory === 'All' ? 'Pantry' : activeCategory,
        is_checked: false,
      };

      currentItems.unshift(newItem);
      input.value = '';
      renderItems();
      pushToast({ message: `Added "${name}"`, variant: 'success' });

      try {
        const addRes = await api.addGroceryItem(activeListId, {
          name,
          quantity: 1,
          unit: 'pcs',
          category: newItem.category,
        }, hid);
        if (addRes?.data?.id) {
          newItem.id = addRes.data.id;
        }
      } catch (err) {
        // Kept in local state
      }
    });

    // WhatsApp Share Button
    document.getElementById('btn-whatsapp-share')?.addEventListener('click', () => {
      const pending = currentItems.filter((i) => !i.is_checked);
      const listName = 'Weekly Essentials';
      let msg = `*Gharly Grocery List: ${listName}*\n\n`;
      if (pending.length === 0) {
        msg += 'All items have been purchased!\n';
      } else {
        pending.forEach((i) => {
          msg += `- [ ] ${i.name} (${i.quantity} ${i.unit})\n`;
        });
      }
      msg += `\nShared via GharlyApp (https://gharlyapp.com)`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });

    // Detailed Add Drawer
    document.getElementById('btn-open-add-drawer')?.addEventListener('click', () => {
      if (drawer) drawer.open = true;
    });

    const drawerForm = document.getElementById('drawer-item-form');
    drawerForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('drawer-name')?.value?.trim();
      const qty = parseFloat(document.getElementById('drawer-qty')?.value) || 1;
      const unit = document.getElementById('drawer-unit')?.value || 'pcs';
      const cat = document.getElementById('drawer-cat')?.value || 'Pantry';

      if (!name) return;

      const newItem = {
        id: Date.now(),
        name,
        quantity: qty,
        unit,
        category: cat,
        is_checked: false,
      };

      currentItems.unshift(newItem);
      renderItems();
      if (drawer) drawer.open = false;
      drawerForm.reset();
      pushToast({ message: `Added "${name}"`, variant: 'success' });

      try {
        await api.addGroceryItem(activeListId, {
          name,
          quantity: qty,
          unit,
          category: cat,
        }, hid);
      } catch (err) {
        // local
      }
    });

    // Pull-to-refresh listener
    document.addEventListener('app:refresh', async () => {
      await loadLists();
      await loadItems(activeListId);
    });
  },
};

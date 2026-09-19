import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';
import { formatRelativeTime } from '../utils/format.js';
import { confirmDialog } from '../services/dialog.js';
import { householdStore } from '../state/household-store.js';
import { householdSync } from '../services/household-sync.js';

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
          <form id="grocery-quick-form" onsubmit="event.preventDefault(); return false;" style="display:flex; gap:0.5rem; align-items:center; width:100%;">
            <wa-input id="quick-item-name" placeholder="${t('grocery.quick_add_placeholder', {}, 'Add item (e.g. Milk 2L, Eggs)...')}" style="flex:1 1 0; min-width:0; width:100%;" required></wa-input>
            <wa-button type="submit" variant="brand" id="btn-quick-add" data-add-btn style="flex-shrink:0; white-space:nowrap;">${t('grocery.add_btn', {}, '+ Add')}</wa-button>
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
          <form id="drawer-item-form" onsubmit="event.preventDefault(); return false;" class="stack" style="gap:1rem;">
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
            <wa-button type="submit" variant="brand" id="btn-drawer-item-submit" size="l" style="width:100%; margin-top:0.5rem;">
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
    let currentLists = [{ id: 1, name: 'Weekly Essentials', items: [] }];

    const container = document.getElementById('grocery-items-container');
    const tabsBar = document.getElementById('grocery-lists-tabs');
    const drawer = document.getElementById('add-item-drawer');

    const getInputValue = (id) => {
      const el = document.getElementById(id);
      if (!el) return '';
      if (el.value !== undefined && el.value !== null && el.value !== '') return String(el.value);
      const inner = el.shadowRoot ? el.shadowRoot.querySelector('input, select, textarea') : el.querySelector('input, select, textarea');
      if (inner && inner.value !== undefined && inner.value !== null && inner.value !== '') return String(inner.value);
      return el.getAttribute('value') || '';
    };

    const getStorageKey = (lid) => `digez_grocery_items_${hid}_${lid || activeListId || 1}`;

    const saveLocalItems = () => {
      try {
        localStorage.setItem(getStorageKey(activeListId), JSON.stringify(currentItems));
      } catch (e) {}
    };

    const loadLocalItems = () => {
      try {
        const raw = localStorage.getItem(getStorageKey(activeListId));
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentItems = parsed;
          }
        }
      } catch (e) {}
    };

    // Initial load from local cache
    loadLocalItems();

    const openAddDrawer = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (drawer) {
        document.getElementById('drawer-item-form')?.reset();
        drawer.removeAttribute('data-edit-id');
        drawer.label = 'Add Grocery Item';
        drawer.open = true;
      }
    };

    if (params?.action === 'add') {
      setTimeout(() => { openAddDrawer(); }, 100);
      window.history.replaceState(null, '', '#/grocery');
    }

    // Immediately bind drawer open trigger
    document.getElementById('btn-open-add-drawer')?.addEventListener('click', openAddDrawer);

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
            <button class="app-topbar__icon-btn" data-edit-item="${item.id}" aria-label="Edit Item" style="color:var(--wa-color-text-quiet); font-size:0.85rem;">
              ${icon('pen')}
            </button>
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
          const targetListId = activeListId || currentLists[0]?.id || 1;

          await householdSync.mutate({
            entity: 'grocery',
            operation: 'toggle',
            optimisticUpdate: (prev) => {
              const updatedItems = (prev.grocery?.items || []).map((i) => {
                if (String(i.id) === String(itemId)) {
                  return { ...i, is_checked: !i.is_checked };
                }
                return i;
              });
              const chk = updatedItems.filter((i) => i.is_checked).length;
              return {
                grocery: {
                  ...prev.grocery,
                  items: updatedItems,
                  checked_count: chk,
                  pending_count: updatedItems.length - chk,
                },
              };
            },
            apiCall: () => api.toggleGroceryItem(targetListId, itemId, hid),
          });
        });
      });

      // Wire deletes
      container.querySelectorAll('[data-delete-item]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const itemId = btn.dataset.deleteItem;
          const itm = currentItems.find((i) => String(i.id) === String(itemId));
          
          if (!itm) return;

          const confirmed = await confirmDialog({
            title: 'Delete Grocery Item',
            message: `Are you sure you want to delete "${itm.name}"?`,
            confirmText: 'Delete',
            variant: 'danger'
          });

          if (!confirmed) return;

          const targetListId = activeListId || currentLists[0]?.id || 1;
          pushToast({ message: 'Item removed', variant: 'neutral' });

          try {
            await householdSync.mutate({
              entity: 'grocery',
              operation: 'delete',
              optimisticUpdate: (prev) => {
                const updatedItems = (prev.grocery?.items || []).filter((i) => String(i.id) !== String(itemId));
                const chk = updatedItems.filter((i) => i.is_checked).length;
                return {
                  grocery: {
                    ...prev.grocery,
                    items: updatedItems,
                    total_count: updatedItems.length,
                    checked_count: chk,
                    pending_count: updatedItems.length - chk,
                  },
                };
              },
              apiCall: () => api.deleteGroceryItem(targetListId, itemId, hid),
            });
          } catch (e) {
            console.error('Failed to delete grocery item on backend', e);
            pushToast({ message: 'Failed to delete grocery item', variant: 'danger' });
          }
        });
      });

      // Wire edits
      container.querySelectorAll('[data-edit-item]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const itemId = btn.dataset.editItem;
          const itm = currentItems.find((i) => String(i.id) === String(itemId));
          if (!itm) return;

          document.getElementById('drawer-name').value = itm.name;
          document.getElementById('drawer-qty').value = itm.quantity || 1;
          document.getElementById('drawer-unit').value = itm.unit || 'pcs';
          document.getElementById('drawer-cat').value = itm.category || 'Pantry';

          const drawer = document.getElementById('drawer-add-item');
          if (drawer) {
            drawer.setAttribute('data-edit-id', itm.id);
            drawer.label = 'Edit Item';
            drawer.open = true;
          }
        });
      });
    };

    // Category filter clicking
    document.querySelectorAll('#category-filters .filter-chip').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('#category-filters .filter-chip').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeCategory = btn.dataset.cat;
        renderItems();
      });
    });

    // Quick add handler
    let isQuickAdding = false;
    const handleQuickAdd = async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isQuickAdding) return;

      const input = document.getElementById('quick-item-name');
      const name = getInputValue('quick-item-name')?.trim();
      if (!name) return;

      isQuickAdding = true;

      const targetCategory = activeCategory === 'All' ? 'Pantry' : activeCategory;
      const listTargetId = activeListId || currentLists[0]?.id || 1;
      const newItem = {
        name,
        quantity: 1,
        unit: 'pcs',
        category: targetCategory,
        is_checked: false,
      };

      if (input) input.value = '';
      pushToast({ message: `Added "${name}"`, variant: 'success' });

      try {
        await householdSync.mutate({
          entity: 'grocery',
          operation: 'create',
          optimisticUpdate: (prev) => {
            const updatedItems = [{ id: 'local-' + Date.now(), ...newItem }, ...(prev.grocery?.items || [])];
            return {
              grocery: {
                ...prev.grocery,
                items: updatedItems,
                total_count: updatedItems.length,
                pending_count: (prev.grocery?.pending_count || 0) + 1,
              },
            };
          },
          apiCall: () => api.addGroceryItem(listTargetId, newItem, hid),
        });
      } catch (err) {
        console.warn('Grocery quick add fallback:', err);
      } finally {
        setTimeout(() => {
          isQuickAdding = false;
        }, 250);
      }
    };

    document.getElementById('grocery-quick-form')?.addEventListener('submit', handleQuickAdd);
    document.getElementById('btn-quick-add')?.addEventListener('click', (e) => {
      e.preventDefault();
      handleQuickAdd(e);
    });
    document.getElementById('quick-item-name')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleQuickAdd(e);
      }
    });

    // Detailed Add Drawer submit handler
    let isDrawerAdding = false;
    const handleDrawerAdd = async (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isDrawerAdding) return;

      const name = getInputValue('drawer-name')?.trim();
      const qty = parseFloat(getInputValue('drawer-qty')) || 1;
      const unit = getInputValue('drawer-unit') || 'kg';
      const cat = getInputValue('drawer-cat') || 'Pantry';

      if (!name) return;

      isDrawerAdding = true;

      const drawer = document.getElementById('drawer-add-item');
      const editId = drawer ? drawer.getAttribute('data-edit-id') : null;
      const listTargetId = activeListId || currentLists[0]?.id || 1;

      const itemPayload = {
        name,
        quantity: qty,
        unit,
        category: cat,
      };

      if (editId) {
        // Edit flow
        pushToast({ message: `Updated "${name}"`, variant: 'success' });

        try {
          await householdSync.mutate({
            entity: 'grocery',
            operation: 'update',
            optimisticUpdate: (prev) => {
              const updatedItems = (prev.grocery?.items || []).map((i) => {
                if (String(i.id) === String(editId)) {
                  return { ...i, ...itemPayload };
                }
                return i;
              });
              return {
                grocery: {
                  ...prev.grocery,
                  items: updatedItems,
                },
              };
            },
            apiCall: () => api.updateGroceryItem(listTargetId, editId, itemPayload, hid),
          });
        } catch (err) {
          console.error('Failed to update grocery item on backend', err);
        }
      } else {
        // Add flow
        pushToast({ message: `Added "${name}"`, variant: 'success' });

        try {
          await householdSync.mutate({
            entity: 'grocery',
            operation: 'create',
            optimisticUpdate: (prev) => {
              const updatedItems = [{ id: 'local-' + Date.now(), ...itemPayload, is_checked: false }, ...(prev.grocery?.items || [])];
              return {
                grocery: {
                  ...prev.grocery,
                  items: updatedItems,
                  total_count: updatedItems.length,
                  pending_count: (prev.grocery?.pending_count || 0) + 1,
                },
              };
            },
            apiCall: () => api.addGroceryItem(listTargetId, itemPayload, hid),
          });
        } catch (err) {
          console.warn('Grocery drawer add fallback:', err);
        }
      }

      if (drawer) {
        if (typeof drawer.hide === 'function') drawer.hide();
        else drawer.open = false;
        drawer.removeAttribute('data-edit-id');
        drawer.label = 'Add Grocery Item';
      }
      document.getElementById('drawer-item-form')?.reset();

      setTimeout(() => {
        isDrawerAdding = false;
      }, 250);
    };

    document.getElementById('drawer-item-form')?.addEventListener('submit', handleDrawerAdd);
    document.getElementById('btn-drawer-item-submit')?.addEventListener('click', (e) => {
      e.preventDefault();
      handleDrawerAdd(e);
    });

    // WhatsApp Share Button
    document.getElementById('btn-whatsapp-share')?.addEventListener('click', (e) => {
      e.preventDefault();
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

    const syncFromStore = (state) => {
      if (!state) return;
      const g = state.grocery;
      if (g) {
        if (Array.isArray(g.lists) && g.lists.length > 0) {
          currentLists = g.lists;
        } else {
          currentLists = [{ id: g.primary_list_id || 1, name: g.primary_list_name || 'Weekly Essentials', items: g.items || [] }];
        }

        if (!activeListId || !currentLists.some((l) => String(l.id) === String(activeListId))) {
          activeListId = currentLists[0]?.id || 1;
        }

        if (Array.isArray(g.items)) {
          currentItems = g.items;
        }
      }

      // Render tabs
      if (tabsBar) {
        tabsBar.innerHTML = currentLists.map((l) => `
          <button class="filter-chip ${String(l.id) === String(activeListId) ? 'is-active' : ''}" data-list-id="${l.id}">${l.name}</button>
        `).join('');

        tabsBar.querySelectorAll('.filter-chip').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            tabsBar.querySelectorAll('.filter-chip').forEach((b) => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            activeListId = btn.dataset.listId;
            const dRes = await api.getGroceryList(activeListId, hid).catch(() => null);
            if (dRes?.data?.items && Array.isArray(dRes.data.items)) {
              currentItems = dRes.data.items;
            }
            renderItems();
          });
        });
      }

      renderItems();
    };

    // Initial 0ms render from current store
    syncFromStore(householdStore.get());

    // Subscribe to store updates for real-time cross-screen sync
    const unsubscribe = householdStore.subscribe(syncFromStore);

    // Background sync
    householdSync.sync({ force: false });

    // Pull-to-refresh listener
    document.addEventListener('app:refresh', async () => {
      await householdSync.sync({ force: true });
    });
  },
};

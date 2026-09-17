import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';

export const hisabScreen = {
  meta: { topbar: { title: 'Personal Hisab' }, nav: 'hisab' },

  render() {
    return `
      <div class="screen hisab-screen">
        <!-- High-Impact Financial Overview (Stacked for full number visibility) -->
        <div class="hisab-overview-panel">
          <!-- Hero Net Balance Card -->
          <div class="card hisab-hero-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="hisab-hero-eyebrow">${t('hisab.remaining', {}, 'NET BALANCE / SAVINGS')}</span>
              <span class="wa-tag badge-emerald" id="hisab-net-badge">SURPLUS</span>
            </div>
            <div class="hisab-hero-amount" id="hisab-total-net">PKR 0</div>
            <div class="hisab-hero-meta" id="hisab-hero-sub">Current monthly cashflow status</div>
          </div>

          <!-- 2-Column Income & Expense Breakdown Cards -->
          <div class="hisab-sub-grid">
            <div class="card hisab-metric-card">
              <div class="hisab-metric-icon" style="background:var(--wa-color-green-90); color:var(--wa-color-green-40);">
                ${icon('arrow-down-left')}
              </div>
              <div class="hisab-metric-body">
                <span class="hisab-metric-label">${t('hisab.income', {}, 'TOTAL INCOME')}</span>
                <span class="hisab-metric-value text-green" id="hisab-total-income">PKR 0</span>
              </div>
            </div>

            <div class="card hisab-metric-card">
              <div class="hisab-metric-icon" style="background:var(--wa-color-red-90); color:var(--wa-color-red-40);">
                ${icon('arrow-up-right')}
              </div>
              <div class="hisab-metric-body">
                <span class="hisab-metric-label">${t('hisab.expense', {}, 'TOTAL EXPENSE')}</span>
                <span class="hisab-metric-value text-red" id="hisab-total-expense">PKR 0</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Navigation Tabs -->
        <div class="filter-chips-row" id="hisab-tabs" style="margin-top:1rem;">
          <button class="filter-chip is-active" data-tab="transactions">${t('hisab.transactions', {}, 'Transactions')}</button>
          <button class="filter-chip" data-tab="udhaar">${t('hisab.udhaar', {}, 'Udhaar & Khata')}</button>
        </div>

        <!-- Transactions View -->
        <div id="view-transactions" style="margin-top:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span class="text-quiet" style="font-size:0.85rem; font-weight:600;">${t('hisab.monthly_flow', {}, 'Monthly Flow')}</span>
            <wa-button variant="brand" size="small" id="btn-open-tx-drawer">${t('hisab.record_entry', {}, '+ Record Entry')}</wa-button>
          </div>

          <div class="stack" id="transactions-list" style="gap:0.6rem;">
            <div class="card text-quiet" style="text-align:center; padding:1.5rem 0;">Loading transactions...</div>
          </div>
        </div>

        <!-- Udhaar & Khata View (Debts / Receivables) -->
        <div id="view-udhaar" style="display:none; margin-top:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span class="text-quiet" style="font-size:0.85rem; font-weight:600;">${t('hisab.udhaar', {}, 'Debts & Receivables')}</span>
            <wa-button variant="brand" size="small" id="btn-open-debt-drawer">+ Add Debt / Khata</wa-button>
          </div>

          <div class="stack" id="debts-list" style="gap:0.6rem;">
            <div class="card text-quiet" style="text-align:center; padding:1.5rem 0;">Loading debts...</div>
          </div>
        </div>

        <!-- Add Transaction Drawer -->
        <wa-drawer id="tx-drawer" label="${t('hisab.record_entry', {}, 'Record Transaction')}" placement="bottom" style="--size: 480px;">
          <form id="tx-form" class="stack" style="gap:1rem;">
            <wa-select label="Type" id="tx-type" value="expense">
              <wa-option value="expense">Expense</wa-option>
              <wa-option value="income">Income</wa-option>
            </wa-select>
            <wa-input label="Amount (PKR)" type="number" id="tx-amount" placeholder="e.g. 2500" required></wa-input>
            <wa-input label="Description / Title" id="tx-notes" placeholder="e.g. Groceries at Metro" required></wa-input>
            <wa-select label="Category" id="tx-category" value="Groceries">
              <wa-option value="Groceries">Groceries</wa-option>
              <wa-option value="Utilities">Utilities & Bills</wa-option>
              <wa-option value="Rent">Housing / Rent</wa-option>
              <wa-option value="Transport">Transport & Fuel</wa-option>
              <wa-option value="Medical">Medical & Health</wa-option>
              <wa-option value="Salary">Salary / Income</wa-option>
              <wa-option value="Other">Other</wa-option>
            </wa-select>
            <wa-input label="Date" type="date" id="tx-date"></wa-input>
            <wa-button type="submit" variant="brand" size="large" style="width:100%; margin-top:0.5rem;">
              Save Entry
            </wa-button>
          </form>
        </wa-drawer>

        <!-- Add Debt Drawer -->
        <wa-drawer id="debt-drawer" label="Add Udhaar / Debt Entry" placement="bottom" style="--size: 480px;">
          <form id="debt-form" class="stack" style="gap:1rem;">
            <wa-select label="Direction" id="debt-dir" value="lent">
              <wa-option value="lent">${t('hisab.money_owed_to_me', {}, 'I Lent Money (Receivable)')}</wa-option>
              <wa-option value="borrowed">${t('hisab.money_i_owe', {}, 'I Borrowed Money (Payable)')}</wa-option>
            </wa-select>
            <wa-input label="Person Name" id="debt-person" placeholder="e.g. Tariq Mehmood" required></wa-input>
            <wa-input label="Phone Number (for WhatsApp reminder)" id="debt-phone" placeholder="e.g. +923001234567"></wa-input>
            <wa-input label="Amount (PKR)" type="number" id="debt-amount" placeholder="e.g. 15000" required></wa-input>
            <wa-input label="Due Date" type="date" id="debt-due"></wa-input>
            <wa-button type="submit" variant="brand" size="large" style="width:100%; margin-top:0.5rem;">
              Save Debt Record
            </wa-button>
          </form>
        </wa-drawer>
      </div>
    `;
  },

  async afterRender() {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    let transactions = [];
    let debts = [];
    let income = 0;
    let expense = 0;

    const txDrawer = document.getElementById('tx-drawer');
    const debtDrawer = document.getElementById('debt-drawer');

    // Default today for tx-date
    const txDateInput = document.getElementById('tx-date');
    if (txDateInput) txDateInput.value = new Date().toISOString().slice(0, 10);

    const debtDueInput = document.getElementById('debt-due');
    if (debtDueInput) debtDueInput.value = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const updateSummaries = () => {
      const net = income - expense;
      const incomeEl = document.getElementById('hisab-total-income');
      const expenseEl = document.getElementById('hisab-total-expense');
      const netEl = document.getElementById('hisab-total-net');
      const netBadge = document.getElementById('hisab-net-badge');
      const heroSub = document.getElementById('hisab-hero-sub');

      if (incomeEl) incomeEl.textContent = `PKR ${income.toLocaleString()}`;
      if (expenseEl) expenseEl.textContent = `PKR ${expense.toLocaleString()}`;
      if (netEl) {
        netEl.textContent = `${net < 0 ? '-' : ''}PKR ${Math.abs(net).toLocaleString()}`;
        netEl.style.color = net >= 0 ? 'var(--wa-color-green-40)' : 'var(--wa-color-red-40)';
      }
      if (netBadge) {
        netBadge.textContent = net >= 0 ? 'SURPLUS' : 'DEFICIT';
        netBadge.className = `wa-tag ${net >= 0 ? 'badge-emerald' : 'badge-rose'}`;
      }
      if (heroSub) {
        heroSub.textContent = net >= 0 ? 'Healthy surplus funds available' : 'Monthly expenses exceed income';
      }
    };

    const renderTransactions = () => {
      const listEl = document.getElementById('transactions-list');
      if (!listEl) return;

      if (transactions.length === 0) {
        listEl.innerHTML = `
          <div class="card" style="text-align:center; padding:2rem 1rem;">
            <p style="margin:0; font-weight:500;">No transactions recorded this month.</p>
            <p class="text-quiet" style="font-size:0.85rem; margin-top:0.3rem;">Tap "+ Record Entry" to log expenses or income.</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = transactions.map((t) => `
        <div class="card list-row" style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="list-row__icon" style="background:${t.type === 'income' ? 'var(--wa-color-green-90)' : 'var(--wa-color-red-90)'}; color:${t.type === 'income' ? 'var(--wa-color-green-40)' : 'var(--wa-color-red-40)'};">
              ${icon(t.type === 'income' ? 'arrow-down-left' : 'arrow-up-right')}
            </div>
            <div>
              <div style="font-weight:600; font-size:0.95rem;">${t.notes || t.title || t.category}</div>
              <div class="text-quiet" style="font-size:0.8rem;">${t.category} &bull; ${t.date || 'Recent'}</div>
            </div>
          </div>
          <div style="font-weight:700; font-size:1rem; color:${t.type === 'income' ? 'var(--wa-color-green-40)' : 'var(--wa-color-red-40)'};">
            ${t.type === 'income' ? '+' : '-'} PKR ${parseFloat(t.amount || 0).toLocaleString()}
          </div>
        </div>
      `).join('');
    };

    const renderDebts = () => {
      const listEl = document.getElementById('debts-list');
      if (!listEl) return;

      if (debts.length === 0) {
        listEl.innerHTML = `
          <div class="card" style="text-align:center; padding:2rem 1rem;">
            <p style="margin:0; font-weight:500;">${t('hisab.no_debts', {}, 'No active debts or receivables.')}</p>
            <p class="text-quiet" style="font-size:0.85rem; margin-top:0.3rem;">All household lendings and borrowings are settled.</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = debts.map((d) => {
        const remaining = parseFloat(d.amount || 0) - parseFloat(d.paid || d.paid_amount || 0);
        return `
          <div class="card" style="padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <span class="wa-tag ${d.direction === 'lent' ? 'badge-amber' : 'badge-purple'}">
                  ${d.direction === 'lent' ? t('hisab.money_owed_to_me', {}, 'Receivable (Lent)') : t('hisab.money_i_owe', {}, 'Payable (Borrowed)')}
                </span>
                <h4 style="margin:0.4rem 0 0.2rem 0; font-size:1.05rem;">${d.person || d.person_name}</h4>
                <div class="text-quiet" style="font-size:0.8rem;">Due: ${d.due || d.due_date || 'N/A'} &bull; Phone: ${d.phone || d.person_phone || 'N/A'}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:1.1rem; font-weight:700;">PKR ${remaining.toLocaleString()}</div>
                <div class="text-quiet" style="font-size:0.75rem;">Total: PKR ${parseFloat(d.amount).toLocaleString()}</div>
              </div>
            </div>

            <div style="display:flex; gap:0.5rem; margin-top:0.85rem;">
              ${
                d.direction === 'lent'
                  ? `
                    <wa-button size="small" appearance="outlined" data-whatsapp-debt="${d.id}" style="flex:1;">
                      ${icon('comment-sms')} ${t('hisab.whatsapp_reminder', {}, 'WhatsApp Reminder')}
                    </wa-button>
                  `
                  : ''
              }
              <wa-button size="small" variant="brand" data-settle-debt="${d.id}" style="flex:1;">
                ${t('hisab.settle_paid', {}, 'Settle / Paid')}
              </wa-button>
            </div>
          </div>
        `;
      }).join('');

      // WhatsApp reminders
      listEl.querySelectorAll('[data-whatsapp-debt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const debtId = btn.dataset.whatsappDebt;
          const d = debts.find((item) => String(item.id) === String(debtId));
          if (d) {
            const remaining = parseFloat(d.amount) - parseFloat(d.paid || d.paid_amount || 0);
            const text = `Salam ${d.person || d.person_name}, gentle reminder regarding the pending amount of PKR ${remaining.toLocaleString()} (due ${d.due || d.due_date || 'soon'}). Please settle when convenient. Thank you! - GharlyApp`;
            const cleanPhone = (d.phone || d.person_phone || '').replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
          }
        });
      });

      // Settle debt
      listEl.querySelectorAll('[data-settle-debt]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const debtId = btn.dataset.settleDebt;
          const d = debts.find((item) => String(item.id) === String(debtId));
          if (d) {
            d.paid = d.amount;
            debts = debts.filter((item) => String(item.id) !== String(debtId));
            renderDebts();
            pushToast({ message: 'Debt marked settled', variant: 'success' });
            try {
              await api.settleHisabDebt(debtId, d.amount, hid);
            } catch (e) {
              // local
            }
          }
        });
      });
    };

    // Tab switching
    document.querySelectorAll('#hisab-tabs .filter-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#hisab-tabs .filter-chip').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const tab = btn.dataset.tab;
        const txView = document.getElementById('view-transactions');
        const udhaarView = document.getElementById('view-udhaar');
        if (txView && udhaarView) {
          txView.style.display = tab === 'transactions' ? 'block' : 'none';
          udhaarView.style.display = tab === 'udhaar' ? 'block' : 'none';
        }
      });
    });

    // Fetch live summaries & transactions
    try {
      const [sumRes, txRes, debtsRes] = await Promise.all([
        api.getHisabSummary(null, hid).catch(() => null),
        api.getHisabTransactions(null, hid).catch(() => null),
        api.getHisabDebts(null, hid).catch(() => null),
      ]);

      if (sumRes?.data) {
        income = parseFloat(sumRes.data.total_income || 0);
        expense = parseFloat(sumRes.data.total_expense || 0);
      }
      if (txRes?.data) {
        transactions = txRes.data.map((t) => ({
          id: t.id,
          title: t.notes || t.category,
          amount: t.amount,
          type: t.type,
          category: t.category,
          date: t.transaction_date || 'Today',
        }));
      }
      if (debtsRes?.data) {
        debts = debtsRes.data;
      }
    } catch (e) {
      console.warn('Hisab backend fetch fallback');
    }

    updateSummaries();
    renderTransactions();
    renderDebts();

    // Drawer triggers
    document.getElementById('btn-open-tx-drawer')?.addEventListener('click', () => {
      if (txDrawer) txDrawer.open = true;
    });

    document.getElementById('btn-open-debt-drawer')?.addEventListener('click', () => {
      if (debtDrawer) debtDrawer.open = true;
    });

    // Add transaction submit
    document.getElementById('tx-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const type = document.getElementById('tx-type')?.value || 'expense';
      const amount = parseFloat(document.getElementById('tx-amount')?.value) || 0;
      const notes = document.getElementById('tx-notes')?.value?.trim();
      const category = document.getElementById('tx-category')?.value || 'Groceries';
      const date = document.getElementById('tx-date')?.value || new Date().toISOString().slice(0, 10);

      if (amount <= 0 || !notes) return;

      const newTx = {
        id: Date.now(),
        title: notes,
        notes,
        amount,
        type,
        category,
        date,
      };

      transactions.unshift(newTx);
      if (type === 'income') income += amount;
      else expense += amount;

      updateSummaries();
      renderTransactions();
      if (txDrawer) txDrawer.open = false;
      document.getElementById('tx-form')?.reset();
      pushToast({ message: 'Transaction recorded', variant: 'success' });

      try {
        await api.addHisabTransaction({
          type,
          amount,
          category,
          notes,
          payment_method: 'Cash',
          transaction_date: date,
        }, hid);
      } catch (err) {
        // local
      }
    });

    // Add debt submit
    document.getElementById('debt-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const direction = document.getElementById('debt-dir')?.value || 'lent';
      const person = document.getElementById('debt-person')?.value?.trim();
      const phone = document.getElementById('debt-phone')?.value?.trim();
      const amount = parseFloat(document.getElementById('debt-amount')?.value) || 0;
      const due = document.getElementById('debt-due')?.value || 'Next Week';

      if (!person || amount <= 0) return;

      const newDebt = {
        id: Date.now(),
        person,
        person_name: person,
        phone,
        person_phone: phone,
        amount,
        paid: 0,
        due,
        due_date: due,
        direction,
      };

      debts.unshift(newDebt);
      renderDebts();
      if (debtDrawer) debtDrawer.open = false;
      document.getElementById('debt-form')?.reset();
      pushToast({ message: 'Debt record added', variant: 'success' });

      try {
        await api.addHisabDebt({
          person_name: person,
          person_phone: phone,
          amount,
          direction,
          due_date: due,
        }, hid);
      } catch (err) {
        // local
      }
    });
  },
};

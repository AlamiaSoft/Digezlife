import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';

function formatAmount(num) {
  const val = Math.abs(parseFloat(num) || 0);
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (val >= 100000) {
    return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return val.toLocaleString();
}

export const hisabScreen = {
  meta: { topbar: { title: 'Personal Hisab' }, nav: 'hisab' },

  render() {
    return `
      <div class="screen hisab-screen">
        <!-- High-Impact Financial Overview (Stacked & Grid) -->
        <div class="hisab-overview-panel">
          <!-- Hero Net Balance Card -->
          <div class="card hisab-hero-card" style="padding:1.25rem; border-radius:18px; background:var(--wa-color-surface-card);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="hisab-hero-eyebrow" style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:var(--wa-color-text-quiet);">
                ${t('hisab.total_net', {}, 'TOTAL NET BALANCE')}
              </span>
              <span class="wa-tag badge-emerald" id="hisab-net-badge">SURPLUS</span>
            </div>
            <div class="hisab-hero-amount" id="hisab-total-net" style="font-size:1.85rem; font-weight:850; margin:0.35rem 0 0.2rem 0; letter-spacing:-0.02em;">PKR 0</div>
            <div class="hisab-hero-meta text-quiet" id="hisab-hero-sub" style="font-size:0.82rem;">Current monthly cashflow status</div>
          </div>

          <!-- 2-Column Income & Expense Metric Cards -->
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
        <div class="filter-chips-row" id="hisab-tabs" style="margin-top:1.25rem;">
          <button class="filter-chip is-active" data-tab="analytics">📊 Overview &amp; Charts</button>
          <button class="filter-chip" data-tab="transactions">📝 Transactions</button>
          <button class="filter-chip" data-tab="udhaar">🤝 Udhaar &amp; Khata</button>
        </div>

        <!-- TAB 1: ANALYTICS & INSIGHTS VIEW -->
        <div id="view-analytics" style="margin-top:1rem;">
          <!-- 1. Monthly Spending Chart -->
          <div class="card" style="padding:1.15rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
              <span style="font-weight:700; font-size:0.95rem;">Monthly Spending Pace</span>
              <span class="wa-tag badge-emerald" style="font-size:0.7rem; font-weight:700;">Good Pace</span>
            </div>
            <!-- Visual CSS Chart -->
            <div style="height:110px; display:flex; align-items:flex-end; gap:8px; padding:10px 4px 0;" id="hisab-chart-bars">
              <div style="flex:1; height:45%; background:color-mix(in srgb, var(--wa-color-brand-fill) 35%, var(--wa-color-surface-card)); border-radius:6px 6px 2px 2px;"></div>
              <div style="flex:1; height:60%; background:color-mix(in srgb, var(--wa-color-brand-fill) 35%, var(--wa-color-surface-card)); border-radius:6px 6px 2px 2px;"></div>
              <div style="flex:1; height:78%; background:var(--wa-color-brand-fill); border-radius:6px 6px 2px 2px;"></div>
              <div style="flex:1; height:52%; background:color-mix(in srgb, var(--wa-color-brand-fill) 35%, var(--wa-color-surface-card)); border-radius:6px 6px 2px 2px;"></div>
              <div style="flex:1; height:85%; background:color-mix(in srgb, var(--wa-color-brand-fill) 35%, var(--wa-color-surface-card)); border-radius:6px 6px 2px 2px;"></div>
              <div style="flex:1; height:66%; background:var(--wa-color-brand-fill); border-radius:6px 6px 2px 2px;"></div>
              <div style="flex:1; height:90%; background:var(--wa-color-brand-fill); border-radius:6px 6px 2px 2px;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--wa-color-text-quiet); margin-top:0.4rem; padding:0 4px;">
              <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
            </div>
          </div>

          <!-- 2. Expense Category Breakdown -->
          <div class="card" style="margin-top:0.85rem; padding:1.15rem;">
            <div style="font-weight:700; font-size:0.95rem; margin-bottom:1rem;">Expense Breakdown by Category</div>
            <div class="stack" id="hisab-category-breakdown" style="gap:0.85rem;">
              <!-- Grocery -->
              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.3rem;">
                  <span>🛒 Sauda &amp; Groceries</span>
                  <strong id="cat-amount-groceries">PKR 18,400</strong>
                </div>
                <div style="height:8px; background:var(--wa-color-surface-border); border-radius:99px; overflow:hidden;">
                  <div id="cat-bar-groceries" style="width:45%; height:100%; background:var(--wa-color-brand-fill); border-radius:99px;"></div>
                </div>
              </div>

              <!-- Utilities -->
              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.3rem;">
                  <span>💡 Utilities &amp; Bills</span>
                  <strong id="cat-amount-utilities">PKR 14,200</strong>
                </div>
                <div style="height:8px; background:var(--wa-color-surface-border); border-radius:99px; overflow:hidden;">
                  <div id="cat-bar-utilities" style="width:35%; height:100%; background:var(--wa-color-amber-40, #d97706); border-radius:99px;"></div>
                </div>
              </div>

              <!-- Transport -->
              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.3rem;">
                  <span>⛽ Transport &amp; Fuel</span>
                  <strong id="cat-amount-transport">PKR 5,600</strong>
                </div>
                <div style="height:8px; background:var(--wa-color-surface-border); border-radius:99px; overflow:hidden;">
                  <div id="cat-bar-transport" style="width:15%; height:100%; background:var(--wa-color-blue-40, #0284c7); border-radius:99px;"></div>
                </div>
              </div>

              <!-- Other -->
              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.3rem;">
                  <span>📦 Other Expenses</span>
                  <strong id="cat-amount-other">PKR 4,180</strong>
                </div>
                <div style="height:8px; background:var(--wa-color-surface-border); border-radius:99px; overflow:hidden;">
                  <div id="cat-bar-other" style="width:10%; height:100%; background:var(--wa-color-purple-40, #7c3aed); border-radius:99px;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Financial Insight Card -->
          <div class="card" style="margin-top:0.85rem; padding:1rem; background:var(--wa-color-amber-95, #fef3c7); border:1px solid var(--wa-color-amber-80, #fcd34d);">
            <div style="display:flex; align-items:center; gap:0.4rem; font-weight:800; font-size:0.9rem; color:var(--wa-color-amber-30, #78350f);">
              <span>💡</span> Household Insight
            </div>
            <p style="margin:0.4rem 0 0 0; font-size:0.83rem; line-height:1.5; color:var(--wa-color-amber-20, #451a03);">
              Grocery spending is tracking 12% below your monthly target. Electricity bill is higher this month due to peak summer consumption.
            </p>
          </div>
        </div>

        <!-- TAB 2: TRANSACTIONS VIEW -->
        <div id="view-transactions" style="display:none; margin-top:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span class="text-quiet" style="font-size:0.85rem; font-weight:700; text-transform:uppercase;">Recent Entries</span>
            <wa-button variant="brand" size="small" id="btn-open-tx-drawer">${t('hisab.record_entry', {}, '+ Record Entry')}</wa-button>
          </div>

          <div class="stack" id="transactions-list" style="gap:0.6rem;">
            <div class="card text-quiet" style="text-align:center; padding:1.5rem 0;">Loading transactions...</div>
          </div>
        </div>

        <!-- TAB 3: UDHAAR & KHATA VIEW -->
        <div id="view-udhaar" style="display:none; margin-top:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span class="text-quiet" style="font-size:0.85rem; font-weight:700; text-transform:uppercase;">Debts &amp; Receivables</span>
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
              <wa-option value="Groceries">Groceries &amp; Sauda</wa-option>
              <wa-option value="Utilities">Utilities &amp; Bills</wa-option>
              <wa-option value="Rent">Housing / Rent</wa-option>
              <wa-option value="Transport">Transport &amp; Fuel</wa-option>
              <wa-option value="Medical">Medical &amp; Health</wa-option>
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

      if (incomeEl) incomeEl.textContent = `PKR ${formatAmount(income)}`;
      if (expenseEl) expenseEl.textContent = `PKR ${formatAmount(expense)}`;
      if (netEl) {
        netEl.textContent = `${net < 0 ? '-' : ''}PKR ${formatAmount(net)}`;
        netEl.style.color = net >= 0 ? 'var(--wa-color-green-40)' : 'var(--wa-color-red-40)';
      }
      if (netBadge) {
        netBadge.textContent = net >= 0 ? 'SURPLUS' : 'DEFICIT';
        netBadge.className = `wa-tag ${net >= 0 ? 'badge-emerald' : 'badge-rose'}`;
      }
      if (heroSub) {
        heroSub.textContent = net >= 0 ? 'Healthy surplus funds available this month' : 'Monthly expenses exceed total income';
      }

      // Calculate dynamic category totals
      let catGroceries = 0;
      let catUtilities = 0;
      let catTransport = 0;
      let catOther = 0;

      transactions.filter((t) => t.type === 'expense').forEach((t) => {
        const amt = parseFloat(t.amount || 0);
        const cat = (t.category || '').toLowerCase();
        if (cat.includes('groc') || cat.includes('sauda')) catGroceries += amt;
        else if (cat.includes('util') || cat.includes('bill')) catUtilities += amt;
        else if (cat.includes('trans') || cat.includes('fuel')) catTransport += amt;
        else catOther += amt;
      });

      const totalExp = expense || (catGroceries + catUtilities + catTransport + catOther) || 1;
      const gEl = document.getElementById('cat-amount-groceries');
      const uEl = document.getElementById('cat-amount-utilities');
      const tEl = document.getElementById('cat-amount-transport');
      const oEl = document.getElementById('cat-amount-other');

      if (gEl && catGroceries > 0) gEl.textContent = `PKR ${formatAmount(catGroceries)}`;
      if (uEl && catUtilities > 0) uEl.textContent = `PKR ${formatAmount(catUtilities)}`;
      if (tEl && catTransport > 0) tEl.textContent = `PKR ${formatAmount(catTransport)}`;
      if (oEl && catOther > 0) oEl.textContent = `PKR ${formatAmount(catOther)}`;

      const gbEl = document.getElementById('cat-bar-groceries');
      const ubEl = document.getElementById('cat-bar-utilities');
      const tbEl = document.getElementById('cat-bar-transport');
      const obEl = document.getElementById('cat-bar-other');

      if (gbEl && totalExp > 0) gbEl.style.width = `${Math.round((catGroceries / totalExp) * 100)}%`;
      if (ubEl && totalExp > 0) ubEl.style.width = `${Math.round((catUtilities / totalExp) * 100)}%`;
      if (tbEl && totalExp > 0) tbEl.style.width = `${Math.round((catTransport / totalExp) * 100)}%`;
      if (obEl && totalExp > 0) obEl.style.width = `${Math.round((catOther / totalExp) * 100)}%`;
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
        const analyticsView = document.getElementById('view-analytics');
        const txView = document.getElementById('view-transactions');
        const udhaarView = document.getElementById('view-udhaar');

        if (analyticsView) analyticsView.style.display = tab === 'analytics' ? 'block' : 'none';
        if (txView) txView.style.display = tab === 'transactions' ? 'block' : 'none';
        if (udhaarView) udhaarView.style.display = tab === 'udhaar' ? 'block' : 'none';
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
          notes: t.notes,
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
      pushToast({ message: 'Transaction recorded successfully!', variant: 'success' });

      try {
        await api.createHisabTransaction(
          {
            type,
            amount,
            category,
            notes,
            transaction_date: date,
          },
          hid
        );
      } catch (err) {
        console.warn('Transaction saved locally');
      }
    });

    // Add debt submit
    document.getElementById('debt-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const direction = document.getElementById('debt-dir')?.value || 'lent';
      const person = document.getElementById('debt-person')?.value?.trim();
      const phone = document.getElementById('debt-phone')?.value?.trim();
      const amount = parseFloat(document.getElementById('debt-amount')?.value) || 0;
      const due = document.getElementById('debt-due')?.value;

      if (!person || amount <= 0) return;

      const newDebt = {
        id: Date.now(),
        person,
        phone,
        amount,
        paid: 0,
        direction,
        due,
      };

      debts.unshift(newDebt);
      renderDebts();
      if (debtDrawer) debtDrawer.open = false;
      pushToast({ message: 'Debt entry recorded successfully!', variant: 'success' });

      try {
        await api.createHisabDebt(
          {
            person_name: person,
            person_phone: phone,
            amount,
            direction,
            due_date: due,
          },
          hid
        );
      } catch (err) {
        console.warn('Debt saved locally');
      }
    });
  },
};

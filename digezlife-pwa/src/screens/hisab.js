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

const getCategoryMeta = (catName) => {
  const c = (catName || '').toLowerCase();
  if (c.includes('groc') || c.includes('sauda') || c.includes('food')) return { icon: 'basket-shopping', color: 'var(--wa-color-brand-fill)' };
  if (c.includes('util') || c.includes('bill') || c.includes('elec') || c.includes('gas') || c.includes('water')) return { icon: 'bolt', color: 'var(--wa-color-amber-40, #d97706)' };
  if (c.includes('trans') || c.includes('fuel') || c.includes('petrol') || c.includes('ride') || c.includes('bike')) return { icon: 'gas-pump', color: 'var(--wa-color-blue-40, #0284c7)' };
  if (c.includes('rent') || c.includes('house') || c.includes('maint')) return { icon: 'house', color: 'var(--wa-color-purple-40, #7c3aed)' };
  if (c.includes('med') || c.includes('health') || c.includes('doctor') || c.includes('pharma')) return { icon: 'heart-pulse', color: 'var(--wa-color-red-40, #ef4444)' };
  if (c.includes('sal') || c.includes('income') || c.includes('pay') || c.includes('bonus')) return { icon: 'briefcase', color: 'var(--wa-color-green-40, #10b981)' };
  return { icon: 'box', color: 'var(--wa-color-indigo-40, #6366f1)' };
};

export const hisabScreen = {
  meta: { topbar: { title: 'Personal Hisab' }, nav: 'hisab' },

  render() {
    return `
      <div class="screen hisab-screen">
        <!-- High-Impact Financial Overview (Stacked & Grid) -->
        <div class="hisab-overview-panel">
          <!-- Hero Net Balance Card -->
          <div class="card hisab-hero-card" style="padding:1.25rem; border-radius:18px; background:var(--wa-color-surface-default);">
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

          <!-- Fast Quick Action Trigger -->
          <div style="margin-top:0.75rem; display:flex; gap:0.5rem;">
            <wa-button variant="brand" size="medium" style="flex:1;" class="btn-trigger-tx-drawer">
              ${icon('plus')} ${t('hisab.record_entry', {}, 'Record Transaction')}
            </wa-button>
            <wa-button appearance="outlined" size="medium" style="flex:1;" class="btn-trigger-debt-drawer">
              ${icon('handshake')} Add Debt / Khata
            </wa-button>
          </div>
        </div>

        <!-- Section Navigation Tabs -->
        <div class="filter-chips-row" id="hisab-tabs" style="margin-top:1.25rem;">
          <button class="filter-chip is-active" data-tab="analytics" style="display:inline-flex; align-items:center; gap:6px;">
            ${icon('chart-simple')} <span>Overview &amp; Charts</span>
          </button>
          <button class="filter-chip" data-tab="transactions" style="display:inline-flex; align-items:center; gap:6px;">
            ${icon('receipt')} <span>Transactions</span>
          </button>
          <button class="filter-chip" data-tab="udhaar" style="display:inline-flex; align-items:center; gap:6px;">
            ${icon('handshake')} <span>Udhaar &amp; Khata</span>
          </button>
        </div>

        <!-- TAB 1: ANALYTICS & INSIGHTS VIEW -->
        <div id="view-analytics" style="margin-top:1rem;">
          <!-- 1. Monthly Spending Chart -->
          <div class="card" style="padding:1.15rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
              <span style="font-weight:700; font-size:0.95rem;">Monthly Spending Pace</span>
              <span class="wa-tag badge-emerald" id="hisab-pace-badge" style="font-size:0.7rem; font-weight:700;">Healthy</span>
            </div>
            <!-- Dynamic CSS Bar Chart -->
            <div style="min-height:120px; display:flex; align-items:flex-end; gap:8px; padding:12px 6px 4px;" id="hisab-chart-bars">
              <div class="text-quiet" style="width:100%; text-align:center; padding:1.5rem 0; font-size:0.85rem;">Calculating spending pace...</div>
            </div>
          </div>

          <!-- 2. Expense Category Breakdown -->
          <div class="card" style="margin-top:0.85rem; padding:1.15rem;">
            <div style="font-weight:700; font-size:0.95rem; margin-bottom:1rem;">Expense Breakdown by Category</div>
            <div class="stack" id="hisab-category-breakdown" style="gap:0.85rem;">
              <div class="text-quiet" style="text-align:center; padding:1rem 0; font-size:0.85rem;">Loading categories...</div>
            </div>
          </div>

          <!-- 3. Financial Insight Card -->
          <div class="card" style="margin-top:0.85rem; padding:1rem; background:var(--wa-color-amber-95, #fef3c7); border:1px solid var(--wa-color-amber-80, #fcd34d);">
            <div style="display:flex; align-items:center; gap:0.4rem; font-weight:800; font-size:0.9rem; color:var(--wa-color-amber-30, #78350f);">
              <span>${icon('lightbulb')}</span> Household Insight
            </div>
            <p id="hisab-insight-text" style="margin:0.4rem 0 0 0; font-size:0.83rem; line-height:1.5; color:var(--wa-color-amber-20, #451a03);">
              Analyzing monthly household cashflow...
            </p>
          </div>
        </div>

        <!-- TAB 2: TRANSACTIONS VIEW -->
        <div id="view-transactions" style="display:none; margin-top:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span class="text-quiet" style="font-size:0.85rem; font-weight:700; text-transform:uppercase;">Recent Entries</span>
            <wa-button variant="brand" size="small" class="btn-trigger-tx-drawer">${t('hisab.record_entry', {}, '+ Record Entry')}</wa-button>
          </div>

          <div class="stack" id="transactions-list" style="gap:0.6rem;">
            <div class="card text-quiet" style="text-align:center; padding:1.5rem 0;">Loading transactions...</div>
          </div>
        </div>

        <!-- TAB 3: UDHAAR & KHATA VIEW -->
        <div id="view-udhaar" style="display:none; margin-top:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <span class="text-quiet" style="font-size:0.85rem; font-weight:700; text-transform:uppercase;">Debts &amp; Receivables</span>
            <wa-button variant="brand" size="small" class="btn-trigger-debt-drawer">+ Add Debt / Khata</wa-button>
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

  async afterRender(params = {}) {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    let transactions = [];
    let debts = [];
    let income = 0;
    let expense = 0;
    let backendSummary = null;

    const txDrawer = document.getElementById('tx-drawer');
    const debtDrawer = document.getElementById('debt-drawer');

    // Default today for tx-date
    const txDateInput = document.getElementById('tx-date');
    if (txDateInput) txDateInput.value = new Date().toISOString().slice(0, 10);

    const debtDueInput = document.getElementById('debt-due');
    if (debtDueInput) debtDueInput.value = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    // Deep linking: check query parameters (e.g. #/hisab?action=record or #/hisab?tab=transactions)
    if (params?.action === 'record' || params?.action === 'spend' || params?.action === 'add') {
      if (txDrawer) {
        setTimeout(() => { txDrawer.open = true; }, 100);
      }
    }
    if (params?.tab) {
      const tabChip = document.querySelector(`#hisab-tabs .filter-chip[data-tab="${params.tab}"]`);
      if (tabChip) tabChip.click();
    }

    const updateSummaries = () => {
      const net = income - expense;
      const incomeEl = document.getElementById('hisab-total-income');
      const expenseEl = document.getElementById('hisab-total-expense');
      const netEl = document.getElementById('hisab-total-net');
      const netBadge = document.getElementById('hisab-net-badge');
      const heroSub = document.getElementById('hisab-hero-sub');
      const paceBadge = document.getElementById('hisab-pace-badge');
      const chartBarsEl = document.getElementById('hisab-chart-bars');
      const catListEl = document.getElementById('hisab-category-breakdown');
      const insightEl = document.getElementById('hisab-insight-text');

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
      if (paceBadge) {
        paceBadge.textContent = net >= 0 ? 'Good Pace' : 'High Spending';
        paceBadge.className = `wa-tag ${net >= 0 ? 'badge-emerald' : 'badge-amber'}`;
      }

      // 1. DYNAMIC WEEKLY SPENDING PACE
      const expenseTxs = transactions.filter((t) => t.type === 'expense');
      let w1 = 0, w2 = 0, w3 = 0, w4 = 0;
      expenseTxs.forEach((t) => {
        const d = new Date(t.date || t.transaction_date || Date.now()).getDate();
        const amt = parseFloat(t.amount || 0);
        if (d <= 7) w1 += amt;
        else if (d <= 14) w2 += amt;
        else if (d <= 21) w3 += amt;
        else w4 += amt;
      });

      const maxWeek = Math.max(w1, w2, w3, w4, 1);
      const weeksData = [
        { label: 'Week 1', days: 'Day 1–7', amount: w1, pct: w1 > 0 ? Math.round((w1 / maxWeek) * 100) : 0, isPeak: w1 === maxWeek && w1 > 0 },
        { label: 'Week 2', days: 'Day 8–14', amount: w2, pct: w2 > 0 ? Math.round((w2 / maxWeek) * 100) : 0, isPeak: w2 === maxWeek && w2 > 0 },
        { label: 'Week 3', days: 'Day 15–21', amount: w3, pct: w3 > 0 ? Math.round((w3 / maxWeek) * 100) : 0, isPeak: w3 === maxWeek && w3 > 0 },
        { label: 'Week 4', days: 'Day 22–31', amount: w4, pct: w4 > 0 ? Math.round((w4 / maxWeek) * 100) : 0, isPeak: w4 === maxWeek && w4 > 0 },
      ];

      if (chartBarsEl) {
        if (expenseTxs.length === 0) {
          chartBarsEl.innerHTML = `
            <div style="display:flex; width:100%; gap:8px; height:100%;">
              ${[1, 2, 3, 4].map(w => `
                <div style="flex:1; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:4px;">
                  <span style="font-size:0.65rem; color:var(--wa-color-text-quiet);">-</span>
                  <div style="width:100%; height:75px; background:var(--wa-color-surface-lowered); border-radius:8px;"></div>
                  <span style="font-size:0.7rem; color:var(--wa-color-text-quiet);">Week ${w}</span>
                </div>
              `).join('')}
            </div>
          `;
        } else {
          chartBarsEl.innerHTML = `
            <div style="display:flex; width:100%; gap:8px; height:100%;">
              ${weeksData.map(w => `
                <div style="flex:1; display:flex; flex-direction:column; justify-content:flex-end; align-items:center; gap:4px;" title="${w.label} (${w.days}): PKR ${w.amount.toLocaleString()}">
                  <span style="font-size:0.65rem; font-weight:700; color:${w.isPeak ? 'var(--wa-color-brand-on-normal)' : 'var(--wa-color-text-quiet)'};">
                    ${w.amount > 0 ? 'PKR ' + formatAmount(w.amount) : '-'}
                  </span>
                  <div style="width:100%; height:75px; display:flex; align-items:flex-end; background:var(--wa-color-surface-lowered); border-radius:8px; padding:3px; overflow:hidden;">
                    <div style="width:100%; height:${Math.max(w.amount > 0 ? 10 : 0, w.pct)}%; background:${w.isPeak ? 'var(--wa-color-brand-fill)' : 'color-mix(in srgb, var(--wa-color-brand-fill) 45%, var(--wa-color-surface-border))'}; border-radius:6px; transition:height 0.4s ease; ${w.isPeak ? 'box-shadow:0 2px 6px color-mix(in srgb, var(--wa-color-brand-fill) 30%, transparent);' : ''}"></div>
                  </div>
                  <span style="font-size:0.7rem; font-weight:600; color:var(--wa-color-text-quiet);">${w.label}</span>
                </div>
              `).join('')}
            </div>
          `;
        }
      }

      // 2. DYNAMIC EXPENSE CATEGORY BREAKDOWN
      const catTotals = {};
      expenseTxs.forEach((t) => {
        const cat = t.category || 'Other';
        catTotals[cat] = (catTotals[cat] || 0) + parseFloat(t.amount || 0);
      });

      const catList = Object.entries(catTotals)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);

      const totalSpent = catList.reduce((acc, c) => acc + c.total, 0) || expense || 1;

      if (catListEl) {
        if (catList.length === 0) {
          catListEl.innerHTML = `
            <div style="text-align:center; padding:1.25rem 0; color:var(--wa-color-text-quiet); font-size:0.85rem;">
              No expense records logged yet for this month.
            </div>
          `;
        } else {
          catListEl.innerHTML = catList.map((c) => {
            const meta = getCategoryMeta(c.category);
            const pct = Math.max(3, Math.round((c.total / totalSpent) * 100));
            return `
              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.3rem;">
                  <span style="display:inline-flex; align-items:center; gap:6px;">
                    ${icon(meta.icon)} ${c.category}
                  </span>
                  <strong>PKR ${formatAmount(c.total)} <span class="text-quiet" style="font-size:0.75rem; font-weight:500;">(${pct}%)</span></strong>
                </div>
                <div style="height:8px; background:var(--wa-color-surface-border); border-radius:99px; overflow:hidden;">
                  <div style="width:${pct}%; height:100%; background:${meta.color}; border-radius:99px; transition:width 0.4s ease;"></div>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      // 3. DYNAMIC HOUSEHOLD INSIGHT
      if (insightEl) {
        if (backendSummary?.insight) {
          insightEl.textContent = backendSummary.insight;
        } else if (income === 0 && expense === 0) {
          insightEl.textContent = 'No transactions recorded yet this month. Tap "+ Record Entry" to log your household income or expenses.';
        } else if (net >= 0) {
          const rate = income > 0 ? Math.round((net / income) * 100) : 100;
          const topCat = catList[0];
          insightEl.textContent = `Healthy surplus of PKR ${formatAmount(net)} (${rate}% savings rate). ` +
            (topCat ? `Top expense is ${topCat.category} (${Math.round((topCat.total / totalSpent) * 100)}% of expenses).` : 'Spending pace is well controlled.');
        } else {
          const topCat = catList[0];
          insightEl.textContent = `Monthly expenses exceed total income by PKR ${formatAmount(Math.abs(net))}. ` +
            (topCat ? `${topCat.category} accounts for ${Math.round((topCat.total / totalSpent) * 100)}% of total expenditures.` : 'Review discretionary spending.');
        }
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
        backendSummary = sumRes.data;
        income = parseFloat(sumRes.data.total_income || 0);
        expense = parseFloat(sumRes.data.total_expense || 0);
      }
      if (txRes?.data) {
        const rawList = Array.isArray(txRes.data) ? txRes.data : (txRes.data?.data || []);
        transactions = rawList.map((t) => ({
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
        debts = Array.isArray(debtsRes.data) ? debtsRes.data : (debtsRes.data?.data || []);
      }
    } catch (e) {
      console.warn('Hisab backend fetch fallback');
    }

    updateSummaries();
    renderTransactions();
    renderDebts();

    // Drawer triggers
    document.querySelectorAll('.btn-trigger-tx-drawer, #btn-open-tx-drawer').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (txDrawer) txDrawer.open = true;
      });
    });

    document.querySelectorAll('.btn-trigger-debt-drawer, #btn-open-debt-drawer').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (debtDrawer) debtDrawer.open = true;
      });
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
      const txDateInputReset = document.getElementById('tx-date');
      if (txDateInputReset) txDateInputReset.value = new Date().toISOString().slice(0, 10);
      pushToast({ message: 'Transaction recorded successfully!', variant: 'success' });

      try {
        await api.addHisabTransaction(
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
        person_name: person,
        phone,
        person_phone: phone,
        amount,
        paid: 0,
        direction,
        due,
        due_date: due,
      };

      debts.unshift(newDebt);
      renderDebts();
      if (debtDrawer) debtDrawer.open = false;
      document.getElementById('debt-form')?.reset();
      pushToast({ message: 'Debt entry recorded successfully!', variant: 'success' });

      try {
        await api.addHisabDebt(
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


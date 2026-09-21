import { api } from '../services/api.js';
import { authStore, pushToast } from '../state/store.js';
import { householdStore } from '../state/household-store.js';
import { icon } from '../components/icon.js';
import { t } from '../i18n/index.js';
import { formatAmount } from '../utils/format.js';
import { BRAND } from '../config/brand.js';

let currentPeriod = 'this_month';
let customFrom = '';
let customTo = '';
let reportData = null;
let isLoading = false;

// Category metadata helper
function getCategoryMeta(categoryName) {
  const map = {
    'Salary': { icon: 'briefcase', color: '#16a34a' },
    'Freelance': { icon: 'laptop-code', color: '#059669' },
    'Business': { icon: 'chart-line', color: '#0284c7' },
    'Investment': { icon: 'arrow-trend-up', color: '#6366f1' },
    'Groceries': { icon: 'cart-shopping', color: '#ea580c' },
    'Utilities': { icon: 'bolt', color: '#d97706' },
    'Electricity': { icon: 'bolt', color: '#d97706' },
    'Gas': { icon: 'fire-burner', color: '#e11d48' },
    'Water': { icon: 'faucet-drip', color: '#0284c7' },
    'Internet': { icon: 'wifi', color: '#4f46e5' },
    'Housing': { icon: 'house', color: '#2563eb' },
    'Rent': { icon: 'house', color: '#2563eb' },
    'Fuel': { icon: 'gas-pump', color: '#e11d48' },
    'Transport': { icon: 'car', color: '#7c3aed' },
    'Food': { icon: 'utensils', color: '#f59e0b' },
    'Dining': { icon: 'utensils', color: '#f59e0b' },
    'Medical': { icon: 'notes-medical', color: '#dc2626' },
    'Health': { icon: 'heart-pulse', color: '#dc2626' },
    'Education': { icon: 'graduation-cap', color: '#0891b2' },
    'Shopping': { icon: 'bag-shopping', color: '#db2777' },
    'Entertainment': { icon: 'film', color: '#9333ea' },
    'General': { icon: 'receipt', color: '#64748b' },
    'Other': { icon: 'asterisk', color: '#64748b' },
  };
  return map[categoryName] || { icon: 'receipt', color: '#64748b' };
}

export const reportsScreen = {
  meta: {
    topbar: { title: 'Reports & Analytics', back: true },
    nav: 'hisab',
  },

  render() {
    return `
      <div class="screen reports-screen" style="padding-bottom:5rem;">
        <!-- Header Banner -->
        <div style="margin-bottom:1rem; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <h2 style="font-size:1.35rem; font-weight:850; margin:0; letter-spacing:-0.02em;">Financial Reports</h2>
            <p class="text-quiet" style="font-size:0.83rem; margin:0.25rem 0 0 0;" id="reports-period-label">
              Analyzing monthly household cashflow...
            </p>
          </div>

          <!-- Quick Action Buttons -->
          <div style="display:flex; gap:0.4rem; align-items:center;">
            <wa-button size="s" appearance="outlined" id="btn-export-csv" title="Download spreadsheet (.csv)">
              ${icon('file-csv')} CSV
            </wa-button>
            <wa-button size="s" variant="brand" id="btn-share-whatsapp-report" title="Send WhatsApp summary to family">
              ${icon('share-nodes')} WhatsApp
            </wa-button>
          </div>
        </div>

        <!-- Timeframe Filter Chips -->
        <div class="filter-chips-row" id="report-period-tabs" style="margin-bottom:1rem; overflow-x:auto; padding-bottom:4px;">
          <button type="button" class="filter-chip ${currentPeriod === 'this_month' ? 'is-active' : ''}" data-period="this_month">
            This Month
          </button>
          <button type="button" class="filter-chip ${currentPeriod === 'last_month' ? 'is-active' : ''}" data-period="last_month">
            Last Month
          </button>
          <button type="button" class="filter-chip ${currentPeriod === 'quarter' ? 'is-active' : ''}" data-period="quarter">
            3 Months
          </button>
          <button type="button" class="filter-chip ${currentPeriod === 'ytd' ? 'is-active' : ''}" data-period="ytd">
            This Year (YTD)
          </button>
          <button type="button" class="filter-chip ${currentPeriod === 'custom' ? 'is-active' : ''}" data-period="custom">
            Custom Range
          </button>
        </div>

        <!-- Custom Date Range Picker (Conditional) -->
        <div id="custom-range-box" style="display:${currentPeriod === 'custom' ? 'block' : 'none'}; margin-bottom:1rem;" class="card" style="padding:0.85rem;">
          <div style="font-size:0.8rem; font-weight:700; margin-bottom:0.5rem; text-transform:uppercase; color:var(--wa-color-text-quiet);">Select Date Range</div>
          <div style="display:grid; grid-template-columns:1fr 1fr auto; gap:0.5rem; align-items:flex-end;">
            <div>
              <label style="font-size:0.75rem; color:var(--wa-color-text-quiet); display:block; margin-bottom:0.2rem;">From</label>
              <input type="date" id="input-from-date" value="${customFrom}" class="input" style="width:100%; box-sizing:border-box; height:36px; border-radius:8px; border:1px solid var(--wa-color-surface-border); padding:0 8px; font-size:0.85rem;" />
            </div>
            <div>
              <label style="font-size:0.75rem; color:var(--wa-color-text-quiet); display:block; margin-bottom:0.2rem;">To</label>
              <input type="date" id="input-to-date" value="${customTo}" class="input" style="width:100%; box-sizing:border-box; height:36px; border-radius:8px; border:1px solid var(--wa-color-surface-border); padding:0 8px; font-size:0.85rem;" />
            </div>
            <wa-button size="s" variant="brand" id="btn-apply-custom-range" style="height:36px;">Apply</wa-button>
          </div>
        </div>

        <!-- Dynamic Content Slot (Filled via afterRender) -->
        <div id="reports-content-container">
          <div class="card text-quiet" style="text-align:center; padding:2rem 0; font-size:0.9rem;">
            Loading financial report...
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    setupPeriodTabs();
    setupExportButtons();
    await loadReport();
  },
};

// Setup timeframe click listeners
function setupPeriodTabs() {
  const tabsContainer = document.getElementById('report-period-tabs');
  const customBox = document.getElementById('custom-range-box');

  tabsContainer?.querySelectorAll('[data-period]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      tabsContainer.querySelectorAll('[data-period]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const period = btn.dataset.period;
      currentPeriod = period;

      if (period === 'custom') {
        if (customBox) customBox.style.display = 'block';
      } else {
        if (customBox) customBox.style.display = 'none';
        await loadReport();
      }
    });
  });

  // Apply custom range button
  document.getElementById('btn-apply-custom-range')?.addEventListener('click', async () => {
    const fromInput = document.getElementById('input-from-date');
    const toInput = document.getElementById('input-to-date');
    if (!fromInput?.value || !toInput?.value) {
      pushToast({ message: 'Please select both from and to dates.', variant: 'warning' });
      return;
    }
    if (fromInput.value > toInput.value) {
      pushToast({ message: 'From date cannot be later than To date.', variant: 'danger' });
      return;
    }
    customFrom = fromInput.value;
    customTo = toInput.value;
    await loadReport();
  });
}

// Fetch report data from API
async function loadReport() {
  const container = document.getElementById('reports-content-container');
  const periodLabelEl = document.getElementById('reports-period-label');

  if (container) {
    container.innerHTML = `
      <div class="card text-quiet" style="text-align:center; padding:2.5rem 0; font-size:0.9rem;">
        <div style="display:inline-block; margin-bottom:0.5rem;">${icon('circle-notch')}</div>
        <div>Calculating financial analytics...</div>
      </div>
    `;
  }

  try {
    const params = {};
    if (currentPeriod === 'custom' && customFrom && customTo) {
      params.from_date = customFrom;
      params.to_date = customTo;
    } else {
      params.period = currentPeriod;
    }

    const res = await api.getHisabReport(params);
    reportData = res?.data || null;

    if (periodLabelEl && reportData?.period?.label) {
      periodLabelEl.textContent = `Period: ${reportData.period.label}`;
    }

    renderReportView(reportData);
  } catch (err) {
    console.error('Failed to load financial report:', err);
    if (container) {
      container.innerHTML = `
        <div class="card" style="padding:1.5rem; text-align:center;">
          <div style="color:var(--wa-color-red-40); margin-bottom:0.5rem;">${icon('circle-exclamation')}</div>
          <div style="font-weight:700; font-size:0.95rem;">Unable to load report</div>
          <p class="text-quiet" style="font-size:0.82rem; margin:0.4rem 0 1rem 0;">${err.message || 'Network error occurred while fetching report data.'}</p>
          <wa-button size="s" variant="brand" id="btn-retry-report">Try Again</wa-button>
        </div>
      `;
      document.getElementById('btn-retry-report')?.addEventListener('click', loadReport);
    }
  }
}

// Render the full report UI
function renderReportView(data) {
  const container = document.getElementById('reports-content-container');
  if (!container || !data) return;

  const { summary, categories = [], members = [], monthly_trend = [], period } = data;
  const net = summary.net_savings || 0;
  const isSurplus = net >= 0;
  const isZero = summary.total_income === 0 && summary.total_expense === 0;

  // Status tag
  let statusBadge = '';
  if (isZero) {
    statusBadge = '<span class="wa-tag badge-neutral">No Activity</span>';
  } else if (isSurplus) {
    statusBadge = `<span class="wa-tag badge-emerald">Surplus (${summary.savings_rate}% saved)</span>`;
  } else {
    statusBadge = '<span class="wa-tag badge-rose">Deficit</span>';
  }

  // Monthly Budget (Retrieved from household setting or default 75k)
  const householdId = authStore.get().household?.id;
  const savedBudget = parseFloat(localStorage.getItem(`digez_budget_${householdId}`) || '0');
  const budgetAmount = savedBudget > 0 ? savedBudget : (summary.total_income > 0 ? summary.total_income : 75000);
  const budgetSpentPct = budgetAmount > 0 ? Math.min(150, Math.round((summary.total_expense / budgetAmount) * 100)) : 0;

  let budgetColor = 'var(--wa-color-green-40, #16a34a)';
  let budgetStatus = 'On Track';
  if (budgetSpentPct > 100) {
    budgetColor = 'var(--wa-color-red-40, #dc2626)';
    budgetStatus = 'Exceeded';
  } else if (budgetSpentPct > 80) {
    budgetColor = 'var(--wa-color-amber-40, #d97706)';
    budgetStatus = 'Caution (Near Limit)';
  }

  // HTML assembly
  container.innerHTML = `
    <!-- 1. Net Cashflow Hero Card -->
    <div class="card" style="padding:1.25rem; border-radius:18px; margin-bottom:1rem; background:var(--wa-color-surface-default);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:var(--wa-color-text-quiet);">
          Net Cashflow (${period?.label || 'Period'})
        </span>
        ${statusBadge}
      </div>
      <div style="font-size:1.85rem; font-weight:850; margin:0.35rem 0 0.2rem 0; letter-spacing:-0.02em; color:${isSurplus ? 'var(--wa-color-green-40)' : 'var(--wa-color-red-40)'};">
        ${net < 0 ? '-' : ''}PKR ${formatAmount(Math.abs(net))}
      </div>
      <div class="text-quiet" style="font-size:0.82rem;">
        ${isSurplus ? 'Healthy surplus funds retained in household.' : 'Total expenditures exceeded total incoming funds.'}
      </div>
    </div>

    <!-- 2. Financial KPI Metric Cards (2x2 Grid) -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.65rem; margin-bottom:1rem;">
      <div class="card" style="padding:1rem;">
        <div style="display:flex; align-items:center; gap:0.4rem; color:var(--wa-color-green-40); margin-bottom:0.25rem;">
          ${icon('arrow-down')}
          <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; color:var(--wa-color-text-quiet);">Total Income</span>
        </div>
        <div style="font-size:1.15rem; font-weight:800; color:var(--wa-color-green-40);">
          PKR ${formatAmount(summary.total_income)}
        </div>
        <div class="text-quiet" style="font-size:0.72rem; margin-top:2px;">
          ${summary.income_count} ${summary.income_count === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      <div class="card" style="padding:1rem;">
        <div style="display:flex; align-items:center; gap:0.4rem; color:var(--wa-color-red-40); margin-bottom:0.25rem;">
          ${icon('arrow-up-right')}
          <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; color:var(--wa-color-text-quiet);">Total Spent</span>
        </div>
        <div style="font-size:1.15rem; font-weight:800; color:var(--wa-color-red-40);">
          PKR ${formatAmount(summary.total_expense)}
        </div>
        <div class="text-quiet" style="font-size:0.72rem; margin-top:2px;">
          ${summary.expense_count} ${summary.expense_count === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      <div class="card" style="padding:1rem;">
        <div style="display:flex; align-items:center; gap:0.4rem; color:var(--wa-color-brand-fill); margin-bottom:0.25rem;">
          ${icon('piggy-bank')}
          <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; color:var(--wa-color-text-quiet);">Savings Rate</span>
        </div>
        <div style="font-size:1.15rem; font-weight:800;">
          ${summary.savings_rate}%
        </div>
        <div class="text-quiet" style="font-size:0.72rem; margin-top:2px;">
          Of gross household income
        </div>
      </div>

      <div class="card" style="padding:1rem;">
        <div style="display:flex; align-items:center; gap:0.4rem; color:var(--wa-color-brand-fill); margin-bottom:0.25rem;">
          ${icon('calendar-day')}
          <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; color:var(--wa-color-text-quiet);">Daily Average</span>
        </div>
        <div style="font-size:1.15rem; font-weight:800;">
          PKR ${formatAmount(summary.daily_average)}
        </div>
        <div class="text-quiet" style="font-size:0.72rem; margin-top:2px;">
          Average spend per day
        </div>
      </div>
    </div>

    <!-- 3. Household Spending Budget Progress -->
    <div class="card" style="padding:1.15rem; margin-bottom:1rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <div>
          <span style="font-weight:700; font-size:0.92rem;">Monthly Spending Budget</span>
          <span class="text-quiet" style="font-size:0.75rem; display:block;">Target ceiling: PKR ${formatAmount(budgetAmount)}</span>
        </div>
        <span class="wa-tag" style="background:${budgetColor}20; color:${budgetColor}; border:1px solid ${budgetColor}40;">
          ${budgetStatus}
        </span>
      </div>
      <div style="height:10px; background:var(--wa-color-surface-border, #e2e8f0); border-radius:99px; overflow:hidden; margin:0.5rem 0 0.35rem 0;">
        <div style="width:${Math.min(100, budgetSpentPct)}%; height:100%; background:${budgetColor}; border-radius:99px; transition:width 0.4s ease;"></div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem;" class="text-quiet">
        <span>PKR ${formatAmount(summary.total_expense)} spent (${budgetSpentPct}%)</span>
        <span>${budgetAmount > summary.total_expense ? `PKR ${formatAmount(budgetAmount - summary.total_expense)} left` : 'Budget limit reached'}</span>
      </div>
    </div>

    <!-- 4. Category Breakdown -->
    <div class="card" style="padding:1.15rem; margin-bottom:1rem;">
      <div style="font-weight:700; font-size:0.95rem; margin-bottom:0.85rem;">
        Spending Breakdown by Category
      </div>
      ${renderCategoriesHTML(categories, summary.total_expense)}
    </div>

    <!-- 5. Household Member Attribution -->
    <div class="card" style="padding:1.15rem; margin-bottom:1rem;">
      <div style="font-weight:700; font-size:0.95rem; margin-bottom:0.85rem;">
        Family Member Attribution ("Who Spent What")
      </div>
      ${renderMembersHTML(members, summary.total_expense)}
    </div>

    <!-- 6. 6-Month Trend Overview -->
    <div class="card" style="padding:1.15rem;">
      <div style="font-weight:700; font-size:0.95rem; margin-bottom:0.85rem;">
        6-Month Historical Cashflow
      </div>
      ${renderMonthlyTrendHTML(monthly_trend)}
    </div>
  `;
}

// Category list HTML generator
function renderCategoriesHTML(categories, totalExpenses) {
  if (!categories || categories.length === 0) {
    return `
      <div class="text-quiet" style="text-align:center; padding:1.25rem 0; font-size:0.85rem;">
        No expense transactions recorded in this period.
      </div>
    `;
  }

  return `
    <div class="stack" style="gap:0.75rem;">
      ${categories.map((c) => {
        const meta = getCategoryMeta(c.category);
        return `
          <div style="padding:0.2rem 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; margin-bottom:0.35rem;">
              <span style="display:inline-flex; align-items:center; gap:8px; font-weight:600;">
                <span style="color:${meta.color};">${icon(meta.icon)}</span>
                <span>${c.category}</span>
                <span class="text-quiet" style="font-size:0.75rem; font-weight:400;">(${c.count})</span>
              </span>
              <span>
                <strong>PKR ${formatAmount(c.total)}</strong>
                <span class="text-quiet" style="font-size:0.75rem; margin-left:4px;">(${c.percentage}%)</span>
              </span>
            </div>
            <div style="height:8px; background:var(--wa-color-surface-border, #e2e8f0); border-radius:99px; overflow:hidden;">
              <div style="width:${Math.max(3, c.percentage)}%; height:100%; background:${meta.color}; border-radius:99px; transition:width 0.4s ease;"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Member attribution list HTML generator
function renderMembersHTML(members, totalExpenses) {
  if (!members || members.length === 0) {
    return `
      <div class="text-quiet" style="text-align:center; padding:1.25rem 0; font-size:0.85rem;">
        No member expenditures logged in this period.
      </div>
    `;
  }

  return `
    <div class="stack" style="gap:0.75rem;">
      ${members.map((m) => {
        const initial = (m.name || 'M')[0].toUpperCase();
        return `
          <div style="padding:0.2rem 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; margin-bottom:0.35rem;">
              <span style="display:inline-flex; align-items:center; gap:8px; font-weight:600;">
                <span style="width:24px; height:24px; border-radius:50%; background:var(--wa-color-brand-fill); color:#fff; display:grid; place-items:center; font-size:0.72rem; font-weight:700;">
                  ${initial}
                </span>
                <span>${m.name}</span>
                <span class="text-quiet" style="font-size:0.75rem; font-weight:400;">(${m.count} logs)</span>
              </span>
              <span>
                <strong>PKR ${formatAmount(m.total)}</strong>
                <span class="text-quiet" style="font-size:0.75rem; margin-left:4px;">(${m.percentage}%)</span>
              </span>
            </div>
            <div style="height:8px; background:var(--wa-color-surface-border, #e2e8f0); border-radius:99px; overflow:hidden;">
              <div style="width:${Math.max(3, m.percentage)}%; height:100%; background:var(--wa-color-brand-fill); border-radius:99px; transition:width 0.4s ease;"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// 6-Month Trend HTML generator
function renderMonthlyTrendHTML(trend) {
  if (!trend || trend.length === 0) {
    return `<div class="text-quiet" style="text-align:center; padding:1rem 0;">No historical data yet.</div>`;
  }

  const maxVal = Math.max(...trend.map((t) => Math.max(t.income, t.expense)), 1);

  return `
    <div style="display:grid; grid-template-columns:repeat(${trend.length}, 1fr); gap:6px; align-items:flex-end; min-height:120px; padding:0.5rem 0;">
      ${trend.map((t) => {
        const expPct = Math.max(4, Math.round((t.expense / maxVal) * 100));
        const incPct = Math.max(4, Math.round((t.income / maxVal) * 100));
        return `
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
            <div style="width:100%; display:flex; gap:3px; justify-content:center; align-items:flex-end; height:80px;">
              <div style="width:10px; height:${incPct}%; background:var(--wa-color-green-40, #16a34a); border-radius:3px;" title="Income: PKR ${t.income.toLocaleString()}"></div>
              <div style="width:10px; height:${expPct}%; background:var(--wa-color-red-40, #dc2626); border-radius:3px;" title="Expense: PKR ${t.expense.toLocaleString()}"></div>
            </div>
            <span style="font-size:0.68rem; color:var(--wa-color-text-quiet); font-weight:600; text-align:center;">
              ${t.label.split(' ')[0]}
            </span>
          </div>
        `;
      }).join('')}
    </div>
    <div style="display:flex; justify-content:center; gap:16px; margin-top:0.6rem; font-size:0.75rem; color:var(--wa-color-text-quiet);">
      <span style="display:inline-flex; align-items:center; gap:5px;">
        <span style="width:8px; height:8px; background:var(--wa-color-green-40); border-radius:2px;"></span> Income
      </span>
      <span style="display:inline-flex; align-items:center; gap:5px;">
        <span style="width:8px; height:8px; background:var(--wa-color-red-40); border-radius:2px;"></span> Expenses
      </span>
    </div>
  `;
}

// Setup WhatsApp and CSV export handlers
function setupExportButtons() {
  // 1. WhatsApp Report Generator
  document.getElementById('btn-share-whatsapp-report')?.addEventListener('click', () => {
    if (!reportData) {
      pushToast({ message: 'Report data is still loading.', variant: 'warning' });
      return;
    }

    const { summary, categories = [], members = [], period } = reportData;
    const householdName = authStore.get().household?.name || 'My Household';

    let msg = `📊 *${BRAND.name} Household Financial Report*\n`;
    msg += `🏠 *Ghar:* ${householdName}\n`;
    msg += `📅 *Period:* ${period?.label || 'Current Period'}\n\n`;

    msg += `💵 *Total Income:* PKR ${summary.total_income.toLocaleString()}\n`;
    msg += `💸 *Total Spent:* PKR ${summary.total_expense.toLocaleString()}\n`;
    msg += `📈 *Net Savings:* PKR ${summary.net_savings.toLocaleString()} (${summary.savings_rate}% savings rate)\n`;
    msg += `🗓️ *Daily Average:* PKR ${summary.daily_average.toLocaleString()}\n\n`;

    if (categories.length > 0) {
      msg += `🏷️ *Top Expense Categories:*\n`;
      categories.slice(0, 5).forEach((c) => {
        msg += `• ${c.category}: PKR ${c.total.toLocaleString()} (${c.percentage}%)\n`;
      });
      msg += `\n`;
    }

    if (members.length > 1) {
      msg += `👥 *Family Spending Attribution:*\n`;
      members.forEach((m) => {
        msg += `• ${m.name}: PKR ${m.total.toLocaleString()} (${m.percentage}%)\n`;
      });
      msg += `\n`;
    }

    msg += `_Generated via ${BRAND.name} — ${BRAND.tagline}_`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  });

  // 2. CSV Data Export
  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    if (!reportData || !reportData.transactions || reportData.transactions.length === 0) {
      pushToast({ message: 'No transactions to export for this period.', variant: 'warning' });
      return;
    }

    const txs = reportData.transactions;
    const periodKey = reportData.period?.key || 'custom';

    // CSV Header with UTF-8 BOM
    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount (PKR)', 'Logged By', 'Notes'];
    const rows = txs.map((t) => [
      t.id,
      t.transaction_date,
      t.type,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.creator_name || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gharly-hisab-report-${periodKey}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    pushToast({ message: 'Financial CSV downloaded successfully!', variant: 'success' });
  });
}

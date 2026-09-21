/**
 * DigEzLife Live API Service
 * Connects with Laravel Sanctum backend and multi-tenant household endpoints.
 * Fallbacks gracefully to cached data if backend is temporarily offline.
 */
import { readLocal, writeLocal } from './storage.js';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.__API_URL__) {
    return window.__API_URL__;
  }
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
    return `http://${hostname}:8000`;
  }
  return 'https://gharlapi.alamiaconnect.com';
};

class ApiService {
  constructor() {
    this.token = readLocal('auth.token', null);
    this.currentHousehold = readLocal('auth.household_id', 'demo-household');
  }

  setToken(token) {
    this.token = token;
    writeLocal('auth.token', token);
  }

  setHousehold(householdId) {
    this.currentHousehold = householdId;
    writeLocal('auth.household_id', householdId);
  }

  async request(endpoint, options = {}) {
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${cleanEndpoint}`;

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const token = this.token || readLocal('auth.token', null);
    const household = this.currentHousehold || readLocal('auth.household_id', 'demo-household');

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (household) {
      headers['X-Tenant-ID'] = household;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : `HTTP Error ${response.status}`);
        const err = new Error(errorMsg);
        err.status = response.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (error) {
      console.warn(`[API] ${options.method || 'GET'} ${cleanEndpoint} error:`, error.message);
      throw error;
    }
  }

  get(endpoint, params = null) {
    let url = endpoint;
    if (params) {
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') sp.append(k, v);
      });
      const qs = sp.toString();
      if (qs) url += (url.includes('?') ? '&' : '?') + qs;
    }
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /* ---------------- Auth Endpoints ---------------- */
  async login({ email, password }) {
    const res = await this.post('/api/v1/auth/login', { email, password });
    if (res?.meta?.token) {
      this.setToken(res.meta.token);
    }
    if (res?.meta?.household?.id) {
      this.setHousehold(res.meta.household.id);
    }
    return res;
  }

  async register({ name, email, password, password_confirmation }) {
    const res = await this.post('/api/v1/auth/register', {
      name,
      email,
      password,
      password_confirmation,
    });
    if (res?.meta?.token) {
      this.setToken(res.meta.token);
    }
    if (res?.meta?.household?.id) {
      this.setHousehold(res.meta.household.id);
    }
    return res;
  }

  async logout() {
    try {
      await this.post('/api/v1/auth/logout', {});
    } catch (e) {
      // Ignore network error
    } finally {
      this.setToken(null);
      this.setHousehold(null);
    }
  }

  async getCurrentUser() {
    return this.get('/api/v1/auth/me');
  }

  async getTenants() {
    return this.get('/api/v1/tenants');
  }

  /* ---------------- Grocery Endpoints ---------------- */
  async getGroceryLists(householdId) {
    const hid = householdId || this.currentHousehold;
    return this.get(`/${hid}/api/v1/grocery/lists`);
  }

  async getGroceryList(listId, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.get(`/${hid}/api/v1/grocery/lists/${listId}`);
  }

  async createGroceryList(payload, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.post(`/${hid}/api/v1/grocery/lists`, payload);
  }

  async addGroceryItem(listId, itemPayload, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.post(`/${hid}/api/v1/grocery/lists/${listId}/items`, itemPayload);
  }

  async toggleGroceryItem(listId, itemId, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.patch(`/${hid}/api/v1/grocery/lists/${listId}/items/${itemId}/toggle`);
  }

  async updateGroceryItem(listId, itemId, payload, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.put(`/${hid}/api/v1/grocery/lists/${listId}/items/${itemId}`, payload);
  }

  async deleteGroceryItem(listId, itemId, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.delete(`/${hid}/api/v1/grocery/lists/${listId}/items/${itemId}`);
  }

  /* ---------------- Hisab Endpoints ---------------- */
  async getHisabSummary(month, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.get(`/${hid}/api/v1/hisab/summary`, month ? { month } : null);
  }

  async getHisabReport(params = {}, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.get(`/${hid}/api/v1/hisab/report`, params);
  }

  async getHisabTransactions(filters, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.get(`/${hid}/api/v1/hisab/transactions`, filters);
  }

  async addHisabTransaction(payload, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.post(`/${hid}/api/v1/hisab/transactions`, payload);
  }

  async createHisabTransaction(payload, householdId) {
    return this.addHisabTransaction(payload, householdId);
  }

  async updateHisabTransaction(txId, payload, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.put(`/${hid}/api/v1/hisab/transactions/${txId}`, payload);
  }

  async deleteHisabTransaction(txId, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.delete(`/${hid}/api/v1/hisab/transactions/${txId}`);
  }

  async getHisabDebts(filters, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.get(`/${hid}/api/v1/hisab/debts`, filters);
  }

  async addHisabDebt(payload, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.post(`/${hid}/api/v1/hisab/debts`, payload);
  }

  async createHisabDebt(payload, householdId) {
    return this.addHisabDebt(payload, householdId);
  }

  async updateHisabDebt(debtId, payload, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.put(`/${hid}/api/v1/hisab/debts/${debtId}`, payload);
  }

  async deleteHisabDebt(debtId, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.delete(`/${hid}/api/v1/hisab/debts/${debtId}`);
  }

  async settleHisabDebt(debtId, amountPaid, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.post(`/${hid}/api/v1/hisab/debts/${debtId}/settle`, { amount_paid: amountPaid });
  }

  /* ---------------- Savings Goals Endpoints ---------------- */
  async getSavingsGoals(householdId) {
    const hid = householdId || this.currentHousehold;
    return this.get(`/${hid}/api/v1/hisab/savings-goals`);
  }

  async createSavingsGoal(payload, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.post(`/${hid}/api/v1/hisab/savings-goals`, payload);
  }

  async updateSavingsGoal(goalId, payload, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.put(`/${hid}/api/v1/hisab/savings-goals/${goalId}`, payload);
  }

  async deleteSavingsGoal(goalId, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.delete(`/${hid}/api/v1/hisab/savings-goals/${goalId}`);
  }

  async depositToSavingsGoal(goalId, payload, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.post(`/${hid}/api/v1/hisab/savings-goals/${goalId}/deposit`, payload);
  }

  /* ---------------- Reminders Endpoints ---------------- */
  async getReminders(filters, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.get(`/${hid}/api/v1/reminders`, filters);
  }

  async createReminder(payload, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.post(`/${hid}/api/v1/reminders`, payload);
  }

  async toggleReminder(reminderId, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.patch(`/${hid}/api/v1/reminders/${reminderId}/toggle`);
  }

  async deleteReminder(reminderId, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.delete(`/${hid}/api/v1/reminders/${reminderId}`);
  }

  /* ---------------- Household & Family Endpoints ---------------- */
  async getHouseholdSnapshot(householdId, options = {}) {
    const headers = {};
    if (options.revision) {
      headers['If-None-Match'] = options.revision;
    }
    const query = options.month ? `?month=${encodeURIComponent(options.month)}` : '';
    return this.get(`/api/v1/household/snapshot${query}`, { headers });
  }

  async getHouseholdMembers() {
    return this.get('/api/v1/household/members');
  }

  async updateHousehold(payload) {
    return this.put('/api/v1/household', payload);
  }

  async redeemPromoCode(code) {
    return this.post('/api/v1/household/redeem-code', { code });
  }

  async createHouseholdInvite(payload) {
    return this.post('/api/v1/household/invitations', payload);
  }

  async cancelHouseholdInvite(id) {
    return this.delete(`/api/v1/household/invitations/${id}`);
  }

  async getMyCapabilities() {
    return this.get('/api/v1/household/my-capabilities');
  }

  async updateMemberRole(userId, role) {
    return this.put(`/api/v1/household/members/${userId}/role`, { role });
  }

  async getMemberCapabilities(userId) {
    return this.get(`/api/v1/household/members/${userId}/capabilities`);
  }

  async updateMemberCapabilities(userId, capabilities) {
    return this.put(`/api/v1/household/members/${userId}/capabilities`, { capabilities });
  }

  async getFamilyActivity() {
    return this.get('/api/v1/household/activity');
  }

  async getActivityFeedSettings() {
    return this.get('/api/v1/household/activity-feed-settings');
  }

  async clearActivityFeed(scope = 'personal') {
    return this.post('/api/v1/household/activity-feed/clear', { scope });
  }

  async dismissActivity(id, scope = 'personal') {
    return this.post('/api/v1/household/activity-feed/dismiss', { id, scope });
  }

  /* ---------------- Giveback & Rewards Endpoints ---------------- */
  async getRewardsSummary() {
    return this.get('/api/v1/rewards/summary');
  }

  async getRewardsHistory(filters = {}) {
    return this.get('/api/v1/rewards/history', filters);
  }

  async redeemReward(payload) {
    return this.post('/api/v1/rewards/redeem', payload);
  }

  async getReferralCode() {
    return this.get('/api/v1/referrals/code');
  }

  /* ---------------- Notifications & General Search Endpoints ---------------- */
  async getNotifications(householdId) {
    const hid = householdId || this.currentHousehold;
    const notifs = [];
    try {
      const [remRes, txRes] = await Promise.all([
        this.getReminders(null, hid).catch(() => null),
        this.getHisabTransactions({ per_page: 5 }, hid).catch(() => null),
      ]);

      if (remRes?.data) {
        remRes.data.filter((r) => !r.is_completed).forEach((r) => {
          notifs.push({
            id: `notif-rem-${r.id}`,
            icon: r.category === 'Bill' ? 'bolt' : 'clock',
            title: `Reminder: ${r.title}`,
            body: `${r.category || 'Alert'} due ${r.due_at ? new Date(r.due_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'soon'}`,
            time: 'Upcoming',
            read: false,
          });
        });
      }

      if (txRes?.data) {
        const txs = Array.isArray(txRes.data) ? txRes.data : (txRes.data?.data || []);
        txs.slice(0, 3).forEach((t) => {
          notifs.push({
            id: `notif-tx-${t.id}`,
            icon: t.type === 'expense' ? 'receipt' : 'wallet',
            title: t.type === 'expense' ? `Expense Logged: ${t.category}` : `Income Added: ${t.category}`,
            body: `PKR ${parseFloat(t.amount || 0).toLocaleString()} - ${t.notes || 'Household transaction'}`,
            time: t.transaction_date || 'Recent',
            read: true,
          });
        });
      }
    } catch (e) {}

    return notifs;
  }

  async getItems(filters = {}, householdId) {
    const hid = householdId || this.currentHousehold;
    const items = [];
    try {
      const txRes = await this.getHisabTransactions(null, hid).catch(() => null);
      const rawList = Array.isArray(txRes?.data) ? txRes.data : (txRes?.data?.data || []);
      rawList.forEach((t) => {
        items.push({
          id: t.id,
          title: t.notes || t.category,
          subtitle: `${t.category} &bull; ${t.payment_method || 'Cash'}`,
          status: t.type === 'income' ? 'active' : 'pending',
          amount: parseFloat(t.amount || 0),
          icon: t.type === 'income' ? 'arrow-down' : 'arrow-up-right',
          category: t.category,
        });
      });
    } catch (e) {}
    return items;
  }
}

export const api = new ApiService();

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

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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

  async deleteGroceryItem(listId, itemId, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.delete(`/${hid}/api/v1/grocery/lists/${listId}/items/${itemId}`);
  }

  /* ---------------- Hisab Endpoints ---------------- */
  async getHisabSummary(month, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.get(`/${hid}/api/v1/hisab/summary`, month ? { month } : null);
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

  async settleHisabDebt(debtId, amountPaid, householdId) {
    const hid = householdId || this.currentHousehold;
    return this.post(`/${hid}/api/v1/hisab/debts/${debtId}/settle`, { amount_paid: amountPaid });
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

  /* ---------------- Household Endpoints ---------------- */
  async getHouseholdMembers() {
    return this.get('/api/v1/household/members');
  }

  async createHouseholdInvite(payload) {
    return this.post('/api/v1/household/invitations', payload);
  }

  async cancelHouseholdInvite(id) {
    return this.delete(`/api/v1/household/invitations/${id}`);
  }

  async removeHouseholdMember(userId) {
    return this.delete(`/api/v1/household/members/${userId}`);
  }

  async joinHousehold(code) {
    return this.post('/api/v1/household/join', { code });
  }
}

export const api = new ApiService();

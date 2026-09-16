/**
 * DigEzLife API Adapter
 * Decoupled data adapter for communicating with DigEzLife SaaS Backend (Laravel 13).
 */

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost';
  return `http://${hostname}:8000`;
};

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('digezlife_token') || null;
    this.currentHousehold = localStorage.getItem('digezlife_household') || 'demo-household';
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('digezlife_token', token);
    } else {
      localStorage.removeItem('digezlife_token');
    }
  }

  setHousehold(householdId) {
    this.currentHousehold = householdId;
    if (householdId) {
      localStorage.setItem('digezlife_household', householdId);
    } else {
      localStorage.removeItem('digezlife_household');
    }
  }

  async request(endpoint, options = {}) {
    const baseUrl = getApiBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${cleanEndpoint}`;
    
    const headers = {
      'Accept': 'application/json',
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
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.warn(`[ApiAdapter] Network error for ${endpoint}:`, error.message);
      throw error;
    }
  }

  get(endpoint, params = null) {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += (url.includes('?') ? '&' : '?') + searchParams.toString();
    }
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body) {
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
}

export const api = new ApiClient();

// Auth Endpoints
export const AuthApi = {
  login: (credentials) => api.post('/api/v1/auth/login', credentials),
  register: (payload) => api.post('/api/v1/auth/register', payload),
  logout: () => api.post('/api/v1/auth/logout', {}),
  me: () => api.get('/api/v1/auth/me'),
  getHouseholds: () => api.get('/api/v1/tenants'),
};

// Grocery Module Endpoints
export const GroceryApi = {
  getLists: (householdId) => api.get(`/${householdId || api.currentHousehold}/api/v1/grocery/lists`),
  createList: (householdId, payload) => api.post(`/${householdId || api.currentHousehold}/api/v1/grocery/lists`, payload),
  getList: (householdId, listId) => api.get(`/${householdId || api.currentHousehold}/api/v1/grocery/lists/${listId}`),
  addItem: (householdId, listId, payload) => api.post(`/${householdId || api.currentHousehold}/api/v1/grocery/lists/${listId}/items`, payload),
  toggleItem: (householdId, listId, itemId) => api.patch(`/${householdId || api.currentHousehold}/api/v1/grocery/lists/${listId}/items/${itemId}/toggle`),
  deleteItem: (householdId, listId, itemId) => api.delete(`/${householdId || api.currentHousehold}/api/v1/grocery/lists/${listId}/items/${itemId}`),
  getWhatsAppExport: (householdId, listId) => api.get(`/${householdId || api.currentHousehold}/api/v1/grocery/lists/${listId}/whatsapp`),
};

// Hisab Module Endpoints
export const HisabApi = {
  getSummary: (householdId, month) => api.get(`/${householdId || api.currentHousehold}/api/v1/hisab/summary`, month ? { month } : null),
  getTransactions: (householdId, filters) => api.get(`/${householdId || api.currentHousehold}/api/v1/hisab/transactions`, filters),
  addTransaction: (householdId, payload) => api.post(`/${householdId || api.currentHousehold}/api/v1/hisab/transactions`, payload),
  getDebts: (householdId, filters) => api.get(`/${householdId || api.currentHousehold}/api/v1/hisab/debts`, filters),
  addDebt: (householdId, payload) => api.post(`/${householdId || api.currentHousehold}/api/v1/hisab/debts`, payload),
  settleDebt: (householdId, debtId, amountPaid) => api.post(`/${householdId || api.currentHousehold}/api/v1/hisab/debts/${debtId}/settle`, { amount_paid: amountPaid }),
  getDebtWhatsApp: (householdId, debtId) => api.get(`/${householdId || api.currentHousehold}/api/v1/hisab/debts/${debtId}/whatsapp`),
};

// Reminders Module Endpoints
export const RemindersApi = {
  getReminders: (householdId, filters) => api.get(`/${householdId || api.currentHousehold}/api/v1/reminders`, filters),
  createReminder: (householdId, payload) => api.post(`/${householdId || api.currentHousehold}/api/v1/reminders`, payload),
  toggleReminder: (householdId, reminderId) => api.patch(`/${householdId || api.currentHousehold}/api/v1/reminders/${reminderId}/toggle`),
  deleteReminder: (householdId, reminderId) => api.delete(`/${householdId || api.currentHousehold}/api/v1/reminders/${reminderId}`),
};

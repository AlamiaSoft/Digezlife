/**
 * Centralized Household Data Store (SSOT)
 * Authoritative client-side state for the active household across Home, Sauda, Hisaab, and Alerts.
 */
import { createStore } from './store.js';
import { readLocal, writeLocal } from '../services/storage.js';

const INITIAL_STATE = Object.freeze({
  household: null,
  summary: {
    income: 0,
    expenses: 0,
    balance: 0,
    status: 'balanced',
    pace: 'No Activity',
    insight: 'No transactions recorded yet this month.',
    by_category: [],
    weekly_pace: [],
  },
  transactions: [],
  debts: [],
  grocery: {
    primary_list_id: null,
    primary_list_name: 'Weekly Essentials',
    items: [],
    total_count: 0,
    checked_count: 0,
    pending_count: 0,
    lists: [],
  },
  reminders: {
    active: [],
    completed: [],
    pending_count: 0,
    next_due: null,
  },
  activity: [],
  feed_settings: {
    tenant_cleared_at: null,
    personal_cleared_at: null,
    dismissed_activities: [],
    is_owner: false,
  },
  revision: null,
  synced_at: null,
  sync_status: 'synced', // 'synced' | 'syncing' | 'offline' | 'pending_changes' | 'error'
});

export const householdStore = createStore({ ...INITIAL_STATE });

/**
 * Load persisted snapshot immediately from local storage for 0ms startup.
 */
export function loadCachedSnapshot(householdId) {
  if (!householdId) return null;
  const cached = readLocal(`household.snapshot_${householdId}`, null);
  if (cached && typeof cached === 'object') {
    householdStore.set({
      ...cached,
      sync_status: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced',
    });
    return cached;
  }
  return null;
}

/**
 * Update the centralized household store with fresh authoritative server data and persist to storage.
 */
export function setHouseholdSnapshot(snapshotData, householdId, options = {}) {
  if (!snapshotData) return;

  const current = householdStore.get();
  const nextState = {
    ...current,
    household: snapshotData.household || current.household,
    summary: snapshotData.summary || current.summary,
    transactions: Array.isArray(snapshotData.transactions) ? snapshotData.transactions : current.transactions,
    debts: Array.isArray(snapshotData.debts) ? snapshotData.debts : current.debts,
    grocery: snapshotData.grocery || current.grocery,
    reminders: snapshotData.reminders || current.reminders,
    activity: Array.isArray(snapshotData.activity) ? snapshotData.activity : current.activity,
    feed_settings: snapshotData.feed_settings || current.feed_settings,
    revision: snapshotData.revision || current.revision,
    synced_at: snapshotData.synced_at || new Date().toISOString(),
    sync_status: options.sync_status || 'synced',
  };

  householdStore.set(nextState);

  const hid = householdId || nextState.household?.id;
  if (hid) {
    writeLocal(`household.snapshot_${hid}`, {
      household: nextState.household,
      summary: nextState.summary,
      transactions: nextState.transactions,
      debts: nextState.debts,
      grocery: nextState.grocery,
      reminders: nextState.reminders,
      activity: nextState.activity,
      feed_settings: nextState.feed_settings,
      revision: nextState.revision,
      synced_at: nextState.synced_at,
    });
  }
}

/**
 * Update the global synchronization status.
 */
export function setSyncStatus(sync_status) {
  householdStore.set({ sync_status });
}

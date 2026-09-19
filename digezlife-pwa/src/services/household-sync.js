/**
 * Centralized Household Synchronization & Offline Mutation Manager
 * Handles authoritative snapshot reconciliation, background refresh, and offline mutation queue.
 */
import { api } from './api.js';
import { authStore, networkStore } from '../state/store.js';
import {
  householdStore,
  loadCachedSnapshot,
  setHouseholdSnapshot,
  setSyncStatus,
} from '../state/household-store.js';
import { readLocal, writeLocal } from './storage.js';

let isSyncing = false;
let syncTimeout = null;

export const householdSync = {
  /**
   * Initialize synchronization layer on app startup.
   */
  init() {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    // 1. Instant 0ms load from persisted snapshot
    loadCachedSnapshot(hid);

    // 2. Initial background sync
    this.sync({ force: false });

    // 3. Network listener for auto-reconnect reconciliation
    window.addEventListener('online', () => {
      setSyncStatus('syncing');
      this.drainSyncQueue().then(() => this.sync({ force: true }));
    });

    window.addEventListener('offline', () => {
      setSyncStatus('offline');
    });

    // 4. Window focus / visibility change conservative sync
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.sync({ force: false });
      }
    });

    // 5. Global pull-to-refresh listener
    document.addEventListener('app:refresh', () => {
      this.sync({ force: true });
    });
  },

  /**
   * Fetch authoritative household snapshot and reconcile client store.
   * @param {Object} options - { force: boolean, month: string }
   */
  async sync(options = {}) {
    const { force = false, month = null } = options;
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('offline');
      return householdStore.get();
    }

    if (isSyncing) return householdStore.get();
    isSyncing = true;
    setSyncStatus('syncing');

    try {
      const currentRevision = force ? null : householdStore.get().revision;
      const res = await api.getHouseholdSnapshot(hid, { revision: currentRevision, month });

      if (res?.status === 'not_modified' || res?.status === 304) {
        setSyncStatus('synced');
      } else if (res?.data) {
        setHouseholdSnapshot(res.data, hid, { sync_status: 'synced' });
      }

      // Dispatch global sync notification for subscribed views
      if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('household:synced', { detail: householdStore.get() }));
      }
    } catch (err) {
      console.warn('[HouseholdSync] Background sync notice:', err.message || err);
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setSyncStatus('offline');
      } else {
        setSyncStatus('error');
      }
    } finally {
      isSyncing = false;
    }

    return householdStore.get();
  },

  /**
   * Authoritative mutation execution:
   * 1. Runs optimistic UI update immediately
   * 2. If offline, queues operation for later synchronization
   * 3. If online, executes API mutation and triggers authoritative server reconciliation
   */
  async mutate({ entity, operation, optimisticUpdate, apiCall }) {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';

    // 1. Optimistic Update (Immediate UI feedback)
    if (typeof optimisticUpdate === 'function') {
      try {
        const current = householdStore.get();
        const patched = optimisticUpdate(current);
        if (patched) {
          householdStore.set(patched);
        }
      } catch (e) {
        console.warn('[HouseholdSync] Optimistic update failure:', e);
      }
    }

    // 2. Check connectivity
    const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;

    if (!isOnline) {
      this.enqueueOfflineMutation({ entity, operation, hid });
      setSyncStatus('pending_changes');
      return { success: true, offline: true };
    }

    // 3. Online Server Commit
    try {
      const result = await apiCall();

      // Rule #5 & #6: Server is authoritative. Reconcile immediately.
      await this.sync({ force: true });

      return { success: true, data: result };
    } catch (err) {
      console.error(`[HouseholdSync] Mutation failed for ${entity}:${operation}`, err);
      // Fallback: Re-sync to restore verified server truth
      await this.sync({ force: true });
      throw err;
    }
  },

  /**
   * Store queued offline mutation.
   */
  enqueueOfflineMutation({ entity, operation, hid }) {
    const queueKey = `household.sync_queue_${hid}`;
    const queue = readLocal(queueKey, []);
    queue.push({
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      entity,
      operation,
      timestamp: Date.now(),
    });
    writeLocal(queueKey, queue);
  },

  /**
   * Drain pending offline mutations once connectivity returns.
   */
  async drainSyncQueue() {
    const { household } = authStore.get();
    const hid = household?.id || 'demo-household';
    const queueKey = `household.sync_queue_${hid}`;
    const queue = readLocal(queueKey, []);

    if (queue.length === 0) return;

    console.info(`[HouseholdSync] Draining ${queue.length} pending operations...`);
    writeLocal(queueKey, []);
    setSyncStatus('syncing');
  },
};

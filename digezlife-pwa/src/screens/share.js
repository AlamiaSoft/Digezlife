import { authStore, pushToast } from '../state/store.js';
import { icon } from '../components/icon.js';

export const shareScreen = {
  meta: { topbar: { title: 'Invite to Household', back: true }, nav: 'home' },


  render() {
    const { household } = authStore.get();
    const householdName = household?.name || 'My Household';
    const inviteCode = (household?.id || 'demo-household').toUpperCase();
    const inviteUrl = `https://gharlyapp.com/invite/${household?.id || 'demo-household'}`;

    return `
      <div class="screen share-screen">
        <div class="state-panel" style="padding-top:1rem;">
          <div class="state-panel__icon state-panel__icon--brand">
            ${icon('user-plus')}
          </div>
          <h2>Invite Family Member</h2>
          <p class="text-quiet">Share your household space to collaborate in real-time on grocery lists, hisab records, and alerts.</p>
        </div>

        <div class="card" style="padding:1.25rem; margin-top:1rem;">
          <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.4rem; color:var(--wa-color-text-quiet);">HOUSEHOLD INVITE LINK</label>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <wa-input value="${inviteUrl}" readonly style="flex:1; font-size:0.85rem;"></wa-input>
            <wa-copy-button value="${inviteUrl}" aria-label="Copy invite link"></wa-copy-button>
          </div>

          <div style="margin-top:1rem; display:flex; justify-content:space-between; align-items:center; padding-top:0.75rem; border-top:1px solid var(--wa-color-surface-border);">
            <span class="text-quiet" style="font-size:0.85rem;">Invite Code: <strong>${inviteCode}</strong></span>
            <wa-tag badge="brand">Active</wa-tag>
          </div>
        </div>

        <div class="stack" style="margin-top:1.25rem; gap:0.6rem;">
          <wa-button variant="brand" size="l" style="width:100%;" id="btn-share-whatsapp">
            ${icon('share-nodes')} Send WhatsApp Invite
          </wa-button>
          <wa-button appearance="outlined" size="l" style="width:100%;" id="btn-copy-link">
            ${icon('copy')} Copy Link to Clipboard
          </wa-button>
        </div>
      </div>
    `;
  },

  afterRender() {
    const { household } = authStore.get();
    const householdName = household?.name || 'My Household';
    const inviteUrl = `https://gharlyapp.com/invite/${household?.id || 'demo-household'}`;

    document.getElementById('btn-share-whatsapp')?.addEventListener('click', () => {
      const msg = `Salam! Join our household "${householdName}" on GharlyApp to share grocery lists, hisab records, and bill reminders:\n${inviteUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    });

    document.getElementById('btn-copy-link')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(inviteUrl);
      pushToast({ message: 'Invite link copied to clipboard', variant: 'success' });
    });
  },
};

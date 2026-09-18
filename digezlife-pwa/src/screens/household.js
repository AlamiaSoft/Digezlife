import { navigate } from '../state/router.js';
import { authStore, pushToast } from '../state/store.js';
import { api } from '../services/api.js';
import { icon } from '../components/icon.js';

function getInitials(name) {
  if (!name) return 'FM';
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const householdScreen = {
  meta: { topbar: { title: 'Household Members', back: true }, nav: 'home' },

  render() {
    return `
      <div class="screen household-screen">
        <!-- Household Header Card Slot -->
        <section class="card" id="household-header-card" style="padding:1.25rem; background:linear-gradient(135deg, var(--wa-color-surface-card), var(--wa-color-surface-subtle));">
          <div class="stack" style="gap:0.5rem; text-align:center; padding:1rem 0;">
            <wa-spinner style="font-size:1.5rem; margin:0 auto;"></wa-spinner>
            <span class="text-quiet" style="font-size:0.85rem;">Loading household members...</span>
          </div>
        </section>

        <!-- Action Bar: Fast Invite -->
        <div style="display:flex; gap:0.5rem; margin-top:1rem;">
          <wa-button variant="brand" size="medium" style="flex:1;" id="btn-open-invite-drawer">
            ${icon('user-plus')} Invite Family Member
          </wa-button>
          <wa-button appearance="outlined" size="medium" style="width:48px; padding:0; justify-content:center;" id="btn-quick-whatsapp" aria-label="Share via WhatsApp">
            ${icon('share-nodes')}
          </wa-button>
        </div>

        <!-- Section 1: Active Family Members -->
        <div style="margin-top:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <span class="text-quiet" style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;" id="active-members-count-label">
              Active Members
            </span>
          </div>

          <div class="card" id="household-members-container" style="padding:0.25rem 1rem;">
            <div class="text-quiet" style="text-align:center; padding:1.5rem 0;">Loading members...</div>
          </div>
        </div>

        <!-- Section 2: Pending Invitations Slot -->
        <div id="household-pending-section" style="margin-top:1.5rem; display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <span class="text-quiet" style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;" id="pending-invites-count-label">
              Pending Invitations
            </span>
          </div>

          <div class="card" id="household-pending-container" style="padding:0.25rem 1rem;"></div>
        </div>

        <!-- Section 3: Permission Roles Card -->
        <div class="card" style="margin-top:1.5rem; padding:1rem; background:var(--wa-color-surface-lowered, #f8fafc); border:1px dashed var(--wa-color-surface-border);">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
            <span style="color:var(--wa-color-brand-fill); display:inline-flex; align-items:center;">${icon('house')}</span>
            <span style="font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.03em;">How Household Sharing Works</span>
          </div>
          <p class="text-quiet" style="font-size:0.82rem; line-height:1.5; margin:0;">
            Every family member logs in with their own separate account. Everyone in this household can view and edit shared grocery lists, log hisab cashflows, and receive bill alerts in real-time.
          </p>
        </div>

        <!-- WebAwesome Invite Drawer -->
        <wa-drawer id="invite-drawer" placement="bottom" label="Invite Family Member">
          <div class="stack" style="gap:1rem; padding:0.5rem 0;">
            <div style="display:flex; align-items:center; gap:0.65rem;">
              <div class="large-avatar-pill" style="width:36px; height:36px; font-size:1rem; background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet); border-radius:50%; display:inline-flex; align-items:center; justify-content:center;">
                ${icon('user-plus')}
              </div>
              <div>
                <h4 style="margin:0; font-size:1rem; font-weight:800;">Send Household Invitation</h4>
                <p class="text-quiet" style="margin:0; font-size:0.78rem;">Generate a 7-day secure WhatsApp or direct link</p>
              </div>
            </div>

            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:0.4rem;">WhatsApp / Mobile Number or Email</label>
              <wa-input id="input-invite-target" placeholder="e.g. 03001234567 or spouse@gmail.com" size="medium" style="width:100%;"></wa-input>
            </div>

            <div>
              <label style="display:block; font-size:0.82rem; font-weight:700; margin-bottom:0.4rem;">Family Role</label>
              <wa-select id="select-invite-role" value="member" size="medium" style="width:100%;">
                <wa-option value="admin">Household Admin (Can manage members & billing)</wa-option>
                <wa-option value="member">Family Member (Can view & edit shared items)</wa-option>
              </wa-select>
            </div>

            <div style="margin-top:0.5rem; display:flex; gap:0.5rem;">
              <wa-button variant="brand" size="large" style="flex:1;" id="btn-send-whatsapp-invite">
                ${icon('share-nodes')} Share via WhatsApp
              </wa-button>
              <wa-button appearance="outlined" size="large" id="btn-copy-invite-link" aria-label="Copy Link">
                ${icon('copy')}
              </wa-button>
            </div>
          </div>
        </wa-drawer>
      </div>
    `;
  },

  async afterRender() {
    const { user: currentUser, household: currentHousehold } = authStore.get();
    let householdData = {
      id: currentHousehold?.id || 'demo-household',
      name: currentHousehold?.name || 'My Household',
      maxSeats: 5,
      activeCount: 1,
      pendingCount: 0,
    };
    let activeMembers = [];
    let pendingInvites = [];

    const headerEl = document.getElementById('household-header-card');
    const membersContainer = document.getElementById('household-members-container');
    const pendingSection = document.getElementById('household-pending-section');
    const pendingContainer = document.getElementById('household-pending-container');
    const membersCountLabel = document.getElementById('active-members-count-label');
    const pendingCountLabel = document.getElementById('pending-invites-count-label');

    const drawer = document.getElementById('invite-drawer');
    const openBtn = document.getElementById('btn-open-invite-drawer');
    const quickWaBtn = document.getElementById('btn-quick-whatsapp');

    const openDrawer = () => drawer?.show?.() || drawer?.setAttribute('open', '');
    const closeDrawer = () => drawer?.hide?.() || drawer?.removeAttribute('open');

    openBtn?.addEventListener('click', openDrawer);

    // Dynamic URL builder based on current origin & path
    const getJoinUrl = (code) => {
      const origin = window.location.origin;
      const pathname = window.location.pathname.replace(/\/+$/, '');
      return `${origin}${pathname}/#/join?code=${encodeURIComponent(code || householdData.id)}`;
    };

    // Render Function
    const renderUI = () => {
      const totalActive = activeMembers.length || 1;
      const maxSeats = householdData.maxSeats || 5;

      // 1. Header Card
      if (headerEl) {
        headerEl.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <span class="wa-tag badge-emerald" style="font-size:0.75rem; font-weight:700;">ACTIVE HOUSEHOLD</span>
              <h2 style="margin:0.35rem 0 0.2rem 0; font-size:1.35rem;">${householdData.name}</h2>
              <p class="text-quiet" style="font-size:0.85rem; margin:0;">
                ${totalActive} Active Member${totalActive > 1 ? 's' : ''} &bull; ${pendingInvites.length} Pending Invite${pendingInvites.length === 1 ? '' : 's'}
              </p>
            </div>
            <a href="#/upgrade" class="wa-tag" style="background:var(--wa-color-purple-90); color:var(--wa-color-purple-40); font-weight:700; font-size:0.75rem; text-decoration:none; display:inline-flex; align-items:center; gap:0.25rem;">
              ${icon('crown')} Family Plan
            </a>
          </div>

          <!-- Capacity Bar -->
          <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--wa-color-surface-border);">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:600; margin-bottom:0.35rem;">
              <span>Household Seats</span>
              <span class="text-quiet">${totalActive} of ${maxSeats} seats used</span>
            </div>
            <div style="height:6px; background:var(--wa-color-surface-border); border-radius:999px; overflow:hidden;">
              <div style="width:${Math.min((totalActive / maxSeats) * 100, 100)}%; height:100%; background:var(--wa-color-brand-fill); border-radius:999px;"></div>
            </div>
          </div>
        `;
      }

      // 2. Active Members List
      if (membersCountLabel) {
        membersCountLabel.textContent = `Active Members (${activeMembers.length})`;
      }

      if (membersContainer) {
        if (activeMembers.length === 0) {
          membersContainer.innerHTML = `
            <div style="text-align:center; padding:1.5rem 1rem;">
              <div class="large-avatar-pill" style="margin:0 auto 0.75rem auto; width:48px; height:48px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet); font-weight:800;">
                ${getInitials(currentUser?.name || 'You')}
              </div>
              <h4 style="margin:0 0 0.25rem 0;">${currentUser?.name || 'Household Owner'}</h4>
              <p class="text-quiet" style="font-size:0.85rem; margin:0 0 1rem 0;">
                You are currently the only member in this household space.
              </p>
              <wa-button variant="brand" size="small" id="btn-empty-invite">
                ${icon('user-plus')} Invite Your Family
              </wa-button>
            </div>
          `;
          document.getElementById('btn-empty-invite')?.addEventListener('click', openDrawer);
        } else {
          membersContainer.innerHTML = activeMembers
            .map((member, index) => {
              const isOwner = member.role === 'owner';
              const isAdmin = member.role === 'admin';
              const roleBadge = isOwner
                ? `<span class="wa-tag badge-emerald" style="font-size:0.7rem; font-weight:700; display:inline-flex; align-items:center; gap:0.25rem;">${icon('crown')} Owner</span>`
                : isAdmin
                ? `<span class="wa-tag" style="background:var(--wa-color-purple-90); color:var(--wa-color-purple-40); font-size:0.7rem; font-weight:600;">Admin</span>`
                : '<span class="wa-tag" style="background:var(--wa-color-surface-subtle); color:var(--wa-color-text-quiet); font-size:0.7rem;">Member</span>';

              return `
                <div class="list-row" style="border:none; ${index < activeMembers.length - 1 ? 'border-bottom:1px solid var(--wa-color-surface-border);' : ''} border-radius:0; padding:0.85rem 0; display:flex; align-items:center;">
                  <div class="large-avatar-pill" style="width:42px; height:42px; min-width:42px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:700; background:${member.avatarColor || 'var(--wa-color-brand-fill-quiet)'}; color:${member.avatarText || 'var(--wa-color-brand-on-quiet)'};">
                    ${getInitials(member.name)}
                  </div>
                  <div class="list-row__body" style="margin-left:0.75rem; flex:1; min-width:0;">
                    <div style="display:flex; align-items:center; gap:0.4rem;">
                      <span class="list-row__title" style="font-size:0.95rem; font-weight:700;">${member.name}</span>
                      ${member.isCurrent ? '<span style="font-size:0.75rem; color:var(--wa-color-text-quiet); font-weight:600;">(You)</span>' : ''}
                    </div>
                    <div class="list-row__subtitle" style="font-size:0.8rem; color:var(--wa-color-text-quiet);">
                      ${member.email || member.phone || 'Active'} &bull; Joined ${member.joinedAt}
                    </div>
                  </div>
                  <div>
                    ${roleBadge}
                  </div>
                </div>
              `;
            })
            .join('');
        }
      }

      // 3. Pending Invites List
      if (pendingInvites.length > 0) {
        if (pendingSection) pendingSection.style.display = 'block';
        if (pendingCountLabel) pendingCountLabel.textContent = `Pending Invitations (${pendingInvites.length})`;
        if (pendingContainer) {
          pendingContainer.innerHTML = pendingInvites
            .map(
              (invite, idx) => `
              <div class="list-row" style="border:none; ${idx < pendingInvites.length - 1 ? 'border-bottom:1px solid var(--wa-color-surface-border);' : ''} border-radius:0; padding:0.85rem 0; display:flex; align-items:center;">
                <div class="large-avatar-pill" style="width:42px; height:42px; min-width:42px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:0.9rem; background:var(--wa-color-amber-90, #fef3c7); color:var(--wa-color-amber-40, #92400e);">
                  ${icon('clock')}
                </div>
                <div class="list-row__body" style="margin-left:0.75rem; min-width:0; flex:1;">
                  <div class="list-row__title" style="font-size:0.95rem; font-weight:700; text-overflow:ellipsis; overflow:hidden;">${invite.recipient}</div>
                  <div class="list-row__subtitle" style="font-size:0.8rem; color:var(--wa-color-text-quiet);">
                    Invited ${invite.sentAt} &bull; <span class="text-quiet">Expires in ${invite.expiresIn}</span>
                  </div>
                </div>
                <div style="display:flex; gap:0.35rem; align-items:center; flex-shrink:0;">
                  <wa-button size="small" appearance="outlined" class="btn-resend-invite" data-url="${invite.inviteUrl || ''}" data-target="${invite.recipient}" style="font-size:0.75rem;">
                    ${icon('share-nodes')} Resend
                  </wa-button>
                  <wa-button size="small" variant="danger" appearance="plain" class="btn-cancel-invite" data-id="${invite.id}" aria-label="Cancel Invite" style="padding:0 0.35rem;">
                    ${icon('trash-can')}
                  </wa-button>
                </div>
              </div>
            `
            )
            .join('');

          // Wire resend buttons
          pendingContainer.querySelectorAll('.btn-resend-invite').forEach((btn) => {
            btn.addEventListener('click', () => {
              const url = btn.getAttribute('data-url');
              const target = btn.getAttribute('data-target') || '';
              triggerWhatsAppShare(target, url);
              pushToast({ message: 'Prepared WhatsApp invite message', variant: 'neutral' });
            });
          });

          // Wire cancel buttons
          pendingContainer.querySelectorAll('.btn-cancel-invite').forEach((btn) => {
            btn.addEventListener('click', async () => {
              const invId = btn.getAttribute('data-id');
              if (invId) {
                try {
                  await api.cancelHouseholdInvite(invId);
                  pendingInvites = pendingInvites.filter((i) => i.id !== invId);
                  renderUI();
                  pushToast({ message: 'Invitation cancelled', variant: 'neutral' });
                } catch (e) {
                  pushToast({ message: 'Could not cancel invitation', variant: 'danger' });
                }
              }
            });
          });
        }
      } else {
        if (pendingSection) pendingSection.style.display = 'none';
      }
    };

    // Load Live Data from Backend API
    const loadHouseholdData = async () => {
      try {
        const res = await api.getHouseholdMembers();
        if (res?.data) {
          if (res.data.household) householdData = res.data.household;
          if (res.data.members) activeMembers = res.data.members;
          if (res.data.pendingInvites) pendingInvites = res.data.pendingInvites;
        }
      } catch (err) {
        console.warn('[Household] Loading from fallback/offline cache:', err.message);
        // Fallback to active current user
        if (currentUser) {
          activeMembers = [
            {
              id: String(currentUser.id || '1'),
              name: currentUser.name || 'Household Head',
              email: currentUser.email || 'user@gharlyapp.com',
              role: 'owner',
              roleTitle: 'Head of Household',
              joinedAt: 'Active',
              isCurrent: true,
              avatarColor: 'var(--wa-color-brand-fill-quiet)',
              avatarText: 'var(--wa-color-brand-on-quiet)',
            },
          ];
        }
      } finally {
        renderUI();
      }
    };

    // Trigger WhatsApp Share Helper
    const triggerWhatsAppShare = (target = '', customUrl = null) => {
      const finalUrl = customUrl || getJoinUrl(householdData.id);
      const msg = `Assalam-o-Alaikum! Join our household "${householdData.name}" on GharlyApp to share grocery lists, hisab cashflows, and bill reminders:\n👉 ${finalUrl}`;
      const cleanTarget = target.replace(/\D/g, '');
      const waUrl = cleanTarget
        ? `https://wa.me/${cleanTarget}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    };

    // Quick WhatsApp button
    quickWaBtn?.addEventListener('click', () => triggerWhatsAppShare());

    // Send WhatsApp Invite inside Drawer
    document.getElementById('btn-send-whatsapp-invite')?.addEventListener('click', async () => {
      const targetInput = document.getElementById('input-invite-target');
      const targetVal = targetInput?.value?.trim() || '';
      const role = document.getElementById('select-invite-role')?.value || 'member';

      if (!targetVal) {
        pushToast({ message: 'Please enter a phone number or email', variant: 'warning' });
        return;
      }

      try {
        const res = await api.createHouseholdInvite({
          recipient: targetVal,
          role,
        });

        const createdInvite = res?.data;
        const generatedUrl = createdInvite?.inviteUrl || getJoinUrl(createdInvite?.token || householdData.id);

        triggerWhatsAppShare(targetVal, generatedUrl);
        pushToast({ message: `Invitation created for ${targetVal}`, variant: 'success' });
        closeDrawer();
        if (targetInput) targetInput.value = '';

        // Reload data
        await loadHouseholdData();
      } catch (err) {
        // Fallback local share if backend offline
        triggerWhatsAppShare(targetVal);
        pushToast({ message: 'Prepared invite message', variant: 'neutral' });
        closeDrawer();
      }
    });

    // Copy Invite Link Button inside Drawer
    document.getElementById('btn-copy-invite-link')?.addEventListener('click', async () => {
      const targetInput = document.getElementById('input-invite-target');
      const targetVal = targetInput?.value?.trim() || 'invite';
      const role = document.getElementById('select-invite-role')?.value || 'member';

      try {
        const res = await api.createHouseholdInvite({
          recipient: targetVal,
          role,
        });
        const generatedUrl = res?.data?.inviteUrl || getJoinUrl(householdData.id);
        navigator.clipboard?.writeText(generatedUrl);
        pushToast({ message: 'Household invite link copied!', variant: 'success' });
        closeDrawer();
        await loadHouseholdData();
      } catch (err) {
        const fallbackUrl = getJoinUrl(householdData.id);
        navigator.clipboard?.writeText(fallbackUrl);
        pushToast({ message: 'Invite link copied!', variant: 'success' });
      }
    });

    // Pull-to-refresh / app:refresh support
    document.addEventListener('app:refresh', async () => {
      await loadHouseholdData();
    });

    // Initial load
    await loadHouseholdData();
  },
};


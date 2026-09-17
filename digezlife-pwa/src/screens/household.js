import { navigate } from '../state/router.js';
import { authStore, pushToast } from '../state/store.js';
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

let householdMembers = [
  {
    id: 'mem_1',
    name: 'Ali Khan',
    email: 'admin@gharlyapp.com',
    role: 'owner',
    roleTitle: 'Head of Household',
    joinedAt: 'Feb 10, 2026',
    isCurrent: true,
    avatarColor: 'var(--wa-color-brand-fill-quiet)',
    avatarText: 'var(--wa-color-brand-on-quiet)',
  },
  {
    id: 'mem_2',
    name: 'Sarah Khan',
    email: 'sarah@example.com',
    role: 'admin',
    roleTitle: 'Household Admin',
    joinedAt: 'Feb 12, 2026',
    isCurrent: false,
    avatarColor: 'var(--wa-color-purple-90)',
    avatarText: 'var(--wa-color-purple-40)',
  },
  {
    id: 'mem_3',
    name: 'Ahmed Khan',
    email: 'ahmed@example.com',
    role: 'member',
    roleTitle: 'Family Member',
    joinedAt: 'Mar 01, 2026',
    isCurrent: false,
    avatarColor: 'var(--wa-color-blue-90)',
    avatarText: 'var(--wa-color-blue-40)',
  },
];

let pendingInvites = [
  {
    id: 'inv_1',
    recipient: 'bilal.khan@gmail.com',
    role: 'member',
    roleTitle: 'Family Member',
    sentAt: '2 days ago',
    expiresIn: '5 days',
    token: 'gharly_inv_98fbc1',
  },
];

export const householdScreen = {
  meta: { topbar: { title: 'Household Members', back: true }, nav: 'home' },

  render() {
    const { user, household } = authStore.get();
    const householdName = household?.name || 'My Household';
    const totalMembers = householdMembers.length;
    const maxSeats = 5;
    const inviteUrl = `https://gharlyapp.alamiaconnect.com/#/join?code=${household?.id || 'demo-household'}`;

    return `
      <div class="screen household-screen">
        <!-- Household Header Card -->
        <section class="card" style="padding:1.25rem; background:linear-gradient(135deg, var(--wa-color-surface-card), var(--wa-color-surface-subtle));">
          <div style="display:flex; justify-content;space-between; align-items:flex-start;">
            <div>
              <span class="wa-tag badge-emerald" style="font-size:0.75rem; font-weight:700;">ACTIVE HOUSEHOLD</span>
              <h2 style="margin:0.35rem 0 0.2rem 0; font-size:1.35rem;">${householdName}</h2>
              <p class="text-quiet" style="font-size:0.85rem; margin:0;">
                ${totalMembers} Active Members &bull; ${pendingInvites.length} Pending Invite
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
              <span class="text-quiet">${totalMembers} of ${maxSeats} seats used</span>
            </div>
            <div style="height:6px; background:var(--wa-color-surface-border); border-radius:999px; overflow:hidden;">
              <div style="width:${(totalMembers / maxSeats) * 100}%; height:100%; background:var(--wa-color-brand-fill); border-radius:999px;"></div>
            </div>
          </div>
        </section>


        <!-- Action Bar: Fast Invite -->
        <div style="display:flex; gap:0.5rem; margin-top:1rem;">
          <wa-button variant="brand" size="medium" style="flex:1;" id="btn-open-invite-modal">
            ${icon('user-plus')} Invite Family Member
          </wa-button>
          <wa-button appearance="outlined" size="medium" style="width:48px; padding:0; justify-content:center;" id="btn-quick-whatsapp" aria-label="Share via WhatsApp">
            ${icon('share-nodes')}
          </wa-button>
        </div>


        <!-- Section 1: Active Family Members -->
        <div style="margin-top:1.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <span class="text-quiet" style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">
              Active Members (${householdMembers.length})
            </span>
          </div>


          <div class="card" style="padding:0.25rem 1rem;">
            ${householdMembers
              .map((member, index) => {
                const isOwner = member.role === 'owner';
                const isAdmin = member.role === 'admin';
                const roleBadge = isOwner
                  ? '<span class="wa-tag" style="background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet); font-size:0.7rem; font-weight:700;">👡 Owner</span>'
                  : isAdmin
                  ? '<span class="wa-tag" style="background:var(--wa-color-purple-90); color:var(--wa-color-purple-40); font-size:0.7rem; font-weight:600;">Admin</span>'
                  : '<span class="wa-tag" style="background:var(--wa-color-surface-subtle); color:var(--wa-color-text-quiet); font-size:0.7rem;">Member</span>';


                return `
                  <div class="list-row" style="border:none; ${index < householdMembers.length - 1 ? 'border-bottom:1px solid var(--wa-color-surface-border);' : ''} border-radius:0; padding:0.85rem 0;">
                    <div class="large-avatar-pill" style="width:42px; height:42px; min-width:42px; font-size:0.9rem; background:${member.avatarColor}; color:${member.avatarText};">
                      ${getInitials(member.name)}
                    </div>
                    <div class="list-row__body" style="margin-left:0.75rem;">
                      <div style="display:flex; align-items:center; gap:0.4rem;">
                        <span class="list-row__title" style="font-size:0.95rem;">${member.name}</span>
                        ${member.isCurrent ? '<span style="font-size:0.75rem; color:var(--wa-color-text-quiet); font-weight:600;">(You)</span>' : ''}
                      </div>
                      <div class="list-row__subtitle" style="font-size:0.8rem;">${member.email} &bull; Joined ${member.joinedAt}</div>
                    </div>
                    <div>
                      ${roleBadge}
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>


        <!-- Section 2: Pending Invitations -->
        ${
          pendingInvites.length > 0
            ? `<div style="margin-top:1.5rem;">
            <div style="display:flex; justify-content;space-between; align-items:flex-start; margin-bottom:0.69rem;">
              <span class="text-quiet" style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">
                Pending Invites (${pendingInvites.length})
              </span>
            </div>

            <div class="card" style="padding:0.25rem 1rem;">
              ${pendingInvites
                .map(
                  (invite) => `
                  <div class="list-row" style="border:none; border-radius:0; padding:0.85rem 0;">
                    <div class="large-avatar-pill" style="width:42px; height:42px; min-width:42px; font-size:0.9rem; background:var(--wa-color-yellow-90); color:var(--wa-color-yellow-30);">
                      ${icon('clock')}
                    </div>
                    <div class="list-row__body" style="margin-left:0.75rem;">
                      <div class="list-row__title" style="font-size:0.95rem;">${invite.recipient}</div>
                      <div class="list-row__subtitle" style="font-size:0.8rem;">
                        Invited ${invite.sentAt} &bull; <span class="text-quiet">Expires in ${invite.expiresIn}</span>
                      </div>
                    </div>
                    <div style="display:flex; gap:0.4rem;">
                      <wa-button size="small" appearance="outlined" class="btn-resend-invite" data-token="${invite.token}" style="font-size:0.75rem;">
                        ${icon('share-nodes')} Resend
                      </wa-button>
                    </div>
                  </div>
                `
                )
                .join('')}
            </div>
          </div>`
            : ''
        }


        <!-- Section 3: Permission Roles Card -->
        <div class="card" style="margin-top:1.5rem; padding:1rem; background:var(--wa-color-surface-subtle); border:1px dashed var(--wa-color-surface-border);">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
            <span style="font-size:1.1rem;">💒</span>
            <span style="font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.03em;">How Household Sharing Works</span>
          </div>
          <p class="text-quiet" style="font-size:0.82rem; line-height:1.5; margin:0;">
            Every family member logs in with their own separate account. Everyone in this household can view and edit shared grocery lists, log hisab cashflows, and receive bill alerts in real-time.
          </p>
        </div>


        <!-- Invite Modal Drawer -->
        <div id="invite-modal-backdrop" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; backdrop-filter:blur(4px); align-items:flex-end; justify-content:center;">
          <div class="card" style="width:100%; max-width:540px; border-radius:24px 24px 0 0; padding:1.5rem; background:var(--wa-color-surface-card); box-shadow:0 -10px 40px rgba(0,0,0,0.3);">
            <div style="display:flex; justify-content;space-between; align-items:center; margin-bottom:1rem;">
              <h3 style="margin:0; font-size:1.2rem;">Invite Family Member</h3>
              <button id="btn-close-invite-modal" style="background:none; border:none; font-size:1.4rem; cursor:pointer; color:var(--wa-color-text-quiet);">&times;</button>
            </div>

            <div class="stack" style="gap:0.9rem;">
              <div>
                <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.35rem;">Email or Phone Number</label>
                <wa-input id="input-invite-target" placeholder="e.g. spouse@gmail.com or 03001234567" size="medium"></wa-input>
              </div>


              <div>
                <label style="display:block; font-size:0.8rem; font-weight:600; margin-bottom:0.35rem;">Family Role</label>
                <wa-select id="select-invite-role" value="member" size="medium">
                  <wa-option value="admin">Household Admin (Can manage members & billing)</wa-option>
                  <wa-option value="member">Family Member (Can view & edit shared items)</wa-option>
                </wa-select>
              </div>


              <div style="margin-top:0.5rem; display:flex; gap:0.5rem;">
                <wa-button variant="brand" size="large" style="flex:1;" id="btn-send-whatsapp-invite">
                  ${icon('share-nodes')} Invite via WhatsApp
                </wa-button>
                <wa-button appearance="outlined" size="large" id="btn-copy-invite-link" aria-label="Copy Link">
                  ${icon('copy')}
                </wa-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    const { household } = authStore.get();
    const householdName = household?.name || 'My Household';
    const inviteUrl = `https://gharlyapp.alamiaconnect.com/#/join?code=${household?.id || 'demo-household'}`;


    const modal = document.getElementById('invite-modal-backdrop');
    const openBtn = document.getElementById('btn-open-invite-modal');
    const closeBtn = document.getElementById('btn-close-invite-modal');
    const quickWaBtn = document.getElementById('btn-quick-whatsapp');


    const openModal = () => {
      if (modal) modal.style.display = 'flex';
    };

    const closeModal = () => {
      if (modal) modal.style.display = 'none';
    };

    openBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });


    const triggerWhatsAppShare = (target = '') => {
      const msg = `Assalam-o-Alaikum! Join our household "${householdName}" on GharlyApp to share our grocery lists, hisab tracker, and bill reminders:\n👈 ${inviteUrl}`;
      const url = target
        ? `https://wa.me/${target.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    };

    quickWaBtn?.addEventListener('click', () => triggerWhatsAppShare());

    document.getElementById('btn-send-whatsapp-invite')?.addEventListener('click', () => {
      const targetInput = document.getElementById('input-invite-target');
      const targetVal = targetInput?.value?.trim() || '';
      triggerWhatsAppShare(targetVal);

      if (targetVal) {
        pendingInvites.push({
          id: `inv_${Date.now()}`,
          recipient: targetVal,
          role: document.getElementById('select-invite-role')?.value || 'member',
          roleTitle: 'Family Member',
          sentAt: 'Just now',
          expiresIn: '7 days',
          token: `gharly_inv_${Math.random().toString(36).slice(2, 8)}`,
        });
        pushToast({ message: `Invite sent to ${targetVal}`, variant: 'success' });
        closeModal();
        navigate('/household');
      }
    });


    document.getElementById('btn-copy-invite-link')?.addEventListener('click', () => {
      navigator.clipboard?.writeText(inviteUrl);
      pushToast({ message: 'Household invite link copied!', variant: 'success' });
    });

    document.querySelectorAll('.btn-resend-invite').forEach((btn) => {
      btn.addEventListener('click', () => {
        triggerWhatsAppShare();
        pushToast({ message: 'Invite link prepared for sharing', variant: 'neutral' });
      });
    });
  },
};

import { authStore } from '../state/store.js';
import { icon } from '../components/icon.js';

function getInitials(name) {
  if (!name) return 'FM';
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

export const activityScreen = {
  meta: { topbar: { title: 'Family Activity', back: true }, nav: 'home' },

  render() {
    const { household } = authStore.get();
    const householdName = household?.name || 'My Household';

    return `
      <div class="screen activity-screen">
        <!-- Header Description -->
        <div style="margin-bottom:1rem;">
          <h2 style="font-size:1.25rem; font-weight:800; margin:0 0 0.25rem 0;">Household Activity Feed</h2>
          <p class="text-quiet" style="font-size:0.85rem; margin:0; line-height:1.45;">
            Real-time feed of grocery updates, hisab logs, and bill payments in <strong>${householdName}</strong>.
          </p>
        </div>

        <!-- Filter Chips -->
        <div class="filter-chips-row" id="activity-filters" style="margin-bottom:1rem;">
          <button class="filter-chip is-active" data-filter="all" style="display:inline-flex; align-items:center; gap:5px;">
            ${icon('list')} <span>All Updates</span>
          </button>
          <button class="filter-chip" data-filter="grocery" style="display:inline-flex; align-items:center; gap:5px;">
            ${icon('basket-shopping')} <span>Grocery</span>
          </button>
          <button class="filter-chip" data-filter="hisab" style="display:inline-flex; align-items:center; gap:5px;">
            ${icon('receipt')} <span>Hisab</span>
          </button>
          <button class="filter-chip" data-filter="bills" style="display:inline-flex; align-items:center; gap:5px;">
            ${icon('bolt')} <span>Bills</span>
          </button>
          <button class="filter-chip" data-filter="family" style="display:inline-flex; align-items:center; gap:5px;">
            ${icon('users')} <span>Family</span>
          </button>
        </div>

        <!-- Activity Stream Container -->
        <div class="stack" id="activity-stream-list" style="gap:0.75rem;">
          <!-- Card 1: Grocery addition -->
          <div class="card activity-card" data-category="grocery" style="padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div style="display:flex; align-items:center; gap:0.65rem;">
                <div class="avatar sm" style="background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet);">AM</div>
                <div>
                  <div style="font-weight:700; font-size:0.92rem;">Ammi</div>
                  <div class="text-quiet" style="font-size:0.78rem;">Kitchen &amp; Grocery</div>
                </div>
              </div>
              <span class="pill green" style="font-size:0.7rem; display:inline-flex; align-items:center; gap:4px;">
                ${icon('basket-shopping')} Grocery
              </span>
            </div>
            <p style="margin:0.75rem 0 0.35rem 0; font-size:0.88rem; line-height:1.45;">
              Added <strong style="color:var(--wa-color-text-normal);">Ghee 5KG</strong> to the shared Sauda List.
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; font-size:0.78rem; color:var(--wa-color-text-quiet);">
              <span>10 minutes ago</span>
              <a href="#/grocery" style="color:var(--wa-color-brand-on-normal); font-weight:700; text-decoration:none;">View List &rarr;</a>
            </div>
          </div>

          <!-- Card 2: Hisab entry -->
          <div class="card activity-card" data-category="hisab" style="padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div style="display:flex; align-items:center; gap:0.65rem;">
                <div class="avatar sm" style="background:var(--wa-color-blue-90); color:var(--wa-color-blue-40);">AB</div>
                <div>
                  <div style="font-weight:700; font-size:0.92rem;">Abu (Asif)</div>
                  <div class="text-quiet" style="font-size:0.78rem;">Household Head</div>
                </div>
              </div>
              <span class="pill red" style="font-size:0.7rem; display:inline-flex; align-items:center; gap:4px;">
                ${icon('receipt')} Hisab
              </span>
            </div>
            <p style="margin:0.75rem 0 0.35rem 0; font-size:0.88rem; line-height:1.45;">
              Recorded expense of <strong style="color:var(--wa-color-red-40);">PKR 14,200</strong> for <em>IESCO Electricity Bill</em>.
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; font-size:0.78rem; color:var(--wa-color-text-quiet);">
              <span>1 hour ago</span>
              <a href="#/hisab" style="color:var(--wa-color-brand-on-normal); font-weight:700; text-decoration:none;">View Hisab &rarr;</a>
            </div>
          </div>

          <!-- Card 3: Grocery check off -->
          <div class="card activity-card" data-category="grocery" style="padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div style="display:flex; align-items:center; gap:0.65rem;">
                <div class="avatar sm" style="background:var(--wa-color-purple-90); color:var(--wa-color-purple-40);">ZN</div>
                <div>
                  <div style="font-weight:700; font-size:0.92rem;">Zain</div>
                  <div class="text-quiet" style="font-size:0.78rem;">Family Member</div>
                </div>
              </div>
              <span class="pill green" style="font-size:0.7rem; display:inline-flex; align-items:center; gap:4px;">
                ${icon('check')} Completed
              </span>
            </div>
            <p style="margin:0.75rem 0 0.35rem 0; font-size:0.88rem; line-height:1.45;">
              Checked off <strong style="color:var(--wa-color-text-normal);">Milk (2 Liters)</strong> and <strong style="color:var(--wa-color-text-normal);">Bread</strong>.
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; font-size:0.78rem; color:var(--wa-color-text-quiet);">
              <span>3 hours ago</span>
              <a href="#/grocery" style="color:var(--wa-color-brand-on-normal); font-weight:700; text-decoration:none;">View Sauda &rarr;</a>
            </div>
          </div>

          <!-- Card 4: Utility Bill Alert -->
          <div class="card activity-card" data-category="bills" style="padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div style="display:flex; align-items:center; gap:0.65rem;">
                <div class="avatar sm" style="background:var(--wa-color-amber-90); color:var(--wa-color-amber-40); display:grid; place-items:center;">
                  ${icon('bell')}
                </div>
                <div>
                  <div style="font-weight:700; font-size:0.92rem;">System Reminder</div>
                  <div class="text-quiet" style="font-size:0.78rem;">Household Alerts</div>
                </div>
              </div>
              <span class="pill orange" style="font-size:0.7rem; display:inline-flex; align-items:center; gap:4px;">
                ${icon('triangle-exclamation')} Due Alert
              </span>
            </div>
            <p style="margin:0.75rem 0 0.35rem 0; font-size:0.88rem; line-height:1.45;">
              Sui Northern Gas Bill due date approaching (<strong style="color:var(--wa-color-text-normal);">PKR 2,480</strong> due on 22 Sep).
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; font-size:0.78rem; color:var(--wa-color-text-quiet);">
              <span>Yesterday</span>
              <a href="#/reminders" style="color:var(--wa-color-brand-on-normal); font-weight:700; text-decoration:none;">View Reminders &rarr;</a>
            </div>
          </div>

          <!-- Card 5: Family Member Invite -->
          <div class="card activity-card" data-category="family" style="padding:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div style="display:flex; align-items:center; gap:0.65rem;">
                <div class="avatar sm" style="background:var(--wa-color-brand-fill-quiet); color:var(--wa-color-brand-on-quiet);">AB</div>
                <div>
                  <div style="font-weight:700; font-size:0.92rem;">Abu (Asif)</div>
                  <div class="text-quiet" style="font-size:0.78rem;">Household Head</div>
                </div>
              </div>
              <span class="pill blue" style="font-size:0.7rem; display:inline-flex; align-items:center; gap:4px;">
                ${icon('users')} Members
              </span>
            </div>
            <p style="margin:0.75rem 0 0.35rem 0; font-size:0.88rem; line-height:1.45;">
              Issued family invitation for <strong style="color:var(--wa-color-text-normal);">Spouse</strong> as Household Admin.
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; font-size:0.78rem; color:var(--wa-color-text-quiet);">
              <span>2 days ago</span>
              <a href="#/household" style="color:var(--wa-color-brand-on-normal); font-weight:700; text-decoration:none;">Manage Members &rarr;</a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    const filterButtons = document.querySelectorAll('#activity-filters .filter-chip');
    const cards = document.querySelectorAll('.activity-card');

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.getAttribute('data-filter');
        cards.forEach((card) => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  },
};

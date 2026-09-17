import { navigate } from '../state/router.js';
import { authStore, login } from '../state/store.js';
import { api } from '../services/api.js';

export const splashScreen = {
  meta: { topbar: null, nav: null },
  render() {
    return `
      <div class="screen screen--flush splash">
        <div class="splash__center">
          <div class="splash__mark">
            <span class="splash__letter">G</span>
          </div>
          <h1 class="splash__wordmark">GharlyApp</h1>
          <p class="splash__tagline text-quiet">Your Home, Made Easier</p>
        </div>
        <div class="splash__footer">
          <wa-spinner style="font-size:1.5rem;"></wa-spinner>
        </div>
      </div>
    `;
  },
  async afterRender() {
    if (!api.token) {
      setTimeout(() => navigate('/login'), 600);
      return;
    }

    try {
      const meRes = await api.getCurrentUser();
      if (meRes?.data) {
        const user = {
          name: meRes.data.attributes?.name || 'Household User',
          email: meRes.data.attributes?.email || '',
        };
        const household = meRes.meta?.household || { id: 'demo-household', name: 'My Household' };
        login(user, api.token, household);
        navigate('/home');
      } else {
        navigate('/login');
      }
    } catch (err) {
      // If token expired or invalid, go to login
      navigate('/login');
    }
  },
};

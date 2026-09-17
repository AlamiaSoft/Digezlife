import { navigate } from '../state/router.js';
import { login, pushToast } from '../state/store.js';
import { api } from '../services/api.js';

export const otpScreen = {
  meta: { topbar: { title: 'Verify phone', back: true }, nav: null },
  render() {
    return `
      <div class="screen auth-screen auth-screen--sub">
        <div class="state-panel" style="padding-top:0.5rem;">
          <div class="state-panel__icon state-panel__icon--brand"><wa-icon name="mobile-screen"></wa-icon></div>
          <h3>Enter the 6-digit code</h3>
          <p>We sent a code to your phone number. For this demo, the code is <strong>123456</strong>.</p>
        </div>
        <div class="row" style="justify-content:center;margin:1.25rem 0;">
          <wa-otp-input length="6" data-otp></wa-otp-input>
        </div>
        <wa-button variant="brand" size="l" style="width:100%;" data-verify>Verify</wa-button>
        <p class="auth-screen__footer text-quiet">
          Didn't get a code? <a href="#/otp" data-resend>Resend</a>
        </p>
      </div>
    `;
  },
  afterRender() {
    const otp = document.querySelector('[data-otp]');
    const verifyBtn = document.querySelector('[data-verify]');

    const doVerify = async () => {
      const code = otp?.value || '';
      if (!code) return;
      if (verifyBtn) verifyBtn.loading = true;
      try {
        const { verified } = await api.verifyOtp({ code });
        if (verified) {
          const user = await api.login({});
          login(user);
          pushToast({ message: 'Phone verified.', variant: 'success' });
          navigate('/home');
        } else {
          pushToast({ message: 'Incorrect code — try 123456 for this demo.', variant: 'danger' });
        }
      } finally {
        if (verifyBtn) verifyBtn.loading = false;
      }
    };

    verifyBtn?.addEventListener('click', doVerify);
    otp?.addEventListener('wa-complete', doVerify);

    document.querySelector('[data-resend]')?.addEventListener('click', (e) => {
      e.preventDefault();
      pushToast({ message: 'Code resent.', variant: 'brand' });
    });
  },
};

import { BRAND } from '../config/brand.js';

export const legalSecurityScreen = {
  meta: { topbar: { title: 'Security Posture', back: true } },

  render() {
    return `
      <div class="screen legal-screen" style="padding:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h2 style="margin:0; font-size:1.4rem; font-weight:800;">Security Posture</h2>
          <wa-badge variant="neutral">v1.0 &bull; Sept 2026</wa-badge>
        </div>

        <div class="card" style="padding:1.25rem; line-height:1.6; font-size:0.88rem;">
          <h3 style="margin-top:0;">Security Standards</h3>
          <p>${BRAND.name} is built with security-first architecture:</p>
          <ul style="padding-left:1.2rem;">
            <li><strong>Transport Encryption:</strong> All traffic is encrypted via TLS/HTTPS.</li>
            <li><strong>Authentication:</strong> Bearer token authentication via Laravel Sanctum.</li>
            <li><strong>Rate Limiting:</strong> API endpoints and auth requests are strictly throttled against brute-force attacks.</li>
            <li><strong>Tenant Isolation:</strong> Strict database and middleware scoping per household.</li>
          </ul>

          <h3>Responsible Disclosure</h3>
          <p>To report security vulnerabilities, please email <strong>${BRAND.supportEmail}</strong> with reproduction steps.</p>
        </div>
      </div>
    `;
  },
};

import { icon } from '../components/icon.js';

const COPY = {
  create: { title: 'Record created', body: 'Your new record has been added and is ready to go.' },
  update: { title: 'Changes saved', body: 'Your updates have been saved successfully.' },
  invite: { title: 'Invite sent', body: 'We\u2019ve emailed your teammate an invitation to join.' },
  subscribe: { title: 'You\u2019re upgraded', body: 'Your plan is now active. Enjoy the new features!' },
};

export const successScreen = {
  meta: { topbar: null, nav: null },
  render(params) {
    const copy = COPY[params.type] || COPY.create;
    return `
      <div class="screen screen--flush" style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 2rem;">
        <div class="success-mark">${icon('check')}</div>
        <h2 style="font-size:1.3rem;margin-top:1rem;">${copy.title}</h2>
        <p class="text-quiet" style="margin-top:0.4rem;">${copy.body}</p>
        <wa-button variant="brand" size="large" href="#/home" style="width:100%;margin-top:2rem;">Done</wa-button>
      </div>
    `;
  },
};

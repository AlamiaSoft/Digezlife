import { skeletonListHTML, emptyStateHTML, errorStateHTML } from '../components/states.js';

export const demoLoadingScreen = {
  meta: { topbar: { title: 'Loading state', back: true }, nav: null },
  render() {
    return `<div class="screen" style="margin-top:0.5rem;">${skeletonListHTML(6)}</div>`;
  },
};

export const demoEmptyScreen = {
  meta: { topbar: { title: 'Empty state', back: true }, nav: null },
  render() {
    return `<div class="screen">${emptyStateHTML({
      icon: 'inbox',
      title: 'No records yet',
      body: 'Once you add your first record, it will show up here.',
      actionLabel: 'Create a record',
      actionHref: '#/create',
    })}</div>`;
  },
};

export const demoErrorScreen = {
  meta: { topbar: { title: 'Error state', back: true }, nav: null },
  render() {
    return `<div class="screen">${errorStateHTML({ retryId: 'demo-error-retry' })}</div>`;
  },
  afterRender() {
    document.getElementById('demo-error-retry')?.addEventListener('click', () => {
      history.back();
    });
  },
};

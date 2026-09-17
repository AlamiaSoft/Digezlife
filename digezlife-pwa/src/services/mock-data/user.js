export const MOCK_USER = {
  id: 'usr_1001',
  name: 'Amir Rahman',
  email: 'amir@example.com',
  phone: '+1 555 0114',
  plan: 'Pro Trial',
  avatarInitials: 'AR',
  memberSince: '2026-02-11',
};

export const MOCK_NOTIFICATIONS = [
  { id: 'ntf_1', title: 'Retainer invoice paid', body: 'Q3 Client Retainer — $4,800.00 received.', time: '2h ago', read: false, icon: 'circle-check' },
  { id: 'ntf_2', title: 'Contract needs your signature', body: 'Riverside Studio Renewal is due in 4 days.', time: '6h ago', read: false, icon: 'file-signature' },
  { id: 'ntf_3', title: 'Unusual charge flagged', body: 'Duplicate Charge Dispute was flagged for review.', time: 'Yesterday', read: true, icon: 'triangle-exclamation' },
  { id: 'ntf_4', title: 'Weekly summary is ready', body: 'Your activity summary for last week is ready to view.', time: '2 days ago', read: true, icon: 'chart-line' },
];

export const MOCK_PLANS = [
  {
    id: 'plan_free',
    name: 'Free',
    price: '$0',
    period: '',
    tagline: 'Get started',
    features: ['Up to 20 records', 'Basic search & filters', 'Email support'],
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    price: '$14',
    period: '/mo',
    tagline: 'For individuals who mean business',
    features: ['Unlimited records', 'Advanced filters & saved views', 'Priority support', 'Offline sync', 'Export & sharing'],
    highlighted: true,
  },
  {
    id: 'plan_team',
    name: 'Team',
    price: '$39',
    period: '/mo',
    tagline: 'Shared workspace for teams',
    features: ['Everything in Pro', 'Up to 10 members', 'Role-based access', 'Audit log'],
  },
];

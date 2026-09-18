/**
 * Standard human-friendly formatting helpers for DigEzLife
 */

export function formatAmount(num) {
  const val = Math.abs(parseFloat(num) || 0);
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (val >= 100000) {
    return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return val.toLocaleString();
}

export function formatDate(dateInput, { includeYear = false, full = false } = {}) {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  if (full) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  const isCurrentYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(includeYear || !isCurrentYear ? { year: 'numeric' } : {}),
  });
}

export function formatDateTime(dateInput) {
  if (!dateInput) return 'N/A';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
}

export function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Recently';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Recently';

  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

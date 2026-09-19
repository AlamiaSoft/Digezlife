export let _confirmDialog = null;
export let _confirmResolver = null;

function initConfirmDialog() {
  if (_confirmDialog) return _confirmDialog;

  _confirmDialog = document.createElement('wa-dialog');
  _confirmDialog.id = 'app-shared-confirm-dialog';
  
  _confirmDialog.innerHTML = `
    <div id="app-confirm-message" style="margin-bottom: 1rem; line-height: 1.5;"></div>
    <div slot="footer" style="display:flex; justify-content:flex-end; gap:0.5rem;">
      <wa-button id="app-confirm-cancel">Cancel</wa-button>
      <wa-button id="app-confirm-action" variant="primary">Confirm</wa-button>
    </div>
  `;
  document.body.appendChild(_confirmDialog);

  const cancelBtn = _confirmDialog.querySelector('#app-confirm-cancel');
  const actionBtn = _confirmDialog.querySelector('#app-confirm-action');

  const closeAndResolve = (value) => {
    _confirmDialog.open = false;
    if (_confirmResolver) {
      _confirmResolver(value);
      _confirmResolver = null;
    }
  };

  cancelBtn.addEventListener('click', () => closeAndResolve(false));
  actionBtn.addEventListener('click', () => closeAndResolve(true));

  _confirmDialog.addEventListener('wa-after-hide', () => {
    if (_confirmResolver) {
      _confirmResolver(false);
      _confirmResolver = null;
    }
  });

  return _confirmDialog;
}

export function confirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary' }) {
  return new Promise((resolve) => {
    const dialog = initConfirmDialog();
    
    dialog.label = title || 'Confirm Action';
    dialog.querySelector('#app-confirm-message').innerHTML = message || '';
    
    const actionBtn = dialog.querySelector('#app-confirm-action');
    actionBtn.textContent = confirmText;
    actionBtn.variant = variant;
    
    const cancelBtn = dialog.querySelector('#app-confirm-cancel');
    cancelBtn.textContent = cancelText;

    _confirmResolver = resolve;
    
    // Use slight delay to allow WebAwesome components to initialize shadow DOM 
    // before modifying the "open" property, avoiding initialization crashes.
    setTimeout(() => {
      dialog.open = true;
    }, 10);
  });
}

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

export let _promptDialog = null;
export let _promptResolver = null;

function initPromptDialog() {
  if (_promptDialog) return _promptDialog;

  _promptDialog = document.createElement('wa-dialog');
  _promptDialog.id = 'app-shared-prompt-dialog';
  
  _promptDialog.innerHTML = `
    <div id="app-prompt-message" style="margin-bottom: 0.75rem; line-height: 1.5; font-size:0.9rem;"></div>
    <wa-input id="app-prompt-input" style="width:100%;"></wa-input>
    <div slot="footer" style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
      <wa-button id="app-prompt-cancel">Cancel</wa-button>
      <wa-button id="app-prompt-action" variant="brand">Save</wa-button>
    </div>
  `;
  document.body.appendChild(_promptDialog);

  const cancelBtn = _promptDialog.querySelector('#app-prompt-cancel');
  const actionBtn = _promptDialog.querySelector('#app-prompt-action');
  const inputEl = _promptDialog.querySelector('#app-prompt-input');

  const closeAndResolve = (value) => {
    _promptDialog.open = false;
    if (_promptResolver) {
      _promptResolver(value);
      _promptResolver = null;
    }
  };

  cancelBtn.addEventListener('click', () => closeAndResolve(null));
  actionBtn.addEventListener('click', () => {
    const val = inputEl?.value !== undefined ? inputEl.value : inputEl?.getAttribute('value') || '';
    closeAndResolve(String(val).trim());
  });

  _promptDialog.addEventListener('wa-after-hide', () => {
    if (_promptResolver) {
      _promptResolver(null);
      _promptResolver = null;
    }
  });

  return _promptDialog;
}

export function promptDialog({ title, message, defaultValue = '', placeholder = '', confirmText = 'Save', cancelText = 'Cancel' }) {
  return new Promise((resolve) => {
    const dialog = initPromptDialog();
    
    dialog.label = title || 'Input Required';
    dialog.querySelector('#app-prompt-message').innerHTML = message || '';
    
    const inputEl = dialog.querySelector('#app-prompt-input');
    if (inputEl) {
      inputEl.value = defaultValue;
      inputEl.placeholder = placeholder;
    }

    const actionBtn = dialog.querySelector('#app-prompt-action');
    actionBtn.textContent = confirmText;
    
    const cancelBtn = dialog.querySelector('#app-prompt-cancel');
    cancelBtn.textContent = cancelText;

    _promptResolver = resolve;
    
    setTimeout(() => {
      dialog.open = true;
      inputEl?.focus?.();
    }, 10);
  });
}


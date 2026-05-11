/* ─────────────────────────────────────────────
   My Diary – app.js
   Google Sign-In (Federated Identity) + LocalStorage
───────────────────────────────────────────── */

// ── DOM refs ──────────────────────────────────
const loginScreen   = document.getElementById('login-screen');
const appScreen     = document.getElementById('app-screen');
const userAvatar    = document.getElementById('user-avatar');
const userName      = document.getElementById('user-name');
const userEmail     = document.getElementById('user-email');
const newEntryBtn   = document.getElementById('new-entry-btn');
const logoutBtn     = document.getElementById('logout-btn');
const entriesList   = document.getElementById('entries-list');
const emptyState    = document.getElementById('empty-state');
const editorPanel   = document.getElementById('editor-panel');
const entryTitle    = document.getElementById('entry-title');
const entryBody     = document.getElementById('entry-body');
const entryDateDisp = document.getElementById('entry-date-display');
const saveBtn       = document.getElementById('save-btn');
const deleteBtn     = document.getElementById('delete-btn');

// ── State ─────────────────────────────────────
let currentUser   = null;   // { name, email, picture, sub }
let currentId     = null;   // id of the entry being edited (null = new)

// ── Toast helper ──────────────────────────────
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── JWT decode (no library needed) ────────────
function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// ── Google callback ───────────────────────────
window.handleCredentialResponse = function (response) {
  const payload = parseJwt(response.credential);
  if (!payload) { alert('Sign-in failed. Please try again.'); return; }

  currentUser = {
    sub:     payload.sub,
    name:    payload.name,
    email:   payload.email,
    picture: payload.picture,
  };

  // Persist session (credential token) so page refresh keeps user logged in
  localStorage.setItem('diary_session', JSON.stringify(currentUser));

  startApp();
};

// ── Session restore on page load ──────────────
function tryRestoreSession() {
  const saved = localStorage.getItem('diary_session');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      startApp();
      return true;
    } catch { /* ignore */ }
  }
  return false;
}

// ── Start the app after login ─────────────────
function startApp() {
  userAvatar.src   = currentUser.picture || '';
  userName.textContent  = currentUser.name;
  userEmail.textContent = currentUser.email;

  loginScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');

  renderEntriesList();
  showEmptyState();
}

// ── LocalStorage key per user ─────────────────
function storageKey() {
  return `diary_entries_${currentUser.sub}`;
}

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(storageKey())) || [];
  } catch { return []; }
}

function saveEntries(entries) {
  localStorage.setItem(storageKey(), JSON.stringify(entries));
}

// ── Render sidebar list ───────────────────────
function renderEntriesList() {
  const entries = loadEntries();
  entriesList.innerHTML = '';

  if (entries.length === 0) {
    entriesList.innerHTML = '<p style="color:#666;font-size:.8rem;padding:8px 4px;">No entries yet.</p>';
    return;
  }

  // Newest first
  [...entries].reverse().forEach(entry => {
    const item = document.createElement('div');
    item.className = 'entry-item';
    item.dataset.id = entry.id;
    if (entry.id === currentId) item.classList.add('active');

    item.innerHTML = `
      <div class="entry-item-title">${escapeHtml(entry.title || 'Untitled')}</div>
      <div class="entry-item-date">${formatDate(entry.updatedAt)}</div>
    `;
    item.addEventListener('click', () => openEntry(entry.id));
    entriesList.appendChild(item);
  });
}

// ── Show/hide editor vs empty state ──────────
function showEmptyState() {
  currentId = null;
  emptyState.classList.remove('hidden');
  editorPanel.classList.add('hidden');
  highlightActive();
}

function showEditor() {
  emptyState.classList.add('hidden');
  editorPanel.classList.remove('hidden');
}

// ── Open an existing entry ────────────────────
function openEntry(id) {
  const entries = loadEntries();
  const entry   = entries.find(e => e.id === id);
  if (!entry) return;

  currentId           = id;
  entryTitle.value    = entry.title || '';
  entryBody.value     = entry.body  || '';
  entryDateDisp.textContent = formatDate(entry.updatedAt);

  showEditor();
  highlightActive();
}

// ── New entry ─────────────────────────────────
newEntryBtn.addEventListener('click', () => {
  currentId           = null;
  entryTitle.value    = '';
  entryBody.value     = '';
  entryDateDisp.textContent = formatDate(Date.now());

  showEditor();
  highlightActive();
  entryTitle.focus();
});

// ── Save entry ────────────────────────────────
saveBtn.addEventListener('click', saveCurrentEntry);

function saveCurrentEntry() {
  const title = entryTitle.value.trim();
  const body  = entryBody.value.trim();

  if (!title && !body) {
    showToast('Nothing to save — write something first.');
    return;
  }

  const entries = loadEntries();
  const now     = Date.now();

  if (currentId) {
    // Update existing
    const idx = entries.findIndex(e => e.id === currentId);
    if (idx !== -1) {
      entries[idx].title     = title;
      entries[idx].body      = body;
      entries[idx].updatedAt = now;
    }
  } else {
    // Create new
    const newEntry = {
      id:        generateId(),
      title:     title,
      body:      body,
      createdAt: now,
      updatedAt: now,
    };
    currentId = newEntry.id;
    entries.push(newEntry);
  }

  saveEntries(entries);
  entryDateDisp.textContent = formatDate(now);
  renderEntriesList();
  showToast('Entry saved ✓');
}

// ── Delete entry ──────────────────────────────
deleteBtn.addEventListener('click', () => {
  if (!currentId) { showEmptyState(); return; }

  if (!confirm('Delete this entry? This cannot be undone.')) return;

  const entries = loadEntries().filter(e => e.id !== currentId);
  saveEntries(entries);
  renderEntriesList();
  showEmptyState();
  showToast('Entry deleted.');
});

// ── Logout ────────────────────────────────────
logoutBtn.addEventListener('click', () => {
  // Revoke Google session
  if (window.google && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
  localStorage.removeItem('diary_session');
  currentUser = null;
  currentId   = null;

  appScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
});

// ── Helpers ───────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function highlightActive() {
  document.querySelectorAll('.entry-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === currentId);
  });
}

// ── Auto-save on Ctrl+S ───────────────────────
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    if (!editorPanel.classList.contains('hidden')) saveCurrentEntry();
  }
});

// ── Boot ──────────────────────────────────────
tryRestoreSession();

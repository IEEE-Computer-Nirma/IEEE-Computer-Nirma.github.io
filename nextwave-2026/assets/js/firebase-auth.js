import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { auth } from './firebase-config.js';

const loginShell = document.getElementById('login-shell');
const leadsShell = document.getElementById('leads-shell');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('login-error');
const signOutBtn = document.getElementById('sign-out-btn');
const whoEl = document.getElementById('leads-who');

function show(el) { if (el) el.style.display = ''; }
function hide(el) { if (el) el.style.display = 'none'; }

onAuthStateChanged(auth, (user) => {
  if (user) {
    hide(loginShell);
    show(leadsShell);
    if (whoEl) whoEl.textContent = `Signed in as ${user.email}`;
    document.dispatchEvent(new CustomEvent('leads:authed'));
  } else {
    show(loginShell);
    hide(leadsShell);
  }
});

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';
    const email = loginForm.querySelector('#login-email').value.trim();
    const password = loginForm.querySelector('#login-password').value;
    const btn = loginForm.querySelector('button[type="submit"]');
    const originalLabel = btn.textContent;
    btn.textContent = 'Signing in…';
    btn.disabled = true;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      loginError.textContent = 'Invalid email or password.';
      loginError.style.display = 'block';
    } finally {
      btn.textContent = originalLabel;
      btn.disabled = false;
    }
  });
}

if (signOutBtn) {
  signOutBtn.addEventListener('click', () => signOut(auth));
}

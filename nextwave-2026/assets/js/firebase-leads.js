import { collection, query, where, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { db, CLIENT_ID } from './firebase-config.js';

async function loadSubmissions() {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Loading…</td></tr>';

  try {
    const q = query(
      collection(db, 'submissions'),
      where('clientId', '==', CLIENT_ID),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No submissions yet.</td></tr>';
      return;
    }

    tbody.innerHTML = '';

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.timestamp ? data.timestamp.toDate().toLocaleString() : 'N/A';
      const email = data.email && data.email !== 'N/A'
        ? `<br><small class="text-muted">${escapeHtml(data.email)}</small>` : '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="white-space: nowrap;">${date}</td>
        <td><span class="badge">${escapeHtml(data.type || 'contact')}</span></td>
        <td style="font-weight: 500;">${escapeHtml(data.name || 'N/A')}${email}</td>
        <td>${escapeHtml(data.phone || 'N/A')}</td>
        <td>${escapeHtml(data.company || data.organization || '—')}</td>
        <td>${escapeHtml(data.message || data.bio || data.talkTitle || '—')}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error loading submissions: ', error);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading data: ${escapeHtml(error.message)}</td></tr>`;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// Only pull data once Firebase Auth confirms a signed-in user (see firebase-auth.js).
document.addEventListener('leads:authed', loadSubmissions);

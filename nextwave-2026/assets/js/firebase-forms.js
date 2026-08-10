import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { db, CLIENT_ID } from './firebase-config.js';

/**
 * Wires a <form> to Firestore.
 * @param {string} formId     - id of the <form> element
 * @param {string} type       - 'contact' | 'speaker' | 'sponsor'
 * @param {string} sourceLabel - human readable label stored on the doc
 */
function wireForm(formId, type, sourceLabel) {
  const form = document.getElementById(formId);
  if (!form) return;

  const statusEl = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (statusEl) {
      statusEl.className = 'form-status';
      statusEl.textContent = '';
    }

    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    try {
      const data = { clientId: CLIENT_ID, type, source: sourceLabel, timestamp: serverTimestamp() };

      new FormData(form).forEach((value, key) => {
        data[key] = typeof value === 'string' ? value.trim() : value;
      });

      await addDoc(collection(db, 'submissions'), data);

      form.reset();
      if (statusEl) {
        statusEl.className = 'form-status success';
        statusEl.textContent = "Thanks — we've received your submission. We'll get back to you shortly.";
      }
    } catch (error) {
      console.error(`Error submitting ${type} form:`, error);
      if (statusEl) {
        statusEl.className = 'form-status error';
        statusEl.textContent = 'Something went wrong sending this. Please try again in a moment.';
      }
    } finally {
      submitBtn.textContent = originalLabel;
      submitBtn.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  wireForm('contactForm', 'contact', 'Contact Page');
  wireForm('speakerForm', 'speaker', 'Speaker Form');
  wireForm('sponsorForm', 'sponsor', 'Sponsorship Form');
});

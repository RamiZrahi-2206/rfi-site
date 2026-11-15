/*
  The demo form stays on the page.
  The kit's system.js checks the fields and shows the Hebrew errors. This script only sends a form whose
  fields are valid, through FormSubmit's AJAX address (data-ajax on the form), and reads FormSubmit's
  answer: "sent" is shown only when FormSubmit says success, never on a bare HTTP 200 (before the form is
  activated FormSubmit answers 200 with success "false"). While it sends, the button is held, so a double
  click sends once. A failure keeps everything typed. Without script the form still posts the plain way
  (its action and _next).
*/
const form = document.querySelector('form[data-ajax]');
if (form) {
  const status = form.querySelector('[data-form-status]');
  const button = form.querySelector('[type="submit"]');
  const say = text => { if (status) status.textContent = text; };
  let sending = false;

  form.addEventListener('submit', async e => {
    if (!form.checkValidity()) return;          // system.js shows the errors
    e.preventDefault();
    if (sending) return;
    sending = true;
    const wait = setTimeout(() => say(form.dataset.sending), 300);
    if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
    try {
      const res = await fetch(form.dataset.ajax, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.ok && (data.success === true || data.success === 'true');
      clearTimeout(wait);
      if (ok) {
        form.reset();
        say(form.dataset.sent);
      } else if (/activat/i.test(String(data.message || ''))) {
        say(form.dataset.inactive);
      } else {
        say(form.dataset.failed);
      }
    } catch {
      clearTimeout(wait);
      say(form.dataset.failed);
    } finally {
      sending = false;
      if (button) { button.disabled = false; button.removeAttribute('aria-busy'); }
    }
  }, { capture: true });
}

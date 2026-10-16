(() => {
  const button = document.querySelector('[data-copy-email]');
  const link = document.querySelector('#contact-email-address');
  const status = document.querySelector('#email-copy-status');
  const fallback = document.querySelector('#email-copy-fallback');
  const input = document.querySelector('#email-copy-address');
  if (!button || !link || !status || !fallback || !input) return;

  const address = link.textContent.trim();
  input.value = address;
  button.hidden = false;
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = '';
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error('Clipboard access unavailable');
      }
      await navigator.clipboard.writeText(address);
      fallback.hidden = true;
      button.textContent = 'Copied!';
      status.textContent = 'Email address copied.';
    } catch {
      button.textContent = 'Copy email';
      fallback.hidden = false;
      status.textContent = 'Please select and copy the email address below.';
      input.focus();
      input.select();
    } finally {
      button.disabled = false;
    }
  });
})();

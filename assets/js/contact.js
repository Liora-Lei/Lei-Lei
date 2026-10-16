(() => {
  const button = document.querySelector('[data-copy-email]');
  const label = document.querySelector('#email-copy-label');
  const link = document.querySelector('#contact-email-address');
  const status = document.querySelector('#email-copy-status');
  const fallback = document.querySelector('#email-copy-fallback');
  const input = document.querySelector('#email-copy-address');
  if (!button || !label || !link || !status || !fallback || !input) return;

  const address = link.textContent.trim();
  input.value = address;
  button.hidden = false;
  button.addEventListener('click', async event => {
    button.disabled = true;
    status.textContent = '';
    status.classList.add('visually-hidden');
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error('Clipboard access unavailable');
      }
      await navigator.clipboard.writeText(address);
      fallback.hidden = true;
      label.textContent = 'Copied!';
      status.textContent = 'Email address copied.';
    } catch {
      label.textContent = 'Copy email';
      fallback.hidden = false;
      status.textContent = 'Please select and copy the email address below.';
      status.classList.remove('visually-hidden');
      input.focus();
      input.select();
    } finally {
      button.disabled = false;
      if (event.detail > 0 && fallback.hidden) button.blur();
    }
  });
})();

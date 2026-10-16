(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  if (header) {
    // Keep anchor destinations below the navigation, including wrapped mobile menus.
    const updateHeaderHeight = () => root.style.setProperty('--site-header-height', header.getBoundingClientRect().height + 'px');
    updateHeaderHeight();
    new ResizeObserver(updateHeaderHeight).observe(header);
  }
  const theme = document.querySelector('.theme-button');
  function setTheme(value) {
    root.dataset.theme = value;
    theme.setAttribute('aria-label', value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    theme.setAttribute('aria-pressed', String(value === 'dark'));
    theme.querySelector('i').className = value === 'dark' ? 'theme-sun' : 'fas fa-moon';
  }
  let saved;
  try { saved = localStorage.getItem('lei-editorial-theme'); } catch (_) {}
  setTheme(saved === 'dark' ? 'dark' : 'light');
  theme.addEventListener('click', () => {
    const value = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(value);
    try { localStorage.setItem('lei-editorial-theme', value); } catch (_) {}
  });
})();

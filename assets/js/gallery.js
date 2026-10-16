(() => {
  const data = document.querySelector('#gallery-data');
  const dialog = document.querySelector('#gallery-lightbox');
  if (!data || !dialog) return;
  const groups = new Map(JSON.parse(data.textContent).map(group => [group.id, group]));
  const image = dialog.querySelector('.lightbox-image');
  const stage = dialog.querySelector('.lightbox-stage');
  const caption = dialog.querySelector('.lightbox-caption');
  const counter = dialog.querySelector('.lightbox-counter');
  const strip = dialog.querySelector('.lightbox-thumbnails');
  const previous = dialog.querySelector('.lightbox-previous');
  const next = dialog.querySelector('.lightbox-next');
  const thumbPrevious = dialog.querySelector('[data-strip="previous"]');
  const thumbNext = dialog.querySelector('[data-strip="next"]');
  const close = dialog.querySelector('.lightbox-close');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let group, current = 0, opener, gestureStart, openedFromKeyboard = false;

  function updateStripButtons() {
    thumbPrevious.disabled = strip.scrollLeft <= 1;
    thumbNext.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1;
  }

  function revealThumbnail(button) {
    strip.scrollTo({left:button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2,
      behavior:reducedMotion.matches ? 'auto' : 'smooth'});
    requestAnimationFrame(updateStripButtons);
  }

  function setPhoto(index) {
    if (!group || index < 0 || index >= group.photos.length) return;
    current = index;
    const photo = group.photos[index];
    stage.setAttribute('aria-busy', 'true');
    image.alt = group.title + ' — photo ' + (index + 1) + ' of ' + group.photos.length;
    image.src = photo.full;
    if (image.complete && image.naturalWidth) stage.setAttribute('aria-busy', 'false');
    caption.textContent = group.title;
    counter.textContent = (index + 1) + ' / ' + group.photos.length;
    previous.disabled = index === 0;
    next.disabled = index === group.photos.length - 1;
    Array.from(strip.children).forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    revealThumbnail(strip.children[index]);
    // Full images load on demand; prepare only the adjacent photos.
    [index - 1, index + 1].forEach(i => {
      if (group.photos[i]) { const preload = new Image(); preload.src = group.photos[i].full; }
    });
  }

  function openGallery(button, fromKeyboard) {
    group = groups.get(button.dataset.group);
    if (!group) return;
    opener = button;
    openedFromKeyboard = fromKeyboard;
    button.classList.remove('gallery-pointer-return');
    strip.replaceChildren();
    group.photos.forEach((photo, index) => {
      const thumbnail = document.createElement('button');
      thumbnail.type = 'button';
      thumbnail.className = 'lightbox-thumbnail';
      thumbnail.setAttribute('aria-label', 'View photo ' + (index + 1) + ' of ' + group.photos.length);
      const thumbImage = document.createElement('img');
      thumbImage.src = photo.thumb;
      thumbImage.alt = '';
      thumbImage.width = 60;
      thumbImage.height = 72;
      thumbImage.decoding = 'async';
      thumbnail.append(thumbImage);
      thumbnail.addEventListener('click', () => setPhoto(index));
      strip.append(thumbnail);
    });
    document.body.classList.add('gallery-open');
    dialog.showModal();
    setPhoto(Number(button.dataset.photo || 0));
    close.focus({preventScroll:true});
  }

  document.querySelectorAll('[data-gallery-open]').forEach(button => {
    button.addEventListener('click', event => openGallery(button, event.detail === 0));
    button.addEventListener('blur', () => button.classList.remove('gallery-pointer-return'));
  });
  // Keep the returned focus position without drawing a photo border after a pointer click.
  // A real keyboard action restores the normal keyboard focus indicator.
  document.addEventListener('keydown', () => {
    document.querySelectorAll('.gallery-pointer-return').forEach(button => button.classList.remove('gallery-pointer-return'));
  }, {capture:true});
  image.addEventListener('load', () => stage.setAttribute('aria-busy', 'false'));
  image.addEventListener('error', () => {
    stage.setAttribute('aria-busy', 'false');
    image.alt = 'This photo could not load. Please try the previous or next photo.';
  });
  previous.addEventListener('click', () => setPhoto(current - 1));
  next.addEventListener('click', () => setPhoto(current + 1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target === stage) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('gallery-open');
    stage.setAttribute('aria-busy', 'false');
    if (opener && opener.isConnected) {
      opener.classList.toggle('gallery-pointer-return', !openedFromKeyboard);
      opener.focus({preventScroll:true});
    }
  });
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); setPhoto(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); setPhoto(current + 1); }
  });
  strip.addEventListener('scroll', updateStripButtons, {passive:true});
  thumbPrevious.addEventListener('click', () => strip.scrollBy({left:-strip.clientWidth * .7,
    behavior:reducedMotion.matches ? 'auto' : 'smooth'}));
  thumbNext.addEventListener('click', () => strip.scrollBy({left:strip.clientWidth * .7,
    behavior:reducedMotion.matches ? 'auto' : 'smooth'}));
  window.addEventListener('resize', () => { if (dialog.open) updateStripButtons(); });
  image.draggable = false;
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || event.target.closest('button')) return;
    gestureStart = {id:event.pointerId,x:event.clientX,y:event.clientY};
  }, {passive:true});
  stage.addEventListener('pointerup', event => {
    if (!gestureStart || event.pointerId !== gestureStart.id) return;
    const dx = event.clientX - gestureStart.x;
    const dy = event.clientY - gestureStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) setPhoto(current + (dx < 0 ? 1 : -1));
    gestureStart = null;
  }, {passive:true});
  stage.addEventListener('pointercancel', () => { gestureStart = null; }, {passive:true});
})();

// Paneya desktop v0.4 — draggable, persistent VT100 terminal.
(() => {
  const terminal = document.querySelector('.terminal');
  if (!terminal) return;
  const bar = terminal.querySelector('.bar');
  if (!bar) return;

  terminal.classList.add('floating-terminal');
  bar.classList.add('terminal-drag-handle');
  bar.title = 'Drag to move terminal';

  const mobile = () => window.matchMedia('(max-width: 600px)').matches;
  const oldKey = mobile() ? 'paneya-terminal-position-mobile-v05' : 'paneya-terminal-position-v04';
  const key = mobile() ? 'paneya-terminal-position-mobile-v06' : 'paneya-terminal-position-v06';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
  const fit = (x, y) => ({
    x: clamp(x, 0, Math.max(0, window.innerWidth - Math.min(terminal.offsetWidth, 120))),
    y: clamp(y, 0, Math.max(0, window.innerHeight - Math.min(terminal.offsetHeight, 60)))
  });
  const place = (x, y) => {
    const p = fit(x, y);
    terminal.style.left = `${p.x}px`;
    terminal.style.top = `${p.y}px`;
    terminal.style.right = 'auto';
    terminal.style.bottom = 'auto';
  };

  let stored;
  try { stored = JSON.parse(localStorage.getItem(key)); } catch (_) {}
  if (!stored) {
    // One-time migration: retain the previous horizontal position and
    // lower the terminal by roughly three lines of 16px terminal text.
    try {
      const previous = JSON.parse(localStorage.getItem(oldKey));
      if (previous && Number.isFinite(previous.y)) {
        stored = { x: previous.x, y: previous.y + 72 };
        localStorage.setItem(key, JSON.stringify(stored));
      }
    } catch (_) {}
  }
  const defaultX = Math.max(16, window.innerWidth - Math.min(560, window.innerWidth - 32) - 24);
  const defaultY = mobile() ? 162 : 172;
  place(Number.isFinite(stored?.x) ? stored.x : defaultX,
        Number.isFinite(stored?.y) ? stored.y : defaultY);

  let drag = null;
  bar.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const rect = terminal.getBoundingClientRect();
    drag = { pointerId: event.pointerId, dx: event.clientX - rect.left,
             dy: event.clientY - rect.top };
    bar.setPointerCapture(event.pointerId);
    terminal.style.zIndex = mobile() ? '1000' : '9999';
    event.preventDefault();
  });
  bar.addEventListener('pointermove', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    place(event.clientX - drag.dx, event.clientY - drag.dy);
  });
  const finish = () => {
    if (!drag) return;
    drag = null;
    localStorage.setItem(key, JSON.stringify({
      x: parseFloat(terminal.style.left), y: parseFloat(terminal.style.top)
    }));
  };
  bar.addEventListener('pointerup', finish);
  bar.addEventListener('pointercancel', finish);
  // Mobile browser chrome changes the visual viewport as Webamp opens.
  // Never reposition the terminal on those resize events.
  window.addEventListener('resize', () => {
    if (mobile()) return;
    const rect = terminal.getBoundingClientRect();
    place(rect.left, rect.top);
  });
})();

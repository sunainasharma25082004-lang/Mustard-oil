const HEADER_OFFSET = 80;

export function scrollToSection(id, { behavior = 'smooth', maxAttempts = 24, delayMs = 120 } = {}) {
  if (!id) return () => {};

  let attempts = 0;
  let timerId = null;

  const tryScroll = () => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior });
      return;
    }

    attempts += 1;
    if (attempts < maxAttempts) {
      timerId = window.setTimeout(tryScroll, delayMs);
    }
  };

  tryScroll();

  return () => {
    if (timerId) window.clearTimeout(timerId);
  };
}
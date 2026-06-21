const PREFIX = 'karyor_cache:';

export function readCache(key, maxAgeMs = 5 * 60 * 1000) {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${key}`);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > maxAgeMs) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeCache(key, data) {
  try {
    sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function clearCache(key) {
  try {
    sessionStorage.removeItem(`${PREFIX}${key}`);
  } catch {
    /* ignore */
  }
}
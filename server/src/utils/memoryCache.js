const store = new Map();

const getEntry = (key, ttlMs) => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) {
    store.delete(key);
    return null;
  }
  return entry.data;
};

const cached = async (key, ttlMs, loader) => {
  const hit = getEntry(key, ttlMs);
  if (hit !== null) return hit;

  const data = await loader();
  store.set(key, { ts: Date.now(), data });
  return data;
};

const bust = (prefix) => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
};

module.exports = { cached, bust };
const portalTargets = new Map<string, Element | null>();
const portalListeners = new Map<string, Set<(el: Element | null) => void>>();

export const setPortalTarget = (id: string, el: Element | null) => {
  portalTargets.set(id, el);
  const listeners = portalListeners.get(id);
  if (listeners) {
    listeners.forEach((fn) => fn(el));
  }
};

export const subscribePortalTarget = (
  id: string,
  fn: (el: Element | null) => void,
) => {
  let listeners = portalListeners.get(id);
  if (!listeners) {
    listeners = new Set();
    portalListeners.set(id, listeners);
  }
  listeners.add(fn);
  fn(portalTargets.get(id) || null);
  return () => {
    listeners?.delete(fn);
  };
};

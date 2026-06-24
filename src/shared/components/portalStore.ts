export let globalPortalTarget: Element | null = null;
const portalListeners = new Set<(el: Element | null) => void>();

export const setGlobalPortalTarget = (el: Element | null) => {
  globalPortalTarget = el;
  portalListeners.forEach((fn) => fn(el));
};

export const subscribePortalTarget = (fn: (el: Element | null) => void) => {
  portalListeners.add(fn);
  fn(globalPortalTarget);
  return () => {
    portalListeners.delete(fn);
  };
};

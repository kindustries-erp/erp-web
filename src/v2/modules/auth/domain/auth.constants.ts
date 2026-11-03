export const EMAIL_VALIDATION_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LOCALHOST_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "elite-liouni",
  "head-liouni",
]);

export function isLocalEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  return LOCALHOST_HOSTNAMES.has(window.location.hostname);
}

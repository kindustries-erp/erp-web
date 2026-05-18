const inflightRequests = new Map<string, Promise<unknown>>();

export function dedupeRequest<T>(
  key: string,
  request: () => Promise<T>,
): Promise<T> {
  const existing = inflightRequests.get(key);
  if (existing) return existing as Promise<T>;

  const promise = request().finally(() => {
    inflightRequests.delete(key);
  });
  inflightRequests.set(key, promise);
  return promise;
}

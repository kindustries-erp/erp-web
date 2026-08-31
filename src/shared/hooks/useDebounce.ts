import { useEffect, useState } from "react";
import { DEFAULT_DEBOUNCE_TIME } from "@/shared/constants/timing";

/**
 * Returns a debounced version of `value` that only updates after `delay` ms of inactivity.
 * Mặc định delay = 500ms (DEFAULT_DEBOUNCE_TIME).
 */
export function useDebounce<T>(value: T, delay = DEFAULT_DEBOUNCE_TIME): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

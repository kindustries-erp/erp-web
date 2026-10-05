import { useState, useCallback } from "react";

/**
 * Lightweight controlled / uncontrolled tab synchronization hook
 */
export function useTabControl(
  controlled?: string,
  fallback?: string,
  onChange?: (k: string) => void,
): readonly [string, (k: string) => void] {
  const [internal, setInternal] = useState(fallback || "");
  const activeKey = controlled !== undefined ? controlled : internal;

  const handleChange = useCallback(
    (k: string) => {
      if (controlled === undefined) setInternal(k);
      onChange?.(k);
    },
    [controlled, onChange],
  );

  return [activeKey, handleChange] as const;
}

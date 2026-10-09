import { useCallback, useEffect, useRef, useState } from "react";

interface UseV2SearchInputParams {
  value: string;
  onChange: (text: string) => void;
  debounceMs: number;
}

/** Giữ bản nháp khi gõ, chỉ báo lên ngoài sau `debounceMs` hoặc khi commit ngay */
export function useV2SearchInput({
  value,
  onChange,
  debounceMs,
}: UseV2SearchInputParams) {
  const [draft, setDraft] = useState(value);
  const committed = useRef(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    committed.current = value;
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === committed.current) return;
    const timer = setTimeout(() => {
      committed.current = draft;
      onChangeRef.current(draft);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [draft, debounceMs]);

  const commit = useCallback((text: string) => {
    committed.current = text;
    setDraft(text);
    onChangeRef.current(text);
  }, []);

  return { draft, setDraft, commit };
}

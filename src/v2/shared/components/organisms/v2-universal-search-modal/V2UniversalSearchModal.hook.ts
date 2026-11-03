import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { normalizeSearchText } from "@/v2/shared/components/molecules/v2-combobox";
import type { V2SearchItem } from "./V2UniversalSearchModal.type";

interface UseV2UniversalSearchOptions {
  items: V2SearchItem[];
  open: boolean;
  onClose: () => void;
  onSelect: (item: V2SearchItem) => void;
}

export function useV2UniversalSearch({
  items,
  open,
  onClose,
  onSelect,
}: UseV2UniversalSearchOptions) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const raw = query.trim();
    if (!raw) return items;
    const sq = normalizeSearchText(raw);
    const terms = sq.split(/\s+/).filter(Boolean);

    return items.filter((item) => {
      const titleNorm = normalizeSearchText(item.title);
      const categoryNorm = item.category
        ? normalizeSearchText(item.category)
        : "";
      const groupNorm = item.group ? normalizeSearchText(item.group) : "";
      const keywordsNorm = item.keywords
        ? item.keywords.map(normalizeSearchText).join(" ")
        : "";

      const searchableBlob = `${titleNorm} ${categoryNorm} ${groupNorm} ${keywordsNorm}`;
      return terms.every((term) => searchableBlob.includes(term));
    });
  }, [query, items]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSelect = useCallback(
    (item: V2SearchItem) => {
      onSelect(item);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + results.length) % results.length,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    },
    [results, selectedIndex, handleSelect],
  );

  return {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    handleSelect,
    inputRef,
  };
}

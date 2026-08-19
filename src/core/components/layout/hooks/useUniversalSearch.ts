import { useState, useMemo, useEffect, useCallback } from "react";
import type { NavSearchItem } from "./useNavItems";
import type { PageKey } from "@/shared/types";

export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function useUniversalSearch(
  allItems: NavSearchItem[],
  onSelect: (key: PageKey) => void,
) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo(() => {
    const raw = query.trim();
    if (!raw) return allItems;
    const sq = normalizeSearchText(raw);
    const terms = sq.split(/\s+/).filter(Boolean);

    return allItems.filter((item) => {
      const labelNorm = normalizeSearchText(item.label);
      const groupNorm = item.group ? normalizeSearchText(item.group) : "";
      const sectionNorm = normalizeSearchText(item.section);
      const keywordsNorm = item.keywords
        ? item.keywords.map(normalizeSearchText).join(" ")
        : "";

      const searchableBlob = `${labelNorm} ${groupNorm} ${sectionNorm} ${keywordsNorm}`;

      return terms.every((term) => searchableBlob.includes(term));
    });
  }, [query, allItems]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

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
          onSelect(selected.key);
        }
      }
    },
    [results, selectedIndex, onSelect],
  );

  return {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
  };
}

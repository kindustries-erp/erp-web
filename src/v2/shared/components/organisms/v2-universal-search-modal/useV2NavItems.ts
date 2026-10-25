import { useMemo } from "react";
import { useNavItems } from "@/core/components/layout/hooks/useNavItems";
import type { V2SearchItem } from "./V2UniversalSearchModal.type";

export function useV2NavItems(): V2SearchItem[] {
  const navItems = useNavItems();

  return useMemo(
    () =>
      navItems.map((item) => ({
        id: item.key,
        title: item.label,
        category: item.section,
        group: item.group,
        keywords: item.keywords,
        icon: item.icon,
      })),
    [navItems],
  );
}

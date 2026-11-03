import {
  type V2SidebarNavItem,
  type V2SidebarSectionData,
} from "@/v2/shared/components";
import { MAX_PINNED_MOBILE_NAV } from "@/v2/shared/stores/useV2MobileNavStore";

export const PREFERRED_DEFAULT_NAV_IDS = [
  // 1. Phân hệ Garage (dành cho tenant chuyên garage)
  "garage-cases",
  "garage-debts",
  // 2. Kế toán & Dòng tiền (luôn ưu tiên cốt lõi)
  "cashflow",
  "erp-invoices",
  "invoices",
  // 3. Nghiệp vụ vận hành (dành cho tenant sản xuất/thương mại như Greenway)
  "erp-sales-orders",
  "sales-orders",
  "purchasing",
  "purchasing-orders",
  "erp-inventory-stock",
  "inventory-stock",
];

export function extractAllAvailableItems(
  sections: V2SidebarSectionData[],
): V2SidebarNavItem[] {
  const list: V2SidebarNavItem[] = [];
  const addItem = (it: V2SidebarNavItem) => {
    if (!list.some((existing) => existing.id === it.id)) {
      list.push(it);
    }
  };

  sections.forEach((sec) => {
    sec.items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        item.children.forEach(addItem);
      } else {
        addItem(item);
      }
    });
  });
  return list;
}

export function filterSectionsByQuery(
  sections: V2SidebarSectionData[],
  query: string,
): V2SidebarSectionData[] {
  if (!query.trim()) return sections;
  const q = query.toLowerCase().trim();

  return sections
    .map((sec) => {
      const matchingItems = sec.items.filter((item) => {
        const matchLabel = item.label.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        return matchLabel || matchId;
      });
      const matchSecLabel = sec.label
        ? sec.label.toLowerCase().includes(q)
        : false;
      if (matchingItems.length === 0 && !matchSecLabel) return null;
      return {
        ...sec,
        items: matchingItems.length > 0 ? matchingItems : sec.items,
      };
    })
    .filter(Boolean) as V2SidebarSectionData[];
}

export function resolveDefault4Items(
  allItems: V2SidebarNavItem[],
): V2SidebarNavItem[] {
  const list: V2SidebarNavItem[] = [];

  for (const prefId of PREFERRED_DEFAULT_NAV_IDS) {
    if (list.length >= MAX_PINNED_MOBILE_NAV) break;
    const found = allItems.find((it) => it.id === prefId);
    if (found && !list.some((it) => it.id === found.id)) {
      list.push(found);
    }
  }

  if (list.length < MAX_PINNED_MOBILE_NAV) {
    for (const item of allItems) {
      const isSubDashboard =
        item.id !== "dashboard" && item.id.includes("dashboard");
      if (!list.some((it) => it.id === item.id) && !isSubDashboard) {
        list.push(item);
      }
      if (list.length >= MAX_PINNED_MOBILE_NAV) break;
    }
  }

  return list;
}

export function resolveBottomActiveId(
  effectiveNavItems: V2SidebarNavItem[],
  activeNavId: string,
  effectiveSections: V2SidebarSectionData[],
): string {
  if (effectiveNavItems.some((item) => item.id === activeNavId)) {
    return activeNavId;
  }
  const parentSection = effectiveSections.find((sec) =>
    sec.items.some((item) => item.id === activeNavId),
  );
  if (parentSection) {
    const matched = effectiveNavItems.find(
      (item) =>
        parentSection.items.some((secItem) => secItem.id === item.id) ||
        item.label === parentSection.label,
    );
    if (matched) return matched.id;
  }
  return "catalog";
}
